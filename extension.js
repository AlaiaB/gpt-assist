// Importing required modules
const vscode = require('vscode');
const tasks = require('./tasks.json');
const { callOpenAI } = require('./openai');
const { getTotalTokens, tokenStatusBarItem } = require('./vars');

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
                const response = await callOpenAI(text, task);
                // Display the OpenAI response to the user
                vscode.window.showInformationMessage(response);
            } catch (err) {
                vscode.window.showErrorMessage('Error: ' + err);
            }
        }
    });

    context.subscriptions.push(helloWorldDisposable, openAIDisposable);
}

/**
 * Function to deactivate the extension
 */
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
