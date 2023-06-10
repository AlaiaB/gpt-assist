const vscode = require('vscode');
let totalTokens = 0;
let tokenStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

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
    };
  