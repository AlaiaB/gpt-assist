const vscode = require('vscode');
let totalTokens = 0;
let tokenStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
const projectDescription = "GPT-Assist is a VS Code extension that integrates OpenAI's GPT-3 into the coding workflow. It offers features like context-aware AI responses, simulated memory, code snippets, auto-documentation, code formatting, testing, error checking, and version control integration.";
function setTotalTokens(value) {
    totalTokens = value;
  }

function getTotalTokens() {
    return totalTokens;
  }

// variables.js
module.exports = {
    setTotalTokens,
    getTotalTokens,
    tokenStatusBarItem,
    projectDescription,
    };
  