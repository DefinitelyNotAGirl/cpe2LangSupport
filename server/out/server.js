"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_1 = require("vscode-languageserver/node");
var fs = require("fs");
var vsuri = require("vscode-uri");
var vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
var connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
// Create a simple text document manager.
var documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
connection.onInitialize(function (params) {
    var capabilities = params.capabilities;
    connection.console.log("[c+=2] initializing language server");
    var result = {
        capabilities: {
            textDocumentSync: node_1.TextDocumentSyncKind.Full,
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
var c2c = "";
connection.onInitialized(function () {
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(node_1.DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(function (_event) {
            connection.console.log('[c+=2] Workspace folder change event received.');
        });
    }
    //
    //fetch c2c
    //
    var __c2c = connection.workspace.getConfiguration("c+=2").then(function (value) {
        c2c = value["compilerCommand"];
        connection.console.log("[c+=2] c2c: " + c2c);
    }, function (error) {
        connection.window.showErrorMessage("c+=2 language server could not fetch c+=2.compilerCommand config item");
        c2c = "cp2";
        connection.console.log("[c+=2] c2c: " + c2c);
    });
});
function parse(text, textDocument) {
    var diagnostics = [];
    if (c2c == "")
        return diagnostics;
    connection.console.log("[c+=2] sending diagnostics...");
    //get trailing whitespace diagnostics
    var TWSD = getTrailingWhitespaceDiagnostics(text, textDocument);
    for (var I in TWSD)
        diagnostics.push(TWSD[I]);
    //create temp file
    var fp = vsuri.URI.parse(textDocument.uri).fsPath + ".temp_svr";
    fs.writeFileSync(fp, textDocument.getText());
    //call up compiler for all other diagnostics
    var execSync = require('child_process').execSync;
    //connection.console.log("[c+=2] path: "+fp);
    //connection.console.log(`cmd: ${c2c} --vsls ${fp}`);
    var stdout = execSync("".concat(c2c, " --vsls ").concat(fp)).toString();
    //connection.console.log(`[c+=2] stdout: ${stdout}`);
    fs.unlinkSync(fp); // delete temp file
    var messages = [];
    var message = "";
    for (var I in stdout) {
        if (stdout[I] == '\n') {
            messages.push(message);
            message = "";
        }
        else {
            message += stdout[I];
        }
    }
    if (message != "")
        messages.push(message);
    for (var m in messages) {
        var msg = messages[m];
        //connection.console.log("msg: "+msg);
        var ID = parseInt(msg.substring(0, 4));
        //connection.console.log("ID: "+ID);
        switch (ID) {
            case (15): {
                var I = 5;
                var tmp = "";
                while (msg[I] != '-')
                    tmp += msg[I++];
                I++;
                var line = parseInt(tmp) - 1;
                tmp = "";
                while (msg[I] != '-')
                    tmp += msg[I++];
                I++;
                var col = parseInt(tmp);
                tmp = "";
                while (msg[I] != '-')
                    tmp += msg[I++];
                I++;
                var len = parseInt(tmp);
                var vname = msg.substring(I);
                var diagnostic = {
                    severity: node_1.DiagnosticSeverity.Error,
                    range: node_1.Range.create(node_1.Position.create(line, col), node_1.Position.create(line, col + len)),
                    message: "\"" + vname + "\" does not refer to anything!",
                    source: 'c+=2'
                };
                diagnostics.push(diagnostic);
                break;
            }
            case (5001): {
                var I = 5;
                var tmp = "";
                while (msg[I] != '-')
                    tmp += msg[I++];
                I++;
                var line = parseInt(tmp) - 1;
                tmp = "";
                while (msg[I] != '-')
                    tmp += msg[I++];
                I++;
                var col = parseInt(tmp);
                tmp = "";
                while (msg[I] != '-')
                    tmp += msg[I++];
                I++;
                var len = parseInt(tmp);
                tmp = "";
                while (msg[I] != '-')
                    tmp += msg[I++];
                I++;
                var rname = tmp;
                var wname = msg.substring(I);
                var diagnostic = {
                    severity: node_1.DiagnosticSeverity.Warning,
                    range: node_1.Range.create(node_1.Position.create(line, col), node_1.Position.create(line, col + len)),
                    message: "insufficient cpu privilege level to access register \"" + rname + "\"",
                    source: 'c+=2 - ' + wname
                };
                diagnostics.push(diagnostic);
                break;
            }
            case (5002): {
                var I = 5;
                var tmp = "";
                while (msg[I] != '-')
                    tmp += msg[I++];
                I++;
                var line = parseInt(tmp) - 1;
                tmp = "";
                while (msg[I] != '-')
                    tmp += msg[I++];
                I++;
                var col = parseInt(tmp);
                tmp = "";
                while (msg[I] != '-')
                    tmp += msg[I++];
                I++;
                var len = parseInt(tmp);
                tmp = "";
                while (msg[I] != '-')
                    tmp += msg[I++];
                I++;
                var rname = tmp;
                var wname = msg.substring(I);
                var diagnostic = {
                    severity: node_1.DiagnosticSeverity.Warning,
                    range: node_1.Range.create(node_1.Position.create(line, col), node_1.Position.create(line, col + len)),
                    message: "register \"" + rname + "\" is currently used as the stack pointer, you should not store things here!",
                    source: 'c+=2 - ' + wname
                };
                diagnostics.push(diagnostic);
                break;
            }
            case (5003): {
                var I = 5;
                var tmp = "";
                while (msg[I] != '-')
                    tmp += msg[I++];
                I++;
                var line = parseInt(tmp) - 1;
                tmp = "";
                while (msg[I] != '-')
                    tmp += msg[I++];
                I++;
                var col = parseInt(tmp);
                tmp = "";
                while (msg[I] != '-')
                    tmp += msg[I++];
                I++;
                var len = parseInt(tmp);
                var wname = msg.substring(I);
                var diagnostic = {
                    severity: node_1.DiagnosticSeverity.Warning,
                    range: node_1.Range.create(node_1.Position.create(line, col), node_1.Position.create(line, col + len)),
                    message: "storing variable at absolute address may be unintentional, use an explicit sign (+ or -) to store the variable at a location relative to the stack pointer",
                    source: 'c+=2 - ' + wname
                };
                diagnostics.push(diagnostic);
                break;
            }
            default: {
                console.log("[c+=2] unknown message type id: ".concat(ID));
            }
        }
    }
    //return
    return diagnostics;
}
var hasConfigurationCapability = false;
var hasWorkspaceFolderCapability = false;
var hasDiagnosticRelatedInformationCapability = false;
// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
var defaultSettings = { maxNumberOfProblems: 1000 };
var globalSettings = defaultSettings;
// Cache the settings of all open documents
var documentSettings = new Map();
connection.onDidChangeConfiguration(function (change) {
    if (hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    }
    else {
        globalSettings = ((change.settings.languageServerExample || defaultSettings));
    }
    // Revalidate all open text documents
    documents.all().forEach(validateTextDocument);
});
function getDocumentSettings(resource) {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    var result = documentSettings.get(resource);
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
documents.onDidClose(function (e) {
    documentSettings.delete(e.document.uri);
});
// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(function (change) {
    validateTextDocument(change.document);
});
function getTrailingWhitespaceDiagnostics(text, textDocument) {
    var diagnostics = [];
    var patt = /[ \t]+\n/g;
    var match;
    while (match = patt.exec(text)) {
        //connection.console.log(match.index + ' ' + patt.lastIndex);
        var diagnostic = {
            severity: node_1.DiagnosticSeverity.Error,
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
function validateTextDocument(textDocument) {
    return __awaiter(this, void 0, void 0, function () {
        var text, diagnostics;
        return __generator(this, function (_a) {
            text = textDocument.getText();
            diagnostics = parse(text, textDocument);
            // Send the computed diagnostics to VS Code.
            connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: diagnostics });
            return [2 /*return*/];
        });
    });
}
connection.onDidChangeWatchedFiles(function (_change) {
    // Monitored files have change in VS Code
    connection.console.log('[c+=2] We received a file change event');
});
// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(function (item) {
    if (item.data === 1) {
        item.detail = 'TypeScript details';
        item.documentation = 'TypeScript documentation';
    }
    else if (item.data === 2) {
        item.detail = 'JavaScript details';
        item.documentation = 'JavaScript documentation';
    }
    return item;
});
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map