# gpt-assist README

GPT-Assist is a Visual Studio Code extension that integrates OpenAI's GPT-3 model into your coding workflow. It allows you to interact with GPT-3 directly from your editor, providing assistance with code writing, debugging, testing, and more.

## Features

    Selectable Prompts: Choose from a variety of prompts to guide the AI's responses, including code review, alternative solutions, code explanation, refactoring, and more.

    Project Context Awareness: GPT-Assist can read a GPT-README file that contains a description of your project, allowing it to provide more context-aware responses.

    Simulated Memory: Use keywords to refer to parts of the GPT-README file, allowing the AI to simulate memory and provide more relevant responses.

    Code Snippets: Save and insert reusable pieces of code directly from the editor.

    Documentation Generation: Automatically generate comments or documentation for your code.

    Code Formatting: Automatically format your code according to a set of style guidelines.

    Testing and Error Checking: Check your code for common errors or potential issues, write tests, and even suggest fixes.

    Integration with Version Control Systems: Manage your code versions directly from the editor.

### Planned Implementation Steps

    Step 1: Implement selectable prompts. This will involve creating a dropdown menu or command palette where the user can choose the type of prompt they want to use.

    Step 2: Add the ability to read from a GPT-README file. This will involve parsing the file and incorporating its contents into the AI's responses.

    Step 3: Implement simulated memory. This will involve recognizing and substituting keywords in the user's input, and allowing the AI to generate its own prompts.

    Step 4: Add code snippet functionality. This will involve creating a way for the user to save and insert reusable pieces of code.

    Step 5: Implement documentation generation. This will involve using the AI to automatically generate comments or documentation based on the user's code.

    Step 6: Add code formatting functionality. This will involve integrating an existing code formatter into the extension.

    Step 7: Implement testing and error checking. This will involve using the AI to check the user's code for errors, write tests, and suggest fixes.

    Step 8: Add integration with version control systems. This will involve adding features for working with systems like Git.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Working with Markdown

You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
