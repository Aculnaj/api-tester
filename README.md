# Simple AI Generation Tool (Web-Based)

## Description

This repository contains the web-based client-side portion of a tool designed to generate text and images via API calls. The tool is intentionally kept simple, utilizing only Plain HTML, CSS, and JavaScript [1] to execute directly within a browser. It requires no server-side installation or complex application structure and can be used simply by opening the local files. It can also be accessed online at https://aculnaj.github.io/api-tester.

## Files

The web part consists of the following files [1]:

*   `index.html`: The main structure of the user interface.
*   `style.css`: Contains the styling rules for the appearance.
*   `script.js`: Handles the dynamic functionality, API calls, and displaying results.

## Functionality

*   Performs API calls for both text and image generation [1].
*   Allows selection from several AI providers, including OpenAI, Deepseek, OpenAI Compatible, Claude, and OpenRouter [1].
*   Displays the generated text or image (or errors) directly on the page [1].
*   Displays basic performance statistics (Time, Tokens/Sec, Token Counts) for text generation if the API response includes usage data [1].
*   Includes basic input validation (checks for missing API key, model, prompt, Base URL, and proper numeric inputs) [1].

## Technology

The tool is based on Plain HTML, CSS, and JavaScript for simplicity and direct browser execution [1].

## Usage

Access the hosted version directly at **https://aculnaj.github.io/api-tester**.

__Alternatively:__
1.  Download the `index.html`, `style.css`, and `script.js` files.
2.  Open the `index.html` file in a modern web browser.
3.  Select a provider from the dropdown menu (e.g., OpenAI, Deepseek, etc.) [1].
4.  Enter the required information (such as API Key, URL, Model) into the form fields [1].
5.  Select the generation type (Text or Image) [1].
6.  Use the generation functions.