// ==UserScript==
// @name         Input Unblock
// @description  检测并恢复被屏蔽的键盘输入和鼠标右键功能
// @match        *://*/*
// @grant        none
// @icon         https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/icons/quick-search.ico
// @namespace    https://whywhathow.github.io/
// @homepage     https://github.com/WhyWhatHow/powertoys4browser
// @supportURL   https://github.com/WhyWhatHow/powertoys4browser/issues
// @version      1.0
// @author       whywhathow
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // 创建消息提示元素
    function createMessageElement(type) {
        const messageElement = document.createElement('div');
        messageElement.id = 'fun_message_box';
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
        messageElement.style.transform = 'translate3d(0, -50%, 0)';
        messageElement.style.pointerEvents = 'none';

        switch (type) {
            case 'success':
                messageElement.style.backgroundColor = '#67C23A';
                break;
            case 'info':
                messageElement.style.backgroundColor = '#2094ff';
                break;
            case 'error':
                messageElement.style.backgroundColor = '#F56C6C';
                break;
            default:
                break;
        }
        messageElement.style.color = '#fff';
        messageElement.style.fontWeight = 'bold';

        return messageElement;
    }

    // 显示消息提示
    function showMessage(type = "success", message, timeout = 1000) {
        let container = document.getElementById('fun_message_box');
        if (!container) {
            container = createMessageElement(type);
        }
        const content = document.createElement('p');
        content.style.margin = '0';
        content.innerText = message;
        container.innerHTML = '';
        container.appendChild(content);

        document.body.appendChild(container);
        container.style.display = 'block';
        container.style.opacity = '1';

        setTimeout(() => {
            container.style.opacity = '0';
            container.style.transform = 'translate3d(0, -50%, 0)';
            container.style.pointerEvents = 'none';
            setTimeout(() => {
                container.style.display = 'none';
            }, 300);
        }, timeout);
    }

    // 检测并恢复键盘输入功能
    function unblockKeyboardInput() {
        const events = ['keydown', 'keyup', 'keypress'];
        events.forEach(eventType => {
            window.addEventListener(eventType, (e) => {
                e.stopImmediatePropagation();
            }, true);
        });
        showMessage('success', '已恢复键盘输入功能');
    }

    // 检测并恢复鼠标右键功能
    function unblockContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            e.stopImmediatePropagation();
            return true;
        }, true);

        // 移除可能禁用右键的事件监听器
        window.addEventListener('contextmenu', (e) => {
            e.stopImmediatePropagation();
            return true;
        }, true);

        // 阻止oncontextmenu属性
        Object.defineProperty(document, 'oncontextmenu', {
            get: function() {
                return null;
            },
            set: function() {
                return null;
            }
        });

        showMessage('success', '已恢复鼠标右键功能');
    }

    // 主函数
    function init() {
        // 检测并恢复键盘输入
        unblockKeyboardInput();

        // 检测并恢复鼠标右键
        unblockContextMenu();

        // 显示初始化完成消息
        showMessage('info', '页面输入功能检测完成', 2000);
    }

    // 等待页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
