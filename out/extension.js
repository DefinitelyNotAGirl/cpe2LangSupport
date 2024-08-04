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
exports.activate = exports.deactivate = void 0;
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
var node_1 = require("vscode-languageclient/node");
var vscode_1 = require("vscode");
var tokenTypes = new Map();
var tokenModifiers = new Map();
var legend = (function () {
    var tokenTypesLegend = [
        'comment', 'string', 'keyword', 'number', 'regexp', 'operator', 'namespace',
        'type', 'struct', 'class', 'interface', 'enum', 'typeParameter', 'function',
        'method', 'decorator', 'macro', 'variable', 'parameter', 'property', 'label'
    ];
    tokenTypesLegend.forEach(function (tokenType, index) { return tokenTypes.set(tokenType, index); });
    var tokenModifiersLegend = [
        'declaration', 'documentation', 'readonly', 'static', 'abstract', 'deprecated',
        'modification', 'async'
    ];
    tokenModifiersLegend.forEach(function (tokenModifier, index) { return tokenModifiers.set(tokenModifier, index); });
    return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();
var client;
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
exports.deactivate = deactivate;
var c2_proj_gen_dir_struct = function () { return __awaiter(void 0, void 0, void 0, function () {
    var decoder, project, _a, _b, _c, _d, _e, _f, _g, _i, I, dir, _h, _j, _k, _l, I, dir;
    return __generator(this, function (_m) {
        switch (_m.label) {
            case 0:
                if (!(vscode.workspace.workspaceFolders !== undefined)) return [3 /*break*/, 12];
                decoder = new TextDecoder;
                _b = (_a = JSON).parse;
                _d = (_c = decoder).decode;
                return [4 /*yield*/, vscode.workspace.fs.readFile(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '/.vscode/.cp2project.json'))];
            case 1:
                project = _b.apply(_a, [_d.apply(_c, [_m.sent()])]);
                _e = project["srcdirs"];
                _f = [];
                for (_g in _e)
                    _f.push(_g);
                _i = 0;
                _m.label = 2;
            case 2:
                if (!(_i < _f.length)) return [3 /*break*/, 6];
                _g = _f[_i];
                if (!(_g in _e)) return [3 /*break*/, 5];
                I = _g;
                dir = project["srcdirs"][I];
                return [4 /*yield*/, vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '/' + dir))];
            case 3:
                _m.sent();
                return [4 /*yield*/, vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '/build/' + dir))];
            case 4:
                _m.sent();
                _m.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 2];
            case 6:
                _h = project["incdirs"];
                _j = [];
                for (_k in _h)
                    _j.push(_k);
                _l = 0;
                _m.label = 7;
            case 7:
                if (!(_l < _j.length)) return [3 /*break*/, 10];
                _k = _j[_l];
                if (!(_k in _h)) return [3 /*break*/, 9];
                I = _k;
                dir = project["incdirs"][I];
                return [4 /*yield*/, vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '/' + dir))];
            case 8:
                _m.sent();
                _m.label = 9;
            case 9:
                _l++;
                return [3 /*break*/, 7];
            case 10: return [4 /*yield*/, vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '/lib'))];
            case 11:
                _m.sent();
                return [3 /*break*/, 13];
            case 12:
                vscode.window.showErrorMessage("c+=2: cant generate makefile as there are no open directories");
                _m.label = 13;
            case 13: return [2 /*return*/];
        }
    });
}); };
var c2_proj_gen_makefile = function () { return __awaiter(void 0, void 0, void 0, function () {
    var encoder, decoder, project, _a, _b, _c, _d, data, makefile, deplists, srclists, objlists, III, lang, I, dir, II, ext, I, dir, III, lang, II, ext, compiler, I, list, objcombined, I;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                if (!(vscode.workspace.workspaceFolders !== undefined)) return [3 /*break*/, 4];
                encoder = new TextEncoder;
                decoder = new TextDecoder;
                _b = (_a = JSON).parse;
                _d = (_c = decoder).decode;
                return [4 /*yield*/, vscode.workspace.fs.readFile(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '/.vscode/.cp2project.json'))];
            case 1:
                project = _b.apply(_a, [_d.apply(_c, [_e.sent()])]);
                data = void 0;
                makefile = "";
                deplists = [];
                srclists = [];
                objlists = [];
                for (III in project["languages"]) {
                    lang = project["languages"][III];
                    for (I in project["srcdirs"]) {
                        dir = project["srcdirs"][I];
                        for (II in project["extensions"][lang]) {
                            ext = project["extensions"][lang][II];
                            makefile += "SOURCE_" + lang + "_" + ext + "_" + dir + "=$(wildcard " + dir + "/*." + ext + ")\n";
                            makefile += "OBJECTS_" + lang + "_" + ext + "_" + dir + "=$(patsubst " + dir + "/%." + ext + ",build/" + dir + "/%.o,$(SOURCE_" + lang + "_" + ext + "))\n";
                            makefile += "DEPFILES_" + lang + "_" + ext + "_" + dir + "=$(patsubst " + dir + "/%." + ext + ",build/" + dir + "/%.d,$(SOURCE_" + lang + "_" + ext + "))\n";
                            deplists.push("DEPFILES_" + lang + "_" + ext + "_" + dir);
                            srclists.push("SOURCE_" + lang + "_" + ext + "_" + dir);
                            objlists.push("OBJECTS_" + lang + "_" + ext + "_" + dir);
                        }
                    }
                }
                for (I in project["srcdirs"]) {
                    dir = project["srcdirs"][I];
                    for (III in project["languages"]) {
                        lang = project["languages"][III];
                        for (II in project["extensions"][lang]) {
                            ext = project["extensions"][lang][II];
                            compiler = project["compilers"][lang];
                            makefile += "build/" + dir + "/%.o: " + dir + "/%." + ext + "\n";
                            makefile += "\t@" + compiler + " -o $@ $<\n";
                            makefile += "\t$(info  	" + compiler + "	$<)\n";
                        }
                    }
                }
                for (I in deplists) {
                    list = deplists[I];
                    makefile += "-include $(" + list + ")\n";
                }
                makefile += project["name"] + ":";
                objcombined = "";
                for (I in objlists) {
                    objcombined += " $(" + objlists[I] + ")";
                }
                makefile += objcombined + "\n";
                makefile += "\t@" + project["linker"] + " -o " + project["name"] + ".exe" + objcombined + "\n";
                makefile += "\t$(info  	" + project["linker"] + "	$<)\n";
                //
                // write makefile
                //
                data = encoder.encode(makefile);
                if (!(vscode.workspace.workspaceFolders !== undefined)) return [3 /*break*/, 3];
                return [4 /*yield*/, vscode.workspace.fs.writeFile(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '/makefile'), data)];
            case 2:
                _e.sent();
                _e.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                vscode.window.showErrorMessage("c+=2: cant generate makefile as there are no open directories");
                _e.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); };
