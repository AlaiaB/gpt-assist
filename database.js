const Datastore = require('nedb-promises');
const path = require('path');
const vscode = require('vscode');
const fs = require('fs');

let dbPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.gpt-assist.db');
let db = fs.existsSync(dbPath) ? Datastore.create({ filename: dbPath }) : null;

/**
 * Inserts a new memory into the database.
 * @param {string} prompt - The prompt text.
 * @param {string} output - The output text.
 */
async function insertMemory(prompt, output) {
    try {
        if (!db) {
            db = Datastore.create({ filename: dbPath });
        }
        let now = Date.now();
        let lastAccessedMemory = await db.findOne({}).sort({ accessedAt: -1 });
        let timeDifference = now - (lastAccessedMemory ? lastAccessedMemory.accessedAt : now);
        let newMemory = { prompt: prompt, output: output, accessedAt: now, timeDifference: timeDifference, recencyScore: 1 };
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

module.exports = { insertMemory, calculateRecencyScores, retrieveMemory };
