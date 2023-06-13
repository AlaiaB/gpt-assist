const { spawn } = require('child_process');

async function generateEmbedding(text) {
    return new Promise((resolve, reject) => {
        const python = spawn('python', ['./embedder.py']);
        let dataString = '';

        python.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        python.stderr.on('data', (data) => {
            console.error(`Python error: ${data}`);
        });

        python.stdout.on('end', () => {
            try {
                resolve(JSON.parse(dataString));
            } catch (error) {
                reject(error);
            }
        });

        python.stdin.write(text);
        python.stdin.end();
    });
}
if (require.main === module) {
    // If the script is run directly, perform a test
    generateEmbedding(`async function generateEmbedding(text) {
        return new Promise((resolve, reject) => {
            const python = spawn('python', ['./embedder.py']);
            let dataString = '';
    
            python.stdout.on('data', (data) => {
                dataString += data.toString();
            });
    
            python.stdout.on('end', () => {
                try {
                    resolve(JSON.parse(dataString));
                } catch (error) {
                    reject(error);
                }
            });
    
            python.stdin.write(text);
            python.stdin.end();
        });
    }`)
        .then(embedding => console.log(embedding))
        .catch(error => console.error(error));
}

module.exports = { generateEmbedding };
