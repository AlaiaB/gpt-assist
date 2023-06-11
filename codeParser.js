// Import required modules
const esprima = require('esprima');
const estraverse = require('estraverse');
const fs = require('fs');
const path = require('path');

/**
 * Parses a JavaScript file and extracts information about function declarations.
 * @param {string} filePath - The path of the JavaScript file to parse.
 * @returns {Array} - An array of objects containing function names and their corresponding code.
 */
async function parseFile(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    let ast = esprima.parse(code, { range: true });
    let functions = [];

    estraverse.traverse(ast, {
        enter: function (node) {
            if (node.type === 'FunctionDeclaration') {
                let funcCode = code.substring(node.range[0], node.range[1]);
                let funcName = node.id ? node.id.name : null;
                functions.push({ name: funcName, code: funcCode });
            }
        }
    });

    return functions;
}

/**
 * Parses all JavaScript files in a workspace directory and invokes a callback function for each function found.
 * @param {string} workspacePath - The path of the workspace directory.
 * @param {Function} callback - The callback function to invoke for each function found.
 */
async function parseWorkspace(workspacePath, callback) {
    let files = fs.readdirSync(workspacePath);

    for (let file of files) {
        if (path.extname(file) !== '.js') continue;

        let filePath = path.join(workspacePath, file);
        let functions = await parseFile(filePath);

        for (let func of functions) {
            callback(filePath, func.name, func.code);
        }
    }
}

// Export the parseFile and parseWorkspace functions
module.exports = { parseFile, parseWorkspace };
