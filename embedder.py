import tensorflow_hub as hub
import tensorflow as tf
import numpy as np
import sys

def embed_text(text):
    # Load the Universal Sentence Encoder's TF Hub module
    model = hub.load("https://tfhub.dev/google/universal-sentence-encoder/5")

    # Compute a representation for the provided texts
    embedding = model([text])

    # We return the embedding as a numpy array, which we convert to a list so it can be JSON serialized
    return np.array(embedding).tolist()

if __name__ == "__main__":
    # Accept input from standard input
    text = sys.stdin.read()

    # Get the embedding
    embedding = embed_text(text)

    print(embedding)
