const { spawn } = require('child_process');

function generateEmbedding(text) {
    return new Promise((resolve, reject) => {
        const python = spawn('python', ['./embedder.py']);
        let dataString = '';

        python.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        python.stdout.on('end', () => {
            resolve(JSON.parse(dataString));
        });

        python.stdin.write(text);
        python.stdin.end();
    });
}

module.exports = { generateEmbedding };
