import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {
    DocumentSelector,
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind,
} from 'vscode-languageclient/node';
import { CancellationToken,Hover,HoverProvider,InputBox,InputBoxOptions } from 'vscode';

const tokenTypes = new Map<string, number>();
const tokenModifiers = new Map<string, number>();

const legend = (function() {
	const tokenTypesLegend = [
		'comment', 'string', 'keyword', 'number', 'regexp', 'operator', 'namespace',
		'type', 'struct', 'class', 'interface', 'enum', 'typeParameter', 'function',
		'method', 'decorator', 'macro', 'variable', 'parameter', 'property', 'label'
	];
	tokenTypesLegend.forEach((tokenType, index) => tokenTypes.set(tokenType, index));

	const tokenModifiersLegend = [
		'declaration', 'documentation', 'readonly', 'static', 'abstract', 'deprecated',
		'modification', 'async'
	];
	tokenModifiersLegend.forEach((tokenModifier, index) => tokenModifiers.set(tokenModifier, index));

	return new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
})();

let client: LanguageClient;

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}

const c2_proj_gen_dir_struct = async () => {
    if(vscode.workspace.workspaceFolders !== undefined)
    {
        let decoder = new TextDecoder;
        let project = JSON.parse(
            decoder.decode(
                await vscode.workspace.fs.readFile(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri,'/.vscode/.cp2project.json'))
            )
        );
        //
        // create directories
        //
        for(let I in project["srcdirs"])
        {
            let dir = project["srcdirs"][I];
            await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri,'/'+dir));
            await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri,'/build/'+dir));
        }
        for(let I in project["incdirs"])
        {
            let dir = project["incdirs"][I];
            await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri,'/'+dir));
        }
        await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri,'/lib'));
    }
    else
    {
        vscode.window.showErrorMessage("c+=2: cant generate makefile as there are no open directories");
    }
}

const c2_proj_gen_makefile = async () => {
    if(vscode.workspace.workspaceFolders !== undefined)
    {
        let encoder = new TextEncoder;
        let decoder = new TextDecoder;
        let project = JSON.parse(
            decoder.decode(
                await vscode.workspace.fs.readFile(vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri,'/.vscode/.cp2project.json'))
            )
        )
        let data: Uint8Array;
        //
        // generate makefile
        //
        let makefile: string = "";
        let deplists: string[] = [];
        let srclists: string[] = [];
        let objlists: string[] = [];
        for(let III in project["languages"])
        {
            let lang = project["languages"][III];
            for(let I in project["srcdirs"])
            {
                let dir = project["srcdirs"][I];
                for(let II in project["extensions"][lang])
                {
                    let ext = project["extensions"][lang][II];
                    makefile+="SOURCE_"+lang+"_"+ext+"_"+dir+"=$(wildcard "+dir+"/*."+ext+")\n";
                    makefile+="OBJECTS_"+lang+"_"+ext+"_"+dir+"=$(patsubst "+dir+"/%."+ext+",build/"+dir+"/%.o,$(SOURCE_"+lang+"_"+ext+"))\n";
                    makefile+="DEPFILES_"+lang+"_"+ext+"_"+dir+"=$(patsubst "+dir+"/%."+ext+",build/"+dir+"/%.d,$(SOURCE_"+lang+"_"+ext+"))\n";
                    deplists.push("DEPFILES_"+lang+"_"+ext+"_"+dir);
                    srclists.push("SOURCE_"+lang+"_"+ext+"_"+dir);
                    objlists.push("OBJECTS_"+lang+"_"+ext+"_"+dir);
                }
            }
        }
        for(let I in project["srcdirs"])
        {
            let dir = project["srcdirs"][I];
            for(let III in project["languages"])
            {
                let lang = project["languages"][III];
                for(let II in project["extensions"][lang])
                {
                    let ext = project["extensions"][lang][II];
                    let compiler = project["compilers"][lang];
                    makefile+="build/"+dir+"/%.o: "+dir+"/%."+ext+"\n";
                    makefile+="\t@"+compiler+" -o $@ $<\n";
                    makefile+="\t$(info  	"+compiler+"	$<)\n";
                }
            }
        }
        for(let I in deplists)
        {
            let list = deplists[I];
            makefile+="-include $("+list+")\n";
        }
        makefile+=project["name"]+":";
        let objcombined = "";
        for(let I in objlists)
        {
            objcombined+=" $("+objlists[I]+")";
        }
        makefile+=objcombined+"\n";
        makefile+="\t@"+project["linker"]+" -o "+project["name"]+".exe"+objcombined+"\n";
        makefile+="\t$(info  	"+project["linker"]+"	$<)\n";
        //
        // write makefile
        //
        data = encoder.encode(makefile);
        if(vscode.workspace.workspaceFolders !== undefined)
        {
            await vscode.workspace.fs.writeFile(
                vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri,'/makefile'),
                data
            );
        }
    }
    else
    {
        vscode.window.showErrorMessage("c+=2: cant generate makefile as there are no open directories");
    }
}