var setup_c2_proj = function () { return __awaiter(void 0, void 0, void 0, function () {
    var type, name, compiler_c2, support_c, compiler_c, support_cxx, compiler_cxx, linker, initGit, cp2project, jstr, encoder, data, execSync, gitignore;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("[c+=2] setting up new project...");
                type = "";
                name = "";
                return [4 /*yield*/, vscode.window.showInputBox({
                        title: "General Settings",
                        placeHolder: "enter the name of your project",
                    }).then(function (value) {
                        if (value !== undefined)
                            name = value;
                    }, function (error) {
                    })];
            case 1:
                _a.sent();
                return [4 /*yield*/, vscode.window.showQuickPick(["Executable", "Library"], {
                        canPickMany: false,
                        title: "General Settings",
                        placeHolder: "pick a project type."
                    }).then(function (value) {
                        if (value !== undefined)
                            type = value;
                    }, function (error) {
                    })];
            case 2:
                _a.sent();
                compiler_c2 = "";
                return [4 /*yield*/, vscode.window.showInputBox({
                        title: "c+=2 support - compiler",
                        placeHolder: "ex: '/usr/bin/cp2' or 'cp2' (dont include quotes)",
                    }).then(function (value) {
                        if (value !== undefined)
                            compiler_c2 = value;
                    }, function (error) {
                    })];
            case 3:
                _a.sent();
                support_c = false;
                compiler_c = "";
                return [4 /*yield*/, vscode.window.showQuickPick(["Yes", "No"], {
                        canPickMany: false,
                        title: "Include C support?"
                    }).then(function (value) {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(value === "Yes")) return [3 /*break*/, 2];
                                        return [4 /*yield*/, vscode.window.showInputBox({
                                                title: "C support - compiler",
                                                placeHolder: "ex: '/usr/bin/gcc' or 'gcc' (dont include quotes)",
                                            }).then(function (value) {
                                                support_c = true;
                                                if (value !== undefined)
                                                    compiler_c = value;
                                            }, function (error) {
                                            })];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        });
                    }, function (error) {
                    })];
            case 4:
                _a.sent();
                support_cxx = false;
                compiler_cxx = "";
                return [4 /*yield*/, vscode.window.showQuickPick(["Yes", "No"], {
                        canPickMany: false,
                        title: "Include c++ support?"
                    }).then(function (value) {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(value === "Yes")) return [3 /*break*/, 2];
                                        return [4 /*yield*/, vscode.window.showInputBox({
                                                title: "c++ support - compiler",
                                                placeHolder: "ex: '/usr/bin/g++' or 'g++' (dont include quotes)",
                                            }).then(function (value) {
                                                support_cxx = true;
                                                if (value !== undefined)
                                                    compiler_cxx = value;
                                            }, function (error) {
                                            })];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        });
                    }, function (error) {
                    })];
            case 5:
                _a.sent();
                linker = "";
                return [4 /*yield*/, vscode.window.showInputBox({
                        title: "Linker",
                        placeHolder: "ex: '/usr/bin/ld' or 'ld' (dont include quotes)",
                    }).then(function (value) {
                        if (value !== undefined)
                            linker = value;
                    }, function (error) {
                    })];
            case 6:
                _a.sent();
                initGit = false;
                return [4 /*yield*/, vscode.window.showQuickPick(["Yes", "No"], {
                        canPickMany: false,
                        title: "Initiate Git repository?"
                    }).then(function (value) {
                        if (value === "Yes") {
                            initGit = true;
                        }
                    }, function (error) {
                    })];
            case 7:
                _a.sent();
                //
                // generate ./.vscode/.cp2project.json
                //
                console.log("[c+=2] generating ./.vscode/.cp2project.json...");
                cp2project = {
                    "name": name,
                    "type": type,
                    "linker": linker,
                    "languages": [
                        "cp2"
                    ],
                    "extensions": {
                        "c": ["c"],
                        "cxx": ["cpp", "cxx"],
                        "cp2": ["c2", "cp2"]
                    },
                    "compilers": {
                        "c": "",
                        "cxx": "",
                        "cp2": ""
                    },
                    "srcdirs": [
                        "src"
                    ],
                    "incdirs": [
                        "inc"
                    ]
                };
                if (support_c) {
                    cp2project["compilers"]["c"] = compiler_c;
                    cp2project["languages"].push("c");
                }
                if (support_cxx) {
                    cp2project["compilers"]["cxx"] = compiler_cxx;
                    cp2project["languages"].push("cxx");
                }
                cp2project["compilers"]["cp2"] = compiler_c2;
                jstr = JSON.stringify(cp2project, null, 4);
                encoder = new TextEncoder;
                data = encoder.encode(jstr);
                if (!(vscode.workspace.workspaceFolders !== undefined)) return [3 /*break*/, 12];
                return [4 /*yield*/, vscode.workspace.fs.writeFile(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '/.vscode/.cp2project.json'), data)];
            case 8:
                _a.sent();
                return [4 /*yield*/, vscode.commands.executeCommand("c+=2.c2_proj_gen_makefile")];
            case 9:
                _a.sent();
                return [4 /*yield*/, vscode.commands.executeCommand("c+=2.c2_proj_gen_dir_struct")];
            case 10:
                _a.sent();
                execSync = require('child_process').execSync;
                execSync("git init " + vscode.workspace.workspaceFolders[0].uri.fsPath);
                gitignore = "";
                gitignore += "# Build\n";
                gitignore += "*.d\n";
                gitignore += "*.o\n";
                gitignore += "# Executables\n";
                gitignore += "*.exe\n";
                gitignore += "*.out\n";
                gitignore += "*.app\n";
                data = encoder.encode(gitignore);
                return [4 /*yield*/, vscode.workspace.fs.writeFile(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '/.gitignore'), data)];
            case 11:
                _a.sent();
                //
                //finish up
                //
                console.log("[c+=2] done!");
                return [3 /*break*/, 13];
            case 12:
                vscode.window.showErrorMessage("c+=2: cant create project as there are no open directories");
                _a.label = 13;
            case 13: return [2 /*return*/];
        }
    });
}); };
var c2c = "";
function activate(context) {
    console.log("[c+=2] language extension loading...");
    //
    //fetch c2c
    //
    var __c2c = vscode.workspace.getConfiguration("c+=2");
    c2c = __c2c["compilerCommand"];
    console.log("[c+=2] c2c: " + c2c);
    //
    //register commands
    //
    context.subscriptions.push(vscode.commands.registerCommand("c+=2.setup_c2_proj", setup_c2_proj));
    context.subscriptions.push(vscode.commands.registerCommand("c+=2.c2_proj_gen_makefile", c2_proj_gen_makefile));
    context.subscriptions.push(vscode.commands.registerCommand("c+=2.c2_proj_gen_dir_struct", c2_proj_gen_dir_struct));
    //
    //register semantic token provider
    //
    context.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider({
        language: 'c+=2'
    }, new DocumentSemanticTokensProvider(), legend));
    //
    //register hover provider
    //
    context.subscriptions.push(vscode.languages.registerHoverProvider({
        language: 'c+=2'
    }, new c2HoverProvider()));
    // The language server is implemented in node.js
    var serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
    var debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    var serverOptions = {
        run: { module: serverModule, transport: node_1.TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
            options: debugOptions
        }
    };
    // Options to control the language client
    var clientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'c+=2' }],
        synchronize: {
            // Notify the server about file changes to '.clientrc files contained in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };
    // Create the language client and start the client.
    client = new node_1.LanguageClient('cpe2langserver', 'c+=2 Language Server', serverOptions, clientOptions);
    // Start the client. This will also launch the server
    client.start();
}
exports.activate = activate;
var hoverObj = /** @class */ (function () {
    function hoverObj() {
        this.text = "";
        this.start = 0;
        this.end = 0;
        this.content = new vscode.MarkdownString("");
    }
    return hoverObj;
}());
var doc = /** @class */ (function () {
    function doc() {
        this.name = "";
        this.hoverObjs = [];
    }
    return doc;
}());
var docs = [];
var c2HoverProvider = /** @class */ (function () {
    function c2HoverProvider() {
    }
    c2HoverProvider.prototype.provideHover = function (document, position, token) {
        for (var I in docs) {
            var doc_1 = docs[I];
            if (doc_1.name == document.fileName) {
                for (var II in doc_1.hoverObjs) {
                    var obj = doc_1.hoverObjs[II];
                    var offset = document.offsetAt(position);
                    if (offset >= obj.start && offset <= obj.end) {
                        var result = new vscode_1.Hover(obj.content);
                        return result;
                    }
                }
            }
        }
        return undefined;
    };
    return c2HoverProvider;
}());
var msg;
function getNextDataPoint() {
    var I = 0;
    if (msg.length <= 0)
        return "";
    while (msg.charAt(I) != '\x0c' && msg.charAt(I) != '\n' && I < msg.length) {
        //console.log("[c+=2] looping...");
        //console.log("[c+=2] char: "+msg.charCodeAt(I));
        I++;
    }
    var result = msg.substring(0, I);
    msg = msg.substring(I + 1);
    //console.log("[c+=2] result: "+result);
    return result;
}
function parse(textDocument) {
    var r = [];
    //write data to temp file
    var fp = textDocument.uri.fsPath + ".temp";
    fs.writeFileSync(fp, textDocument.getText());
    //call up compiler
    var execSync = require('child_process').execSync;
    //console.log("[c+=2] path: "+fp);
    var cmd = "".concat(c2c, " --vstc ").concat(fp);
    console.log("[c+=2] compiler command: " + cmd);
    var stdout = execSync(cmd).toString();
    fs.unlinkSync(fp); //! delete temporary file
    //console.log(`[c+=2] stdout: ${stdout}`);
    var messages = [];
    var message = "";
    var document = undefined;
    for (var II in docs) {
        if (docs[II].name == textDocument.fileName) {
            document = docs[II];
            break;
        }
    }
    if (document !== undefined) {
        document.hoverObjs = [];
    }
    else {
        docs.push({
            name: textDocument.fileName,
            hoverObjs: []
        });
        document = docs[docs.length - 1];
    }
    for (var I in stdout) {
        if (stdout[I] == '\n') {
            messages.push(message);
            //console.log(`[c+=2] message: ${message}`);
            message = "";
        }
        else {
            message += stdout[I];
        }
    }
    if (message != "")
        messages.push(message);
    document.hoverObjs = [];
    for (var m in messages) {
        msg = messages[m];
        //console.log("[c+=2] msg: "+msg);
        var ID = parseInt(getNextDataPoint());
        //console.log("[c+=2] ID: "+ID);
        var line = parseInt(getNextDataPoint()) - 1;
        if (line < 0)
            continue;
        switch (ID) {
            case (1): {
                var col = parseInt(getNextDataPoint());
                var len = parseInt(getNextDataPoint());
                var text = getNextDataPoint();
                var decl_file = getNextDataPoint();
                var decl_line = getNextDataPoint();
                var desc = getNextDataPoint();
                r.push({
                    line: line,
                    startCharacter: col,
                    length: len,
                    tokenType: "class",
                    tokenModifiers: []
                });
                //console.log("[c+=2] highlight: ",r.at(r.length-1));
                //
                //add hover obj
                //
                document.hoverObjs.push({
                    text: "",
                    start: textDocument.offsetAt(new vscode.Position(line, col)),
                    end: textDocument.offsetAt(new vscode.Position(line, col + len)),
                    content: new vscode.MarkdownString("class ".concat(text, "\n\n-----\n").concat(desc, "\n\n-----\n declared in ").concat(decl_file, " on line ").concat(decl_line))
                });
                break;
            }
            case (2): {
                var col = parseInt(getNextDataPoint());
                var len = parseInt(getNextDataPoint());
                var text = getNextDataPoint();
                var decl_file = getNextDataPoint();
                var decl_line = getNextDataPoint();
                var type = getNextDataPoint();
                var desc = getNextDataPoint();
                ////this is the ultimate band-aid fix, but whatever (implemented 18.11.2023)
                //if(textDocument.getText().charAt(textDocument.offsetAt(new vscode.Position(line,col-1))) != ' ')
                //    col-=2;
                //col+=(textDocument.lineAt(new vscode.Position(line,col)).text.substring(0,col+len).split("(").length - 1)*2
                //console.log(`[c+=2] ${textDocument.lineAt(new vscode.Position(line,col)).text.substring(0,col+len)}`)
                r.push({
                    line: line,
                    startCharacter: col,
                    length: len,
                    tokenType: "variable",
                    tokenModifiers: []
                });
                //console.log("[c+=2] highlight: ",r.at(r.length-1));
                //
                //add hover obj
                //
                document.hoverObjs.push({
                    text: "",
                    start: textDocument.offsetAt(new vscode.Position(line, col)),
                    end: textDocument.offsetAt(new vscode.Position(line, col + len)),
                    content: new vscode.MarkdownString("".concat(type, " ").concat(text, "\n\n-----\n").concat(desc, "\n\n-----\n declared in ").concat(decl_file, " on line ").concat(decl_line))
                });
                break;
            }
            case (3): {
                var col = parseInt(getNextDataPoint());
                var len = parseInt(getNextDataPoint());
                var text = getNextDataPoint();
                var decl_file = getNextDataPoint();
                var decl_line = getNextDataPoint();
                var type = getNextDataPoint();
                var desc = getNextDataPoint();
                var desc_return = getNextDataPoint();
                r.push({
                    line: line,
                    startCharacter: col,
                    length: len,
                    tokenType: "function",
                    tokenModifiers: []
                });
                //console.log("[c+=2] highlight: ",r.at(r.length-1));
                //
                //add hover obj
                //
                document.hoverObjs.push({
                    text: "",
                    start: textDocument.offsetAt(new vscode.Position(line, col)),
                    end: textDocument.offsetAt(new vscode.Position(line, col + len)),
                    content: new vscode.MarkdownString("".concat(type, " ").concat(text, "\n\n-----\n").concat(desc, "\n").concat(desc_return, "\n\n-----\n declared in ").concat(decl_file, " on line ").concat(decl_line))
                });
                break;
            }
            case (4): {
                var col = parseInt(getNextDataPoint());
                var len = parseInt(getNextDataPoint());
                var text = getNextDataPoint();
                var decl_file = getNextDataPoint();
                var decl_line = getNextDataPoint();
                var type = getNextDataPoint();
                //let desc = getNextDataPoint();
                var desc = "";
                ////this is the ultimate band-aid fix, but whatever (implemented 18.11.2023)
                //if(textDocument.getText().charAt(textDocument.offsetAt(new vscode.Position(line,col-1))) != ' ')
                //    col-=2;
                r.push({
                    line: line,
                    startCharacter: col,
                    length: len,
                    tokenType: "parameter",
                    tokenModifiers: []
                });
                //console.log("[c+=2] highlight: ",r.at(r.length-1));
                //
                //add hover obj
                //
                document.hoverObjs.push({
                    text: "",
                    start: textDocument.offsetAt(new vscode.Position(line, col)),
                    end: textDocument.offsetAt(new vscode.Position(line, col + len)),
                    content: new vscode.MarkdownString("(parameter) ".concat(type, " ").concat(text, "\n\n-----\n").concat(desc, "\n\n-----\n declared in ").concat(decl_file, " on line ").concat(decl_line))
                });
                break;
            }
            case (5): {
                //number
                var col = parseInt(getNextDataPoint());
                var len = parseInt(getNextDataPoint());
                var value = parseInt(getNextDataPoint());
                var numsysname = getNextDataPoint();
                r.push({
                    line: line,
                    startCharacter: col,
                    length: len,
                    tokenType: "number",
                    tokenModifiers: []
                });
                //console.log("[c+=2] number highlight: ",r.at(r.length-1));
                //
                //add hover obj
                //
                document.hoverObjs.push({
                    text: "",
                    start: textDocument.offsetAt(new vscode.Position(line, col)),
                    end: textDocument.offsetAt(new vscode.Position(line, col + len)),
                    content: new vscode.MarkdownString("integer: ".concat(value))
                });
                break;
            }
            case (6): {
                //number
                var col = parseInt(getNextDataPoint());
                var len = parseInt(getNextDataPoint());
                r.push({
                    line: line,
                    startCharacter: col,
                    length: len,
                    tokenType: "class",
                    tokenModifiers: []
                });
                //console.log("[c+=2] litop highlight: ",r.at(r.length-1));
                break;
            }
        }
    }
    //return
    return r;
}
var DocumentSemanticTokensProvider = /** @class */ (function () {
    function DocumentSemanticTokensProvider() {
    }
    DocumentSemanticTokensProvider.prototype.provideDocumentSemanticTokens = function (document, token) {
        return __awaiter(this, void 0, void 0, function () {
            var allTokens, builder;
            var _this = this;
            return __generator(this, function (_a) {
                console.log("[c+=2] fetching document tokens");
                allTokens = parse(document);
                builder = new vscode.SemanticTokensBuilder();
                allTokens.forEach(function (token) {
                    builder.push(token.line, token.startCharacter, token.length, _this._encodeTokenType(token.tokenType), _this._encodeTokenModifiers(token.tokenModifiers));
                });
                return [2 /*return*/, builder.build()];
            });
        });
    };
    DocumentSemanticTokensProvider.prototype._encodeTokenType = function (tokenType) {
        if (tokenTypes.has(tokenType)) {
            return tokenTypes.get(tokenType);
        }
        else if (tokenType === 'notInLegend') {
            return tokenTypes.size + 2;
        }
        return 0;
    };
    DocumentSemanticTokensProvider.prototype._encodeTokenModifiers = function (strTokenModifiers) {
        var result = 0;
        for (var i = 0; i < strTokenModifiers.length; i++) {
            var tokenModifier = strTokenModifiers[i];
            if (tokenModifiers.has(tokenModifier)) {
                result = result | (1 << tokenModifiers.get(tokenModifier));
            }
            else if (tokenModifier === 'notInLegend') {
                result = result | (1 << tokenModifiers.size + 2);
            }
        }
        return result;
    };
    return DocumentSemanticTokensProvider;
}());
//# sourceMappingURL=extension.js.map