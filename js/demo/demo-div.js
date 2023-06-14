/***
 * todo
 *  -[x] 创建 div
 *  -[x] div hover 事件
 *  -[x] div 左击 事件
 *  -[] div 右击事件 ->触发配置中心,页面中心区域弹出配置页面, 可是使用进行自定义配置
 */
// ==UserScript==
// @name         Create Div Script
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Creates a new div with text "Hello, World!" when a div in the center-left of the page is clicked.
// @author       whywhathow
// @match        *://*/*
// @grant        none
// ==/UserScript==

// (function() {
//     'use strict';
//
//     // Create the initial div element
//     const initialDiv = document.createElement('div');
//     initialDiv.style.position = 'fixed';
//     initialDiv.style.top = '50%';
//     initialDiv.style.left = '10%';
//     initialDiv.style.transform = 'translateY(-50%)';
//     initialDiv.style.width = '100px';
//     initialDiv.style.height = '50px';
//     initialDiv.style.backgroundColor = 'rgba(255, 68, 0, 0.5)'; // Set initial opacity to 0.5
//     initialDiv.style.cursor = 'pointer';
//     initialDiv.addEventListener('mouseenter', function() {
//         initialDiv.style.backgroundColor = 'rgba(255, 68, 0, 0.7)'; // Increase opacity on hover
//     });
//     initialDiv.addEventListener('mouseleave', function() {
//         initialDiv.style.backgroundColor = 'rgba(255, 68, 0, 0.5)'; // Reset opacity when not hovered
//     });
//     initialDiv.addEventListener('click', createNewDiv);
//
//     // Add the div to the page
//     document.body.appendChild(initialDiv);
//
//     // Function to create a new div element
//     function createNewDiv() {
//         // Create the new div element
//         const newDiv = document.createElement('div');
//         newDiv.style.position = 'fixed';
//         newDiv.style.top = '50%';
//         newDiv.style.left = '50%';
//         newDiv.style.transform = 'translate(-50%, -50%)';
//         newDiv.style.width = '200px';
//         newDiv.style.height = '100px';
//         newDiv.style.backgroundColor = '#000000';
//         newDiv.style.color = '#FFFFFF';
//         newDiv.style.textAlign = 'center';
//         newDiv.style.lineHeight = '100px';
//         newDiv.textContent = 'Hello, World!';
//
//         // Add the new div to the page
//         document.body.appendChild(newDiv);
//     }
// })();
//
// (function() {
//     'use strict';
//
//     // Create the initial div element
//     const initialDiv = document.createElement('div');
//     initialDiv.style.position = 'fixed';
//     initialDiv.style.top = '50%';
//     initialDiv.style.right = '10%';
//     initialDiv.style.transform = 'translateY(-50%)';
//     initialDiv.style.width = '100px';
//     initialDiv.style.height = '50px';
//     initialDiv.style.backgroundColor = 'rgba(255, 68, 0, 0.5)'; // Set initial opacity to 0.5
//     initialDiv.style.cursor = 'pointer';
//     initialDiv.addEventListener('mouseenter', function() {
//         initialDiv.style.backgroundColor = 'rgba(255, 68, 0, 0.7)'; // Increase opacity on hover
//         initialDiv.title = 'Hello, World!'; // Show tooltip on hover
//     });
//     initialDiv.addEventListener('mouseleave', function() {
//         initialDiv.style.backgroundColor = 'rgba(255, 68, 0, 0.5)'; // Reset opacity when not hovered
//         initialDiv.title = ''; // Hide tooltip
//     });
//     initialDiv.addEventListener('click', createNewDiv);
//     initialDiv.addEventListener('contextmenu', function(event) {
//         event.preventDefault(); // Prevent default right-click behavior
//         alert('You right-clicked the div!'); // Show alert on right-click
//     });
//
//     // Add the div to the page
//     document.body.appendChild(initialDiv);
//
//     // Function to create a new div element
//     function createNewDiv() {
//         // Create the new div element
//         const newDiv = document.createElement('div');
//         newDiv.style.position = 'fixed';
//         newDiv.style.top = '50%';
//         newDiv.style.left = '50%';
//         newDiv.style.transform = 'translate(-50%, -50%)';
//         newDiv.style.width = '200px';
//         newDiv.style.height = '100px';
//         newDiv.style.backgroundColor = '#000000';
//         newDiv.style.color = '#FFFFFF';
//         newDiv.style.textAlign = 'center';
//         newDiv.style.lineHeight = '100px';
//         newDiv.textContent = 'Hello, World!';
//
//         // Add the new div to the page
//         document.body.appendChild(newDiv);
//     }
// })();

// ==UserScript==
// @name         Create Div Script
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Creates a new div with text "Hello, World!" when a div in the center-right of the page is clicked.
// @author       Your name
// @match        https://example.com/*
// @grant        none
// ==/UserScript==

function createDivScript() {
    'use strict';

    // Create the initial div element
    const initialDiv = document.createElement('div');
    initialDiv.style.position = 'fixed';
    initialDiv.style.top = '50%';
    initialDiv.style.right = '10%';
    initialDiv.style.transform = 'translateY(-50%)';
    initialDiv.style.width = '100px';
    initialDiv.style.height = '50px';
    initialDiv.style.backgroundColor = 'rgba(255, 68, 0, 0.5)';
    initialDiv.style.cursor = 'pointer';
    initialDiv.addEventListener('mouseenter', function() {
        initialDiv.style.backgroundColor = 'rgba(255, 68, 0, 0.7)';
        initialDiv.title = 'Hello, World!';
    });
    initialDiv.addEventListener('mouseleave', function() {
        initialDiv.style.backgroundColor = 'rgba(255, 68, 0, 0.5)';
        initialDiv.title = '';
    });
    initialDiv.addEventListener('click', createNewDiv);
    initialDiv.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        alert('You right-clicked the div!');
    });

    // Add the div to the page
    document.body.appendChild(initialDiv);

    // Function to create a new div element
    function createNewDiv() {
        // Create the new div element
        const newDiv = document.createElement('div');
        newDiv.style.position = 'fixed';
        newDiv.style.top = '50%';
        newDiv.style.right = '50%';
        newDiv.style.transform = 'translate(50%, -50%)';
        newDiv.style.width = '200px';
        newDiv.style.height = '100px';
        newDiv.style.backgroundColor = '#000000';
        newDiv.style.color = '#FFFFFF';
        newDiv.style.textAlign = 'center';
        newDiv.style.lineHeight = '100px';
        newDiv.textContent = 'Hello, World!';

        // Add the new div to the page
        document.body.appendChild(newDiv);
    }
}

// Call the function to create the div script
createDivScript();