const setup_c2_proj = async () => {
    console.log("[c+=2] setting up new project...");
    //
    // general project settings
    //
    let type: string = "";
    let name: string = "";
    await vscode.window.showInputBox(
        {
            title: "General Settings",
            placeHolder: "enter the name of your project",
        }
    ).then(
        function(value)
        {
            if(value !== undefined)
                name = value;
        },
        function(error)
        {
        }
    );
    await vscode.window.showQuickPick(
        ["Executable","Library"],
        {
            canPickMany: false,
            title: "General Settings",
            placeHolder: "pick a project type."
        }
    ).then(
        function(value)
        {
            if(value !== undefined)
                type = value;
        },
        function(error)
        {
        }
    );
    //
    // language support: c+=2
    //
    let compiler_c2 = "";
    await vscode.window.showInputBox(
        {
            title: "c+=2 support - compiler",
            placeHolder: "ex: '/usr/bin/cp2' or 'cp2' (dont include quotes)",
        }
    ).then(
        function(value)
        {
            if(value !== undefined)
                compiler_c2 = value;
        },
        function(error)
        {
        }
    );
    //
    // language support: c
    //
    let support_c: boolean = false;
    let compiler_c: string = "";
    await vscode.window.showQuickPick(
        ["Yes","No"],
        {
            canPickMany: false,
            title: "Include C support?"
        }
    ).then(
        async function(value)
        {
            if(value === "Yes")
                {
                    await vscode.window.showInputBox(
                        {
                            title: "C support - compiler",
                            placeHolder: "ex: '/usr/bin/gcc' or 'gcc' (dont include quotes)",
                        }
                    ).then(
                        function(value)
                        {
                            support_c = true;
                            if(value !== undefined)
                                compiler_c = value;
                        },
                        function(error)
                        {
                        }
                    );
                }
        },
        function(error)
        {
        }
    );
    //
    // language support: c++
    //
    let support_cxx: boolean = false;
    let compiler_cxx: string = "";
    await vscode.window.showQuickPick(
        ["Yes","No"],
        {
            canPickMany: false,
            title: "Include c++ support?"
        }
    ).then(
        async function(value)
        {
            if(value === "Yes")
                {
                    await vscode.window.showInputBox(
                        {
                            title: "c++ support - compiler",
                            placeHolder: "ex: '/usr/bin/g++' or 'g++' (dont include quotes)",
                        }
                    ).then(
                        function(value)
                        {
                            support_cxx = true;
                            if(value !== undefined)
                                compiler_cxx = value;
                        },
                        function(error)
                        {
                        }
                    );
                }
        },
        function(error)
        {
        }
    );
    //
    // linker
    //
    let linker: string = "";
    await vscode.window.showInputBox(
        {
            title: "Linker",
            placeHolder: "ex: '/usr/bin/ld' or 'ld' (dont include quotes)",
        }
    ).then(
        function(value)
        {
            if(value !== undefined)
                linker = value;
        },
        function(error)
        {
        }
    );
    //
    // git
    //
    let initGit: boolean = false;
    await vscode.window.showQuickPick(
        ["Yes","No"],
        {
            canPickMany: false,
            title: "Initiate Git repository?"
        }
    ).then(
        function(value)
        {
            if(value === "Yes")
            {
                initGit = true;
            }
        },
        function(error)
        {
        }
    );
    //
    // generate ./.vscode/.cp2project.json
    //
    console.log("[c+=2] generating ./.vscode/.cp2project.json...");
    let cp2project = 
    {
        "name":name,
        "type":type,
        "linker":linker,
        "languages": [
            "cp2"
        ],
        "extensions": {
            "c":["c"],
            "cxx":["cpp","cxx"],
            "cp2":["c2","cp2"]
        },
        "compilers": {
            "c":"",
            "cxx":"",
            "cp2":""
        },
        "srcdirs": [
            "src"
        ],
        "incdirs": [
            "inc"
        ]
    };
    if(support_c)
    {
        cp2project["compilers"]["c"] = compiler_c;
        cp2project["languages"].push("c");
    }
    if(support_cxx)
    {
        cp2project["compilers"]["cxx"] = compiler_cxx;
        cp2project["languages"].push("cxx");
    }
    cp2project["compilers"]["cp2"] = compiler_c2;
    let jstr = JSON.stringify(cp2project,null,4);
    let encoder = new TextEncoder;
    let data = encoder.encode(jstr);
    if(vscode.workspace.workspaceFolders !== undefined)
    {
        await vscode.workspace.fs.writeFile(
            vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri,'/.vscode/.cp2project.json'),
            data
        );
        await vscode.commands.executeCommand("c+=2.c2_proj_gen_makefile");
        await vscode.commands.executeCommand("c+=2.c2_proj_gen_dir_struct");
        //
        //initialize git
        //
        const { execSync } = require('child_process');
        execSync("git init "+vscode.workspace.workspaceFolders[0].uri.fsPath);
        //
        //write .gitignore
        //
        let gitignore: string = "";
        gitignore+="# Build\n";
        gitignore+="*.d\n";
        gitignore+="*.o\n";
        gitignore+="# Executables\n";
        gitignore+="*.exe\n";
        gitignore+="*.out\n";
        gitignore+="*.app\n";
        data = encoder.encode(gitignore);
        await vscode.workspace.fs.writeFile(
            vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri,'/.gitignore'),
            data
        );
        //
        //finish up
        //
        console.log("[c+=2] done!");
    }
    else
    {
        vscode.window.showErrorMessage("c+=2: cant create project as there are no open directories");
    }
};

