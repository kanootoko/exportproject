// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { join } from 'path';
import * as pdf from 'pdfkit';

const output_name = 'export_output';

function helloWorld() {
	if (vscode.workspace.workspaceFolders !== undefined) {
		console.log('project root =', vscode.workspace.workspaceFolders[0]);
		if (vscode.workspace.workspaceFolders.length > 1) {
			let str: string = '';
			vscode.workspace.workspaceFolders.forEach(element => {
				str += element.name + ', ';
			});
			vscode.window.showWarningMessage('Workspace had more than one folder: ', str.slice(0, str.length - 2));
		}
	}
	vscode.window.showInformationMessage('Hello World!');
}

const sourceFiles: string[] = ['txt', 'java', 'ini', 'bat', 'cmd', 'gitignore', 'py', 'cpp', 'h', 'hpp', 'xml', 'md', 'json', 'csv', 'html'];

function writeAllToFileType(basepath: string, prjpath: string,
	fileType: {
		addHeader(header: string): void,
		addBody(body: string): void,
		writeToFile(filename: string): void
	}, filename: string) {
	let files: string[] = [];
	fs.readdirSync(join(prjpath, basepath)).forEach(element => {
		if (fs.lstatSync(join(prjpath, basepath, element)).isDirectory()) {
			writeAllToFileType(join(basepath, element), prjpath, fileType, filename);
		} else {
			if (element.slice(0, element.lastIndexOf('.')) === filename) {
				return; // continue
			}
			if (sourceFiles.includes(element.slice(element.lastIndexOf('.') + 1, element.length))) {
				files.push(element);
			} else {
				console.log('ignoring non-source-code file:', join(basepath, element));
			}
		}
	});
	files.forEach(element => {
		fileType.addHeader(join(basepath, element));
		fileType.addBody(fs.readFileSync(join(prjpath, basepath, element)).toString());
	});
	if (basepath === '') {
		fileType.writeToFile(filename);
	}
}

function writeAllToTXT(prjpath: string, filename: string = output_name) {
	let buf: string[] = [];
	let numberExported = 0;
	writeAllToFileType('', prjpath, new class {
		public addHeader(header: string) {
			if (numberExported !== 0) {
				buf.push('\n\r\n\r');
			}
			numberExported++;
			buf.push('---------------------------- ', header, ' ----------------------------\n\r');
		}
		public addBody(body: string) {
			buf.push(body);
		}
		public writeToFile(filename: string) {
			fs.writeFileSync(join(prjpath, filename + '.txt'), buf.join(''));
		}
	}, filename);
}

function writeAllToHTML(prjpath: string, filename: string = output_name) {
	let buf: string[] = [];
	let numberExported = 0;
	writeAllToFileType('', prjpath, new class {
		public addHeader(header: string) {
			if (numberExported !== 0) {
				buf.push('<br><br>\n\r\n\r');
			}
			numberExported++;
			buf.push('<h2 style="color: blue">---------------------------- ', header, ' ----------------------------</h2><br>\n\r');
		}
		public addBody(body: string) {
			buf.push('<pre>', body, '</pre>');
		}
		public writeToFile(filename: string) {
			fs.writeFileSync(join(prjpath, filename + '.html'), buf.join(''));
		}
	}, filename);
}

function writeAllToPDF(prjpath: string, filename: string = output_name) {
	let doc = new pdf;
	let numberExported = 0;
	doc.pipe(fs.createWriteStream(join(prjpath, filename + '.pdf')));
	writeAllToFileType('', prjpath, new class {
		public addHeader(header: string) {
			if (numberExported !== 0) {
				doc.addPage();
			}
			doc.fontSize(17).fillColor('blue').text(header, { align: 'center' });
		}
		public addBody(body: string) {
			doc.fontSize(10).font(join('C:', 'Windows', 'Fonts', 'consola.ttf')).fillColor('black').text(body.replace(/\t/g, '    ').replace(/\r/g, ''));
		}
		public writeToFile(filename: string) {
			doc.end();
		}
	}, filename);
}

function exportproject(format: string = 'txt') {
	try {
		if (vscode.workspace.workspaceFolders !== undefined) {
			var prj_root: string = vscode.workspace.workspaceFolders[0].uri.fsPath;
		} else {
			vscode.window.showErrorMessage('Cannot identify workspace directory');
			return;
		}
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
		return;
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
