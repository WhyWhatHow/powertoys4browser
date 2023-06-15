/***
 * todo
 *  -[x] 创建 div
 *  -[]  div 设置背景:font-awesomme  本质是 unicode, 直接css 实现自己需要的样式
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

/**
 * create Icon ,choose Emoji (easy to create, don't need to care the fucking unicode),not font-awesome(too heavy and not suitable for unicode )
 */
function createIcon(elementType="span",fontSize="2em", fontWeight="900",code="&#129412;"){
    var icon = document.createElement(elementType);
// 设置样式
    icon.style.fontFamily = "Font Awesome 5 Free";
    icon.style.fontWeight = fontWeight;
    icon.style.fontSize = fontSize; // fa-3x
    icon.innerHTML =code;

    return icon;
}

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
    // 设置图标
    initialDiv.appendChild(createIcon());
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