var c2c: string = "";
export function activate(context: vscode.ExtensionContext) {
    console.log("[c+=2] language extension loading...");
    //
    //fetch c2c
    //
    let __c2c = vscode.workspace.getConfiguration("c+=2");
    c2c = __c2c["compilerCommand"];
    console.log("[c+=2] c2c: "+c2c);
    //
    //register commands
    //
    context.subscriptions.push(vscode.commands.registerCommand("c+=2.setup_c2_proj",setup_c2_proj));
    context.subscriptions.push(vscode.commands.registerCommand("c+=2.c2_proj_gen_makefile",c2_proj_gen_makefile));
    context.subscriptions.push(vscode.commands.registerCommand("c+=2.c2_proj_gen_dir_struct",c2_proj_gen_dir_struct));
    //
    //register semantic token provider
    //
	context.subscriptions.push(
        vscode.languages.registerDocumentSemanticTokensProvider(
            {
                language: 'c+=2' 
            },
            new DocumentSemanticTokensProvider(),
            legend
        )
    );
    //
    //register hover provider
    //
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            {
                language: 'c+=2'
            },
            new c2HoverProvider(),
        )
    );
    // The language server is implemented in node.js
    let serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
    let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    let serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions
        }
    };
    // Options to control the language client
    let clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'c+=2' }],
        synchronize: {
            // Notify the server about file changes to '.clientrc files contained in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };
    // Create the language client and start the client.
    client = new LanguageClient(
        'cpe2langserver',
        'c+=2 Language Server',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    client.start();
}

class hoverObj
{
    public text: string = "";
    public start: number = 0;
    public end: number = 0;
    public content: vscode.MarkdownString = new vscode.MarkdownString("");
}

class doc
{
    public name: string = "";
    public hoverObjs: hoverObj[] = [];
}
var docs: doc[] = [];

class c2HoverProvider implements vscode.HoverProvider {
    public provideHover(document: vscode.TextDocument, position: vscode.Position, token: CancellationToken): Hover | undefined
    {
        for(let I in docs)
        {
            let doc = docs[I];
            if(doc.name == document.fileName)
            {
                for(let II in doc.hoverObjs)
                {
                    let obj: hoverObj = doc.hoverObjs[II];
                    let offset = document.offsetAt(position);
                    if(offset >= obj.start && offset <= obj.end)
                    {
                        let result = new Hover(obj.content);
                        return result;
                    }
                }
            }
        }
        return undefined;
    }
}

interface IParsedToken {
	line: number;
	startCharacter: number;
	length: number;
	tokenType: string;
	tokenModifiers: string[];
}

let msg: string;
function getNextDataPoint(): string
{
    let I: number = 0;
    if(msg.length <= 0)return "";
    while(msg.charAt(I) != '\x0c' && msg.charAt(I) != '\n' && I<msg.length)
    {
        //console.log("[c+=2] looping...");
        //console.log("[c+=2] char: "+msg.charCodeAt(I));
        I++;
    }
    let result = msg.substring(0,I);
    msg = msg.substring(I+1);
    //console.log("[c+=2] result: "+result);
    return result;
}

function parse(textDocument: vscode.TextDocument): IParsedToken[] {
    const r: IParsedToken[] = [];
	//write data to temp file
	let fp = textDocument.uri.fsPath+".temp";
	fs.writeFileSync(fp,textDocument.getText());
    //call up compiler
    const { execSync } = require('child_process');
    //console.log("[c+=2] path: "+fp);
    let cmd: string = `${c2c} --vstc ${fp}`;
    console.log("[c+=2] compiler command: "+cmd);
    let stdout = execSync(cmd).toString();
	fs.unlinkSync(fp);//! delete temporary file
    //console.log(`[c+=2] stdout: ${stdout}`);
    let messages: string[] = [];
    let message: string = "";
    let document = undefined;
    for(let II in docs)
    {
        if(docs[II].name == textDocument.fileName)
        {
            document = docs[II];
            break;
        }
    }
    if(document !== undefined)
    {
        document.hoverObjs = [];
    }
    else
    {
        docs.push(
            {
                name: textDocument.fileName,
                hoverObjs: []
            }
        );
        document = docs[docs.length-1];
    }

    for(let I in stdout)
    {
        if(stdout[I] == '\n')
        {
            messages.push(message);
            //console.log(`[c+=2] message: ${message}`);
            message = "";
        }
        else
        {
            message += stdout[I];
        }
    }
    if(message != "")
        messages.push(message);
    document.hoverObjs = [];
    for(let m in messages)
    {
        msg = messages[m];
        //console.log("[c+=2] msg: "+msg);
        let ID = parseInt(getNextDataPoint());
        //console.log("[c+=2] ID: "+ID);
        let line = parseInt(getNextDataPoint())-1;
        if(line < 0)
            continue;
        switch(ID)
        {
            case(1):{
                let col = parseInt(getNextDataPoint());
                let len = parseInt(getNextDataPoint());
                let text = getNextDataPoint();
                let decl_file = getNextDataPoint();
                let decl_line = getNextDataPoint();
                let desc = getNextDataPoint();
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
                document.hoverObjs.push(
                    {
                        text: "",
                        start: textDocument.offsetAt(new vscode.Position(line,col)),
                        end: textDocument.offsetAt(new vscode.Position(line,col+len)),
                        content: new vscode.MarkdownString(`class ${text}\n\n-----\n${desc}\n\n-----\n declared in ${decl_file} on line ${decl_line}`)
                    }
                );
                break;
            }case(2):{
                let col = parseInt(getNextDataPoint());
                let len = parseInt(getNextDataPoint());
                let text = getNextDataPoint();
                let decl_file = getNextDataPoint();
                let decl_line = getNextDataPoint();
                let type = getNextDataPoint();
                let desc = getNextDataPoint();
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
                document.hoverObjs.push(
                    {
                        text: "",
                        start: textDocument.offsetAt(new vscode.Position(line,col)),
                        end: textDocument.offsetAt(new vscode.Position(line,col+len)),
                        content: new vscode.MarkdownString(`${type} ${text}\n\n-----\n${desc}\n\n-----\n declared in ${decl_file} on line ${decl_line}`)
                    }
                );
                break;
            }case(3):{
                let col = parseInt(getNextDataPoint());
                let len = parseInt(getNextDataPoint());
                let text = getNextDataPoint();
                let decl_file = getNextDataPoint();
                let decl_line = getNextDataPoint();
                let type = getNextDataPoint();
                let desc = getNextDataPoint();
                let desc_return = getNextDataPoint();
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
                document.hoverObjs.push(
                    {
                        text: "",
                        start: textDocument.offsetAt(new vscode.Position(line,col)),
                        end: textDocument.offsetAt(new vscode.Position(line,col+len)),
                        content: new vscode.MarkdownString(`${type} ${text}\n\n-----\n${desc}\n${desc_return}\n\n-----\n declared in ${decl_file} on line ${decl_line}`)
                    }
                );
                break;
            }case(4):{
                let col = parseInt(getNextDataPoint());
                let len = parseInt(getNextDataPoint());
                let text = getNextDataPoint();
                let decl_file = getNextDataPoint();
                let decl_line = getNextDataPoint();
                let type = getNextDataPoint();
                //let desc = getNextDataPoint();
                let desc = "";
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
                document.hoverObjs.push(
                    {
                        text: "",
                        start: textDocument.offsetAt(new vscode.Position(line,col)),
                        end: textDocument.offsetAt(new vscode.Position(line,col+len)),
                        content: new vscode.MarkdownString(`(parameter) ${type} ${text}\n\n-----\n${desc}\n\n-----\n declared in ${decl_file} on line ${decl_line}`)
                    }
                );
                break;
            }case(5):{
                //number
                let col = parseInt(getNextDataPoint());
                let len = parseInt(getNextDataPoint());
                let value = parseInt(getNextDataPoint());
                let numsysname = getNextDataPoint();
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
                document.hoverObjs.push(
                    {
                        text: "",
                        start: textDocument.offsetAt(new vscode.Position(line,col)),
                        end: textDocument.offsetAt(new vscode.Position(line,col+len)),
                        content: new vscode.MarkdownString(`integer: ${value}`)
                    }
                );
                break;
            }case(6):{
                //number
                let col = parseInt(getNextDataPoint());
                let len = parseInt(getNextDataPoint());
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

class DocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
	async provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.SemanticTokens> {
        console.log("[c+=2] fetching document tokens");
		const allTokens = parse(document);
		const builder = new vscode.SemanticTokensBuilder();
		allTokens.forEach((token) => {
			builder.push(token.line, token.startCharacter, token.length, this._encodeTokenType(token.tokenType), this._encodeTokenModifiers(token.tokenModifiers));
		});
		return builder.build();
	}

	private _encodeTokenType(tokenType: string): number {
		if (tokenTypes.has(tokenType)) {
			return tokenTypes.get(tokenType)!;
		} else if (tokenType === 'notInLegend') {
			return tokenTypes.size + 2;
		}
		return 0;
	}

	private _encodeTokenModifiers(strTokenModifiers: string[]): number {
		let result = 0;
		for (let i = 0; i < strTokenModifiers.length; i++) {
			const tokenModifier = strTokenModifiers[i];
			if (tokenModifiers.has(tokenModifier)) {
				result = result | (1 << tokenModifiers.get(tokenModifier)!);
			} else if (tokenModifier === 'notInLegend') {
				result = result | (1 << tokenModifiers.size + 2);
			}
		}
		return result;
	}
}
