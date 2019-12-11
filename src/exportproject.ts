// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { join } from 'path';
import * as pdf from 'pdfkit';

const output_name = 'export_output';

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

function writeAllToFileType(basepath: string, prjpath: string,
	fileType: {
		addHeader(header: string): void,
		addBody(body: string): void,
		nextFile(): void,
		writeToFile(filename: string): void
	}, filename: string) {
	let files: string[] = [];
	fs.readdirSync(join(prjpath, basepath)).forEach(element => {
		try {
			var stats = fs.lstatSync(join(prjpath, basepath, element));
		} catch (ex) {
			console.warn("Cannot get lstats of", element);
			return;
		}
		if (stats.isDirectory()) {
			writeAllToFileType(join(basepath, element), prjpath, fileType, filename);
		} else {
			// console.log(element.slice(0, element.lastIndexOf('.')) + ' === ' + output_name.slice(0, output_name.lastIndexOf('.')));
			if (!(basepath === '' && element.slice(0, element.lastIndexOf('.')) === output_name)) {
				if (sourceFiles.includes(element.slice(element.lastIndexOf('.') + 1, element.length))) {
					files.push(element);
				} else {
					console.log('ignoring non-source-code file:', join(basepath, element));
				}
			}
		}
	});
	let is_first = true;
	files.forEach(element => {
		if (is_first) {
			is_first = false;
		} else {
			fileType.nextFile();
		}
		fileType.addHeader(join(basepath, element));
		fileType.addBody(fs.readFileSync(join(prjpath, basepath, element)).toString());
	});
	fileType.writeToFile(filename);
}

function writeAllToTXT(prjpath: string, filename: string = output_name) {
	let buf: string[] = [];
	writeAllToFileType('', prjpath, new class {
		public addHeader(header: string) {
			buf.push('----------------------------' + header + '----------------------------\n\r');
		}
		public addBody(body: string) {
			buf.push(body);
		}
		public nextFile() {
			buf.push('\n\r\n\r');
		}
		public writeToFile(filename: string) {
			fs.writeFileSync(join(prjpath, filename + '.txt'), buf.join(''));
		}
	}, filename);
}

function writeAllToHTML(prjpath: string, filename: string = output_name) {
	let buf: string[] = [];
	writeAllToFileType('', prjpath, new class {
		public addHeader(header: string) {
			buf.push('<h3>----------------------------' + header + '----------------------------</h3><br>\n\r');
		}
		public addBody(body: string) {
			buf.push('<pre>', body, '</pre>');
		}
		public nextFile() {
			buf.push('<br><br>\n\r\n\r');
		}
		public writeToFile(filename: string) {
			fs.writeFileSync(join(prjpath, filename + '.html'), buf.join(''));
		}
	}, filename);
}

function writeAllToPDF(prjpath: string, filename: string = output_name) {
	let doc = new pdf;
	doc.pipe(fs.createWriteStream(join(prjpath, filename + '.pdf')));
	writeAllToFileType('', prjpath, new class {
		public addHeader(header: string) {
			doc.save().fontSize(17).fillColor('blue').text(header, {align: 'center'});
		}
		public addBody(body: string) {
			doc.fontSize(10).font(join('C:', 'Windows', 'Fonts', 'consola.ttf')).fillColor('black').text(body.replace(/\t/g, '    ').replace(/\r/g, ''));
		}
		public nextFile() {
			doc.addPage();
		}
		public writeToFile(filename: string) {
			doc.end();
		}
	}, filename);
}

function exportproject(format: string = 'txt') {
	let fd: number = -1;
	try {
		let prj_root: string;
		if (vscode.workspace.workspaceFolders !== undefined) {
			prj_root = vscode.workspace.workspaceFolders[0].uri.fsPath;
		} else {
			vscode.window.showErrorMessage('Cannot identify workspace directory');
			return;
		}
		fd = fs.openSync(join(prj_root, output_name + '.' + format), 'w');
		switch (format) {
			case 'txt':
				writeAllToTXT(prj_root);
				break;
			case 'html':
				writeAllToHTML(prj_root);
				break;
			case 'pdf':
				writeAllToPDF(prj_root);
				break;
			default:
				console.error('Cannot find filetype:', format);
				return;
		}
	} catch (ex) {
		vscode.window.showErrorMessage('Export has failed');
		console.error(ex);
	} finally {
		if (fd !== -1) {
			fs.closeSync(fd);
		}
	}
	vscode.window.showInformationMessage('Finished export to ' + format);
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
	context.subscriptions.push(vscode.commands.registerCommand('exportproject.exportToTXT', () => exportproject('txt')));
	context.subscriptions.push(vscode.commands.registerCommand('exportproject.exportToHTML', () => exportproject('html')));
	context.subscriptions.push(vscode.commands.registerCommand('exportproject.exportToPDF', () => exportproject('pdf')));
}

// this method is called when your extension is deactivated
export function deactivate() { }
