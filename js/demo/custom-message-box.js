// ==UserScript==
// @name         Custom Message Box
// @namespace    http://your-domain-here/
// @version      1
// @description  A custom message box for Element UI based on your style rules.
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

// 加载 Element UI 的 JS 和 CSS 文件
const elScript = document.createElement('script');
elScript.src = 'https://unpkg.com/element-ui/lib/index.js';
document.head.appendChild(elScript);

const elCss = document.createElement('link');
elCss.rel = 'stylesheet';
elCss.href = 'https://unpkg.com/element-ui/lib/theme-chalk/index.css';
document.head.appendChild(elCss);

(function() {
    'use strict';

    // 创建自定义消息框
    function createMessageElement() {
        const messageElement = document.createElement('div');
        messageElement.style.position = 'fixed';
        messageElement.style.top = '20px';
        messageElement.style.right = '20px';
        messageElement.style.zIndex = '9999';
        messageElement.style.width = '350px';
        messageElement.style.maxWidth = '80%';
        messageElement.style.padding = '15px 50px 15px 15px';
        messageElement.style.color = '#fff';
        messageElement.style.fontSize = '14px';
        messageElement.style.lineHeight = '1.5';
        messageElement.style.borderRadius = '4px';
        messageElement.style.boxShadow = '0 2px 12px 0 rgba(0, 0, 0, 0.1)';
        messageElement.style.transition = 'opacity .3s, transform .3s';
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translate3d(0, -50%, 0)';
        messageElement.style.pointerEvents = 'none';
        messageElement.style.backgroundColor = 'red'; // 修改背景色为红色

        return messageElement;
    }

    // 显示自定义消息框
    function showMessage(message) {
        const messageElement = createMessageElement();
        messageElement.textContent = message;

        document.body.appendChild(messageElement);

        // 显示消息框
        setTimeout(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translate3d(0, 0, 0)';
            messageElement.style.pointerEvents = 'auto';
        }, 1000);

        // 隐藏消息框
        setTimeout(() => {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translate3d(0, -50%, 0)';
            messageElement.style.pointerEvents = 'none';
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 300);
        }, 5000);
    }

    // 在页面中使用自定义消息框
    showMessage('This is a custom message box.');
})();
