// ==UserScript==
// @name         Custom Search Engine
// @namespace    custom-search-engine
// @description  Add custom search engines and use them with a shortcut key in the browser's address bar
// @include      http*://*
// @version      1
// @grant        none
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';

    // Define the default search engines
    const searchEngines = {
        'Google': 'https://www.google.com/search?q=',
    };

    // Define the shortcut key
    const shortcutKey = 'g';

    // Define the regex pattern to match the shortcut key
    const pattern = new RegExp(`^${shortcutKey}(?=\\s|$)`, 'i');

    // Listen for keyboard input
    document.addEventListener('keydown', function (event) {
        // Ignore keyboard input if user is typing in an input field
        if (event.target.tagName.toLowerCase() === 'input') {
            return;
        }

        // Ignore keyboard input if user is typing a modifier key (e.g. shift, ctrl)
        if (event.getModifierState('Alt') || event.getModifierState('Control') || event.getModifierState('Meta') || event.getModifierState('Shift')) {
            return;
        }

        // Get the typed characters
        const typedChars = String.fromCharCode(event.keyCode).toLowerCase();

        // Check if the typed characters match the shortcut key
        if (pattern.test(typedChars)) {
            event.preventDefault(); // Prevent the typed characters from being inserted into the address bar

            // Parse the search query
            const query = window.prompt('Enter your search query:');

            // Get the search engine name and search URL from the query
            const [engineName, ...searchTerms] = query.split(' ');
            const searchUrl = searchEngines[engineName];

            // If search engine not found, use the default search engine (Google)
            if (!searchUrl) {
                window.location.href = 'https://www.google.com';
                return;
            }

            // Build the search URL and navigate to it
            const queryStr = searchTerms.join(' ');
            const searchQuery = encodeURIComponent(queryStr);
            const url = `${searchUrl}${searchQuery}`;
            window.location.href = url;
        }
    });

    // Allow users to add custom search engines
    const addCustomSearchEngine = function () {
        const name = window.prompt('Enter the name of the search engine:');
        const url = window.prompt('Enter the search URL (use %s as a placeholder for the search query):');

        if (name && url) {
            searchEngines[name] = url;
            window.alert(`Search engine "${name}" has been added.`);
        }
    };

    // Define the command to add custom search engines
    const addCustomSearchEngineCommand = {
        name: 'add-custom-search-engine',
        description: 'Add a custom search engine',
        execute: addCustomSearchEngine,
    };

    // Register the command with the browser
    if (typeof browser !== 'undefined') {
        browser.commands.onCommand.addListener(function (command) {
            if (command === addCustomSearchEngineCommand.name) {
                addCustomSearchEngineCommand.execute();
            }
        });
    }

    // Register the command with the userscript
    GM_registerMenuCommand(addCustomSearchEngineCommand.description, addCustomSearchEngineCommand.execute);
})();
