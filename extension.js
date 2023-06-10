// Importing required modules
const vscode = require('vscode');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const path = require('path');
const tasks = require('./tasks.json');

// Configuring OpenAI API
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Initializing variables
let conversationHistory = '';
let totalTokens = 0;
let basePrompt = '';
let model = vscode.workspace.getConfiguration('gpt-assist').get('model');
let tokenStatusBarItem;

/**
 * Function to call OpenAI API and get the response
 * @param {string} text - The text to be sent to the OpenAI API
 * @param {string} task - The task to be performed by the OpenAI API
 * @returns {string} output - The response from the OpenAI API
 */
async function callOpenAI(text, task) {
    const prompt = task + text;
    const output = "This is a pregenerated response.";
    totalTokens += 60;
    tokenStatusBarItem.text = `Tokens used: ${totalTokens}`;

    // Append the input and output to the conversation history
    conversationHistory += `\nUser: ${task}:\n${text}\nAI: ${output}`;

    // Check if the markdown file exists, if not, create it
    const filePath = path.join(__dirname, 'conversation.md');
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '');
    }

    // Append the input and output to the markdown file
    fs.appendFileSync(filePath, `---\n\n**User:**\n${task}:\n${text}\n\n_AI:_\n${output}\n\n`);

    // Open the markdown file in a new editor
    const document = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside);

    return output;
}

/**
 * Function to activate the extension
 * @param {vscode.ExtensionContext} context - The context in which the extension is run
 */
function activate(context) {
    console.log('Congratulations, your extension "gpt-assist" is now active!');

    tokenStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    tokenStatusBarItem.text = `Tokens used: ${totalTokens}`;
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
