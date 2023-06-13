import tensorflow_hub as hub
import tensorflow as tf
import numpy as np
import sys
import json
import os

print('{"test": 123}')
sys.stdout.flush()

# Define the URL of the model and the local directory to cache the model
MODEL_URL = "https://tfhub.dev/google/universal-sentence-encoder/4"
MODEL_DIR = './embedding'
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)
    os.environ['TFHUB_CACHE_DIR'] = MODEL_DIR

# Load the Universal Sentence Encoder's TF Hub module
model = hub.load(MODEL_URL)

def embed_text(text):
    # Compute a representation for the provided texts
    embedding = model([text])

    # We return the embedding as a numpy array, which we convert to a list so it can be JSON serialized
    return np.array(embedding).tolist()

if __name__ == "__main__":
    # Accept input from standard input
    with open('debug.txt', 'w') as f:
        f.write('About to read from stdin...\n')
        text = sys.stdin.read()
        f.write(f'Read from stdin: {text}\n')

    # Get the embedding
    embedding = embed_text(text)

    # Create a JSON object with the embedding
    result = {"embedding": embedding}

    # Print the JSON object
    print(json.dumps(result))