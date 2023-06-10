const { Configuration, OpenAIApi } = require('openai');
const { get_encoding } = require('@dqbd/tiktoken');
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { setTotalTokens, getTotalTokens, tokenStatusBarItem } = require('./vars');
const { insertMemory, retrieveMemory } = require('./database');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
let model = "dummy" // vscode.workspace.getConfiguration('gpt-assist').get('model');

/**
 * Function to call OpenAI API and get the response
 * @param {string} text - The text selected by the user to be sent to the OpenAI API
 * @param {string} task - The prompt associated to the task to be performed by the OpenAI API
 * @returns {string} output - The response from the OpenAI API
 */
async function callOpenAI(text, task) {
  // Retrieve a relevant memory from the database
  let memory = await retrieveMemory({ text: text , task: task});
  let prompt = task + (memory ? memory.prompt + '\n' : '') + text;

  // Get the tokenizer and calculate the token count only when the model is not "dummy"
  let tokenCount;
  let cost;
  if (model !== "dummy") {
    const enc = get_encoding(model);
    tokenCount = enc.encode(prompt).length;
    cost = (tokenCount / 1000) * 0.01; // 1 cent per 1000 tokens
    enc.free();
  }

  let output;
  if (model !== "dummy") {
    // Inform the user about the number of tokens and the cost
    const userConfirmation = await vscode.window.showInformationMessage(
      `Your prompt contains ${tokenCount} tokens. The cost will be $${cost.toFixed(2)}. Do you want to proceed?`,
      { modal: true },
      'Yes'
    );

    // If the user confirms, call the OpenAI API
    if (userConfirmation === 'Yes') {
      const response = await openai.createCompletion({
        model: model,
        prompt: prompt,
        max_tokens: 60,
      });
      output = response.data.choices[0].text;
    } else {
      return; // Exit the function if the user doesn't confirm
    }
  } else {
    output = "This is a pregenerated response.";
  }

  // Store the prompt and output as a new memory in the database
  insertMemory(prompt, output);

  setTotalTokens(getTotalTokens() + tokenCount);
  tokenStatusBarItem.text = `Tokens used: ${getTotalTokens()}`;

  // Check if the markdown file exists, if not, create it
  const filePath = path.join(__dirname, 'conversation.md');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
  }

  // Append the input and output to the markdown file
  fs.appendFileSync(
    filePath,
    `---\n\n**User:**\n${task}:\n${text}\n\n_AI:_\n${output}\n\n`
  );

  // Open the markdown file in a new editor
  const document = await vscode.workspace.openTextDocument(filePath);
  await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside);

  return output;
}

module.exports = { callOpenAI };
