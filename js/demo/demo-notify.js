// ==UserScript==
// @name         Element UI Message Example
// @description  Example of creating a message using Element UI in a userscript
// @match        https://twitter.com/home
// @grant        none
// ==/UserScript==
/**
 * 创建 消息通知组件:
 * @returns {HTMLDivElement}
 */
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
    // messageElement.style.opacity = '0';
    messageElement.style.transform = 'translate3d(0, -50%, 0)';
    messageElement.style.pointerEvents = 'none';

    return messageElement;
}

// const messageElement = createMessageElement();
// document.body.appendChild(messageElement);
function showMessage(type, message) {
    const  container = createMessageElement();
    container.style.backgroundColor = type === 'success' ? '#67C23A' : '#F56C6C';
    container.style.color = '#fff';
    container.style.fontWeight = 'bold';

    const icon = document.createElement('i');
    icon.style.marginRight = '5px';
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';

    const content = document.createElement('p');
    content.style.margin = '0';
    content.innerText = message;

    container.appendChild(icon);
    container.appendChild(content);

    document.body.appendChild(container);

    setTimeout(() => {
        container.style.opacity ='0';
        // container.remove();
    }, 2000);
}

showMessage('success', '操作成功！');

