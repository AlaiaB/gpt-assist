// Importing required modules
const vscode = require('vscode');
const tasks = require('./tasks.json');
const { callOpenAI } = require('./openai');
const { getTotalTokens, tokenStatusBarItem } = require('./vars');
const { insertMemoryFromFile, getFileInitializationFlag, setFileInitializationFlag, insertFunction } = require('./database');
const { parseWorkspace } = require('./codeParser');
const { generateEmbedding } = require('./embedder');

/**
 * Function to activate the extension
 * @param {vscode.ExtensionContext} context - The context in which the extension is run
 */
function activate(context) {
    console.log('Congratulations, your extension "gpt-assist" is now active!');

    tokenStatusBarItem.text = `Tokens used: ${getTotalTokens()}`;
    tokenStatusBarItem.show();
    context.subscriptions.push(tokenStatusBarItem);

    let helloWorldDisposable = vscode.commands.registerCommand('gpt-assist.helloWorld', function () {
        vscode.window.showInformationMessage('Hello World from gpt-assist!');
    });

    let openAIDisposable = vscode.commands.registerCommand('gpt-assist.call_gpt', async function () {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            let document = editor.document;
            let selection = editor.selection;

            // Get the word within the selection
            let text = document.getText(selection);

            // Ask the user to choose a task
            const taskOptions = Object.keys(tasks);
            taskOptions.push('Custom Prompt');
            let task = await vscode.window.showQuickPick(taskOptions, { placeHolder: 'Choose a task' });
            if (task === 'Custom Prompt') {
                task = await vscode.window.showInputBox({ prompt: 'Enter your custom prompt' });
            }

            else {
                task = tasks[task]
            }

            try {
                const response = await callOpenAI(text, task, true, true);
                // Display the OpenAI response to the user
                vscode.window.showInformationMessage(response);
            } catch (err) {
                vscode.window.showErrorMessage('Error: ' + err);
            }
        }
    });

    let insertMemoryCommand = vscode.commands.registerCommand('gpt-assist.insertMemory', async () => {
        try {
          await insertMemoryFromFile();
          vscode.window.showInformationMessage('Memory inserted successfully.');
        } catch (error) {
          vscode.window.showErrorMessage('Failed to insert memory: ' + error.message);
        }
    });

    let initializeWorkspaceDisposable = vscode.commands.registerCommand('gpt-assist.initializeWorkspace', async function () {
        const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    
        await parseWorkspace(workspaceFolder, async (filePath, funcName, funcCode) => {
            let isInitialized = await getFileInitializationFlag(filePath);
            
            if (!isInitialized) {
                // generate embedding for function
                let embedding = await generateEmbedding(funcCode);
    
                // insert the function into your database
                await insertFunction(filePath, funcName, embedding);
    
                // Mark the file as initialized
                await setFileInitializationFlag(filePath, true);
    
                vscode.window.showInformationMessage(`File ${filePath} has been initialized.`);
            } else {
                vscode.window.showInformationMessage(`File ${filePath} has already been initialized.`);
            }
        });
    
        vscode.window.showInformationMessage('Workspace initialization complete.');
    });

    context.subscriptions.push(helloWorldDisposable, openAIDisposable, insertMemoryCommand, initializeWorkspaceDisposable);
}

/**
 * Function to deactivate the extension
 */
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
