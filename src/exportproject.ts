// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { join } from 'path';

function helloWorld() {
	if (vscode.workspace.workspaceFolders !== undefined) {

		// The code you place here will be executed every time your command is executed
		console.log('project root =', vscode.workspace.workspaceFolders[0]);
		if (vscode.workspace.workspaceFolders.length > 1) {
			let str: string = '';
			vscode.workspace.workspaceFolders.forEach(element => {
				str += element.name + ', ';
			});
			vscode.window.showWarningMessage('Workspace had more than one folder: ', str.substr(0, str.length - 2));

		}
	}

	// Display a message box to the user
	vscode.window.showInformationMessage('Hello World!');
}

const sourceFiles: string[] = ['txt', 'java', 'ini', 'bat', 'gitignore'];

function writeAllToTXT(dir: string[], fd: number, prjpath: string, basepath: string = '') {
	let files: string[] = [];
	dir.forEach(element => {
		let stats: fs.Stats;
		try {
			stats = fs.lstatSync(join(prjpath, basepath, element));
		} catch (ex) {
			console.warn("Cannot get lstats of", element);
			return;
		}
		if (stats.isDirectory()) {
			writeAllToTXT(fs.readdirSync(join(prjpath, basepath, element)), fd, prjpath, basepath + element + '/');
		} else {
			// if (!element.endsWith('.txt')) {
			if (sourceFiles.includes(element.substring(element.lastIndexOf('.') + 1, element.length))) {
				files.push(element);
			} else {
				console.log('ignoring non-source-code file:', join(basepath, element));
			}
			// } else {
			// console.log('ignoring txt file:', join(basepath, element));
			// }
		}
	});
	files.forEach(element => {
		fs.writeSync(fd, '----------------------------' + join(basepath, element) + '----------------------------\n\r');
		fs.writeSync(fd, fs.readFileSync(join(prjpath, basepath, element)));
		fs.writeSync(fd, '\n\r\n\r');
	});
}

function exportToTXT() {
	let fd: number = -1;
	try {
		let prj_root: string;
		if (vscode.workspace.workspaceFolders !== undefined) {
			prj_root = vscode.workspace.workspaceFolders[0].uri.fsPath;
		} else {
			vscode.window.showErrorMessage('Cannot identify workspace directory');
			return;
		}
		fd = fs.openSync(prj_root + '/output.txt', 'w');
		let dir = fs.readdirSync(prj_root);
		writeAllToTXT(dir, fd, prj_root);
	} catch (ex) {
		vscode.window.showErrorMessage('Export has failed');
		console.error(ex);
	} finally {
		if (fd !== -1) {
			fs.closeSync(fd);
		}
	}

}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Extension "exportproject" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(vscode.commands.registerCommand('exportproject.helloWorld', helloWorld));
	context.subscriptions.push(vscode.commands.registerCommand('exportproject.exportToTXT', exportToTXT));
}

// this method is called when your extension is deactivated
export function deactivate() { }
