import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
    Position,
    Range,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
    CancellationToken
} from 'vscode-languageserver/node';
import * as fs from 'fs';
import * as vsuri from 'vscode-uri'
import { TextDocument } from 'vscode-languageserver-textdocument';
import { throws } from 'assert';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams) => {
	let capabilities = params.capabilities;

	connection.console.log("[c+=2] initializing language server")

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Full,
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});
var c2c: string = "";
connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('[c+=2] Workspace folder change event received.');
		});
	}
    //
    //fetch c2c
    //
    let __c2c = connection.workspace.getConfiguration("c+=2").then(
        function(value) 
        {
            c2c = value["compilerCommand"];
            connection.console.log("[c+=2] c2c: "+c2c);
        },
        function(error)
        {
            connection.window.showErrorMessage("c+=2 language server could not fetch c+=2.compilerCommand config item");
            c2c = "cp2";
            connection.console.log("[c+=2] c2c: "+c2c);
        }
    );
});

function parse(text: string,textDocument: TextDocument): Diagnostic[] {
    let diagnostics: Diagnostic[] = [];
    if(c2c == "")return diagnostics;
	connection.console.log("[c+=2] sending diagnostics...");
    //get trailing whitespace diagnostics
    let TWSD: Diagnostic[] = getTrailingWhitespaceDiagnostics(text,textDocument);
    for(let I in TWSD)
        diagnostics.push(TWSD[I]);
	//create temp file
	let fp = vsuri.URI.parse(textDocument.uri).fsPath+".temp_svr";
	fs.writeFileSync(fp,textDocument.getText());
    //call up compiler for all other diagnostics
    const { execSync } = require('child_process');
    //connection.console.log("[c+=2] path: "+fp);
	//connection.console.log(`cmd: ${c2c} --vsls ${fp}`);
    let stdout = execSync(`${c2c} --vsls ${fp}`).toString();
    //connection.console.log(`[c+=2] stdout: ${stdout}`);
	fs.unlinkSync(fp);// delete temp file
    let messages: string[] = [];
    let message: string = "";
    for(let I in stdout)
    {
        if(stdout[I] == '\n')
        {
            messages.push(message);
            message = "";
        }
        else
        {
            message += stdout[I];
        }
    }
    if(message != "")
        messages.push(message);
    for(let m in messages)
    {
        let msg: string = messages[m];
        //connection.console.log("msg: "+msg);
        let ID = parseInt(msg.substring(0,4));
        //connection.console.log("ID: "+ID);
        switch(ID)
        {
            case(15):{
                let I = 5;
                let tmp: string = "";
                while(msg[I] != '-')
                    tmp+=msg[I++];
                I++;
                let line = parseInt(tmp)-1;
                tmp = "";
                while(msg[I] != '-')
                    tmp+=msg[I++];
                I++;
                let col = parseInt(tmp);
                tmp = "";
                while(msg[I] != '-')
                    tmp+=msg[I++];
                I++;
                let len = parseInt(tmp);
                let vname: string = msg.substring(I);
                let diagnostic: Diagnostic = {
                    severity: DiagnosticSeverity.Error,
                    range: Range.create(Position.create(line,col),Position.create(line,col+len)),
                    message: "\""+vname+"\" does not refer to anything!",
                    source: 'c+=2'
                };
                diagnostics.push(diagnostic);
                break;
            }case(5001):{
                let I = 5;
                let tmp: string = "";
                while(msg[I] != '-')
                    tmp+=msg[I++];
                I++;
                let line = parseInt(tmp)-1;
                tmp = "";
                while(msg[I] != '-')
                    tmp+=msg[I++];
                I++;
                let col = parseInt(tmp);
                tmp = "";
                while(msg[I] != '-')
                    tmp+=msg[I++];
                I++;
                let len = parseInt(tmp);
                tmp = "";
                while(msg[I] != '-')
                    tmp+=msg[I++];
                I++;
                let rname: string = tmp;
                let wname: string = msg.substring(I);
                let diagnostic: Diagnostic = {
                    severity: DiagnosticSeverity.Warning,
                    range: Range.create(Position.create(line,col),Position.create(line,col+len)),
                    message: "insufficient cpu privilege level to access register \""+rname+"\"",
                    source: 'c+=2 - '+wname
                };
                diagnostics.push(diagnostic);
                break;
            }case(5002):{
                let I = 5;
                let tmp: string = "";
                while(msg[I] != '-')
                    tmp+=msg[I++];
                I++;
                let line = parseInt(tmp)-1;
                tmp = "";
                while(msg[I] != '-')
                    tmp+=msg[I++];
                I++;
                let col = parseInt(tmp);
                tmp = "";
                while(msg[I] != '-')
                    tmp+=msg[I++];
                I++;
                let len = parseInt(tmp);
                tmp = "";
                while(msg[I] != '-')
                    tmp+=msg[I++];
                I++;
                let rname: string = tmp;
                let wname: string = msg.substring(I);
                let diagnostic: Diagnostic = {
                    severity: DiagnosticSeverity.Warning,
                    range: Range.create(Position.create(line,col),Position.create(line,col+len)),
                    message: "register \""+rname+"\" is currently used as the stack pointer, you should not store things here!",
                    source: 'c+=2 - '+wname
                };
                diagnostics.push(diagnostic);
                break;
            }case(5003):{
                let I = 5;
                let tmp: string = "";
                while(msg[I] != '-')
                    tmp+=msg[I++];
                I++;
                let line = parseInt(tmp)-1;
                tmp = "";
                while(msg[I] != '-')
                    tmp+=msg[I++];
                I++;
                let col = parseInt(tmp);
                tmp = "";
                while(msg[I] != '-')
                    tmp+=msg[I++];
                I++;
                let len = parseInt(tmp);
                let wname: string = msg.substring(I);
                let diagnostic: Diagnostic = {
                    severity: DiagnosticSeverity.Warning,
                    range: Range.create(Position.create(line,col),Position.create(line,col+len)),
                    message: "storing variable at absolute address may be unintentional, use an explicit sign (+ or -) to store the variable at a location relative to the stack pointer",
                    source: 'c+=2 - '+wname
                };
                diagnostics.push(diagnostic);
                break;
            }default:{
                console.log(`[c+=2] unknown message type id: ${ID}`);
            }
        }
    }
    //return
    return diagnostics;
}

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;
// The example settings
interface ExampleSettings {
	maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <ExampleSettings>(
			(change.settings.languageServerExample || defaultSettings)
			);
		}
		// Revalidate all open text documents
		documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'languageServerExample'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	validateTextDocument(change.document);
});

