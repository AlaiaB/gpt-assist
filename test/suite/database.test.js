const assert = require('assert');
const { insertMemory, calculateRecencyScores, retrieveMemory, insertFunction, retrieveFunction } = require('../database');

suite('Database Test Suite', () => {
    suite('Memories', () => {
        test('should insert a memory into the database', async () => {
            await insertMemory('prompt', 'output', 'summary', 'importance');
            let memory = await retrieveMemory('prompt');
            assert(memory);
            assert.strictEqual(memory.prompt, 'prompt');
        });

        test('should calculate recency scores', async () => {
            await insertMemory('prompt1', 'output1', 'summary1', 'importance1');
            await insertMemory('prompt2', 'output2', 'summary2', 'importance2');
            await calculateRecencyScores();
            let memory = await retrieveMemory('prompt1');
            assert(memory);
            assert(memory.recencyScore);
        });
    });

    suite('Functions', () => {
        test('should insert a function into the database', async () => {
            let embedding = [0.5, 0.4, 0.6];
            await insertFunction('path', 'name', embedding);
            let func = await retrieveFunction('name');
            assert(func);
            assert.strictEqual(func.name, 'name');
            assert.deepStrictEqual(func.embedding, embedding);
        });
    });
});
