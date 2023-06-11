# README for GPT

## extension.js

This script represents a Visual Studio Code (VS Code) extension that interacts with OpenAI's GPT model. The extension is made up of two exported functions, activate(context) and deactivate(), which are the entry and exit points of the extension, respectively.

    activate(context): This function is invoked when the extension is activated in VS Code.

        It first logs a message to the console and displays the current number of used tokens on a status bar item. It also adds this status bar item to the context's subscriptions to be properly disposed of when the extension is deactivated.

        It then sets up three commands ('gpt-assist.helloWorld', 'gpt-assist.call_gpt', and 'gpt-assist.insertMemory') that can be triggered by the user:

            'gpt-assist.helloWorld': This command shows a simple 'Hello World' message in VS Code's information message area.

            'gpt-assist.call_gpt': This command is more complex and is where the interaction with the OpenAI GPT model occurs. It first retrieves the selected text from the active text editor. Then it prompts the user to select a task from a predefined list or enter a custom task. Depending on the user's choice, it calls the OpenAI GPT model using the callOpenAI function, and then it displays the model's response as an information message in VS Code.

            'gpt-assist.insertMemory': This command calls the insertMemoryFromFile function to insert a memory into the database from a predefined file. It shows an information message if the memory is inserted successfully, otherwise, it shows an error message.

        Finally, it adds all the three commands to the context's subscriptions to be properly disposed of when the extension is deactivated.

    deactivate(): This function is invoked when the extension is deactivated. It currently does nothing but can be expanded to handle any cleanup necessary when the extension is deactivated.

## database.js

The given code is a JavaScript module that utilizes the 'nedb-promises' library to manage a NeDB database. This database stores "memories", which are objects containing a prompt, output, summary, importance, accessedAt, timeDifference, and recencyScore. The code includes four main functions:

    insertMemory(prompt, output, summary, importance): Asynchronously inserts a new memory into the database with the given parameters. It also includes a calculation of the time difference from the last accessed memory.

    calculateRecencyScores(): Asynchronously calculates the recency scores of all the memories in the database. The recency score is calculated by an exponential decay over hours.

    retrieveMemory(query): Asynchronously retrieves the most recent memory from the database. It also updates the accessedAt and timeDifference properties of the retrieved memory and the subsequent memory (if it exists).

    insertMemoryFromFile(): Asynchronously reads a file and extracts a prompt, output, summary, and importance to be inserted as a new memory into the database. The file is expected to be in a certain format for the extraction to work correctly.

Each function includes error handling to capture and log any issues that occur during the execution. The NeDB database is created in the workspace's root directory and is named '.gpt-assist.db'. If it does not exist at the time a function is invoked, the function will create it. The module exports these four functions for use in other parts of the application.

## openai.js

The given script is a JavaScript module for interacting with the OpenAI API, specifically using it for natural language processing tasks within a Visual Studio Code (VS Code) extension.

The code uses several modules such as OpenAI's official SDK, @dqbd/tiktoken for token count estimation, vscode for interacting with VS Code's API, fs for file system operations, and path for handling file and directory paths. The module also requires a few custom modules, including vars and database, which provide access to certain global variables and database functions, respectively.

The script contains a single main function, callOpenAI(text, task, retrieveMemories, insertNewMemory), which is exported for use in other parts of the application.

Here's what this function does:

    Based on the parameters, it modifies the prompt to be sent to the OpenAI API. If retrieveMemories is set, the function retrieves a relevant memory from the database and appends it to the prompt. If insertNewMemory is set, it appends a question asking the model to rate the importance of the interaction and provide a summary.

    If the model is not "dummy", it calculates the token count of the prompt and estimates the cost of the API call.

    After informing the user about the number of tokens and the cost, it prompts the user to confirm. If the user agrees, it sends a completion request to the OpenAI API with the constructed prompt.

    If the model is set as "dummy", it writes the prompt to a file named 'dummy_prompt.txt' and asks the user to provide an output.

    If insertNewMemory is set and an output is received from the OpenAI API, it parses the summary and importance from the output and stores this interaction as a new memory in the database.

    It increments the total token count stored in vars by the token count of the current API call and updates a status bar item with the new total.

    It checks whether a file named 'conversation.md' exists in the current directory. If it doesn't, it creates it.

    It appends the task, user's text, and the AI's output to 'conversation.md', formatted as a conversation.

    It opens 'conversation.md' in a new editor tab in VS Code.

    Finally, it returns the output received from the OpenAI API.

## embedder.py

This script reads the text from the standard input, computes the embeddings using the USE model, converts the embeddings to a list, and prints them out. The list of embeddings can be parsed by the JavaScript parent process and used in your application.

package.json
tasks.json