function getTrailingWhitespaceDiagnostics(text: string,textDocument: TextDocument): Diagnostic[]
{
    let diagnostics: Diagnostic[] = [];
    var patt = /[ \t]+\n/g;
    var match;
    while(match = patt.exec(text)) {
        //connection.console.log(match.index + ' ' + patt.lastIndex);
        let diagnostic: Diagnostic = {
            severity: DiagnosticSeverity.Error,
            range: {
                start: textDocument.positionAt(match.index),
                end: textDocument.positionAt(patt.lastIndex)
            },
            message: "trailing whitespace characters could mess with the c+=2 compiler!",
            source: 'c+=2'
        };
        diagnostics.push(diagnostic);
    }
    return diagnostics;
}

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	// The validator creates diagnostics for all uppercase words length 2 and more
	let text = textDocument.getText();
	let diagnostics: Diagnostic[] = parse(text,textDocument);
    // Send the computed diagnostics to VS Code.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    return;
}

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VS Code
	connection.console.log('[c+=2] We received a file change event');
});

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		if (item.data === 1) {
			item.detail = 'TypeScript details';
			item.documentation = 'TypeScript documentation';
		} else if (item.data === 2) {
			item.detail = 'JavaScript details';
			item.documentation = 'JavaScript documentation';
		}
		return item;
	}
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
