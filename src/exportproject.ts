// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

function helloWorld() {
	if (vscode.workspace.workspaceFolders !== undefined) {
		
		// The code you place here will be executed every time your command is executed
		console.log("project root =", vscode.workspace.workspaceFolders[0]);
		if (vscode.workspace.workspaceFolders.length > 1) {
			let str: string = "";
			vscode.workspace.workspaceFolders.forEach(element => {
				str += element.name + ", ";
			});
			vscode.window.showWarningMessage("Workspace had more than one folder: ", str.substr(0, str.length - 2));

		}
	}
	
	// Display a message box to the user
	vscode.window.showInformationMessage('Hello World!');
}

function writeAllToTXT(dir: string[]) {

}

function exportToTXT() {
	let prj_root: vscode.WorkspaceFolder;
	if (vscode.workspace.workspaceFolders !== undefined) {
		 prj_root = vscode.workspace.workspaceFolders[0];
	} else {
		vscode.window.showErrorMessage("Cannot identify workspace directory");
		return;
	}
	let output = fs.open(prj_root.uri.path + "/output.txt", 0o666, "w", () => {});
	let dir = fs.readdirSync(prj_root.uri.path);

}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "exportproject" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(vscode.commands.registerCommand('exportproject.helloWorld', helloWorld));
	context.subscriptions.push(vscode.commands.registerCommand('exportproject.exportToTXT', exportToTXT));
}

// this method is called when your extension is deactivated
export function deactivate() {}
