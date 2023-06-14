 // ==UserScript==
    // @name         Keyboard Shortcut Config
    // @namespace    http://tampermonkey.net/
    // @version      0.1
    // @description  Allow configuring custom keyboard shortcuts
    // @author       You
    // @match        https://*/*
    // @grant        none
    // ==/UserScript==
//// seems it's no need to do this.
    (function() {
        'use strict';

        // Create config page
        let configPage = `
        <div id="config">
            <h1>Keyboard Shortcut Config</h1>
            <p>Customize your keyboard shortcut. Leave blank to use default 'f' key.</p>
            <input id="input" type="text" maxlength="1">
            <button id="save">Save</button>
        </div>
    `;
        document.body.insertAdjacentHTML('beforeend', configPage);

        // Get config from storage or default
        let shortcut = GM_getValue('shortcut', 'f');

        // Save shortcut config
        document.querySelector('#save').addEventListener('click', () => {
            let value = document.querySelector('#input').value;
            if (value) {
                shortcut = value;
                GM_setValue('shortcut', value);
            }
        });

        // Listen for shortcut and trigger alert
        document.addEventListener('keypress', (e) => {
            if (e.key === shortcut) {
                alert('Shortcut triggered!');
            }
        });
    })();
