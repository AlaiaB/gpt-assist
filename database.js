const Datastore = require('nedb-promises');
const path = require('path');
const vscode = require('vscode');
const fs = require('fs');

let dbPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.gpt-assist.db');
let db = fs.existsSync(dbPath) ? Datastore.create({ filename: dbPath }) : null;

let funcDbPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.gpt-assist-functions.db');
let funcDb = fs.existsSync(funcDbPath) ? Datastore.create({ filename: funcDbPath }) : null;

let metaDbPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.gpt-assist-meta.db');
let metaDb = fs.existsSync(metaDbPath) ? Datastore.create({ filename: metaDbPath }) : null;

/**
 * Sets the initialization flag for a file in the database.
 * @param {string} filePath - The path to the file.
 * @param {boolean} isInitialized - Whether or not the file has been indexed.
 */
async function setFileInitializationFlag(filePath, isInitialized) {
    try {
        if (!metaDb) {
            metaDb = Datastore.create({ filename: metaDbPath });
        }

        // Check if the flag already exists
        let flag = await metaDb.findOne({ key: filePath });
        
        if (flag) {
            // If the flag exists, update it
            await metaDb.update({ key: filePath }, { $set: { value: isInitialized } });
        } else {
            // If the flag does not exist, insert it
            await metaDb.insert({ key: filePath, value: isInitialized });
        }
    } catch (err) {
        console.error('Error setting file initialization flag:', err);
    }
}

/**
 * Gets the initialization flag for a file from the database.
 * @param {string} filePath - The path to the file.
 * @returns {boolean} Whether or not the file has been indexed.
 */
async function getFileInitializationFlag(filePath) {
    try {
        if (!metaDb) {
            return null;
        }

        // Retrieve the flag
        let flag = await metaDb.findOne({ key: filePath });
        return flag ? flag.value : null;
    } catch (err) {
        console.error('Error getting file initialization flag:', err);
    }
}

/**
 * Inserts a new function into the database.
 * @param {string} path - The file path.
 * @param {string} name - The function name.
 * @param {Array} embedding - The embedding.
 */
async function insertFunction(path, name, embedding) {
    try {
        if (!funcDb) {
            funcDb = Datastore.create({ filename: funcDbPath });
        }

        let newFunction = { path: path, name: name, embedding: embedding.embedding, lastModified: new Date() };
        await funcDb.insert(newFunction);
    } catch (err) {
        console.error('Error inserting function:', err);
    }
}

/**
 * Retrieves a function from the database based on its name.
 * @param {string} name - The function name.
 * @returns {Object} The function.
 */
async function retrieveFunction(name) {
    try {
        if (!funcDb) {
            return null;
        }

        // Retrieve the function
        let func = await funcDb.findOne({ name: name });
        return func;
    } catch (err) {
        console.error('Error retrieving function:', err);
    }
}

/**
 * Inserts a new memory into the database.
 * @param {string} prompt - The prompt text.
 * @param {string} output - The output text.
 */
async function insertMemory(prompt, output, summary, importance) {
    try {
        if (!db) {
            db = Datastore.create({ filename: dbPath });
        }
        let now = Date.now();
        let lastAccessedMemory = await db.findOne({}).sort({ accessedAt: -1 });
        let timeDifference = now - (lastAccessedMemory ? lastAccessedMemory.accessedAt : now);
        let newMemory = { prompt: prompt, output: output, summary: summary, importance: importance, accessedAt: now, timeDifference: timeDifference, recencyScore: 1 };
        await db.insert(newMemory);
    } catch (err) {
        console.error('Error inserting memory:', err);
    }
}

/**
 * Calculates the recency scores for all memories in the database.
 */
async function calculateRecencyScores() {
    try {
        if (!db) {
            return;
        }
        let now = Date.now();
        let memories = await db.find({}).sort({ accessedAt: -1 }).limit(2);
        let cumulativeTimeDifference = memories.length > 1 ? now - memories[1].accessedAt : 0;
        memories = await db.find({}).sort({ accessedAt: 1 });
        for (let memory of memories) {
            cumulativeTimeDifference += memory.timeDifference;
            let recencyScore = Math.pow(0.99, cumulativeTimeDifference / (1000 * 60 * 60)); // Exponential decay over hours
            await db.update({ _id: memory._id }, { $set: { recencyScore: recencyScore } });
        }
    } catch (err) {
        console.error('Error calculating recency scores:', err);
    }
}

/**
 * Retrieves the most recent memory from the database.
 * @param {string} query - The query text.
 * @returns {Object} The most recent memory.
 */
async function retrieveMemory(query) {
    try {
        if (!db) {
            return null;
        }
        // Retrieve the most recent memory
        let memory = await db.findOne({}).sort({ accessedAt: -1 });
        if (!memory) {
            return null;
        }
        // Update the accessedAt and timeDifference properties of the memory
        let now = Date.now();
        await db.update({ _id: memory._id }, { $set: { accessedAt: now } });
        let nextMemory = await db.findOne({}).sort({ accessedAt: -1 }).skip(1);
        if (nextMemory) {
            let timeDifference = now - nextMemory.accessedAt;
            await db.update({ _id: nextMemory._id }, { $set: { timeDifference: timeDifference } });
        }
        // Return the memory
        return memory;
    } catch (err) {
        console.error('Error retrieving memory:', err);
    }
}

async function insertMemoryFromFile() {
    const filePath = path.join(__dirname, 'dummy_prompt.txt');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const [prompt, output] = fileContents.split('\n');
    let summaryMatch = output.match(/Summary: (.*?)\n/);
    let importanceMatch = output.match(/Importance: (.*?)\n/);
    let summary = summaryMatch ? summaryMatch[1] : '';
    let importance = importanceMatch ? importanceMatch[1] : '';
    insertMemory(prompt, output, summary, importance);
  }
  
  
module.exports = { insertMemory, calculateRecencyScores, retrieveMemory, insertMemoryFromFile,
    insertFunction, retrieveFunction,
    setFileInitializationFlag, getFileInitializationFlag };
