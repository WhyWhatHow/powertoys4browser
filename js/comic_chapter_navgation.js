// ==UserScript==
// @name         Comic Chapter Navigation Hotkeys
// @description  Use arrow keys to navigate between chapters on a web page
// @match        *://*/chapter/*
// @match        http*://*/*/*
// @grant        none
// @icon         https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/icons/comic_icon.ico
// @namespace    https://whywhathow.github.io/
// @homepage     https://github.com/WhyWhatHow/powertoys4browser
// @supportURL   https://github.com/WhyWhatHow/powertoys4browser/issues
// @version      1.2

// @author       whywhathow

// @updateURL    https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/comic_chapter_navgation.js
// @license      MIT

// ==/UserScript==

/**
 * 创建 消息通知组件:
 * @param type :类型
 * @returns {HTMLDivElement}
 */
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
    // messageElement.style.opacity = '0';
    messageElement.style.transform = 'translate3d(0, -50%, 0)';
    messageElement.style.pointerEvents = 'none';
    // 根据消息类型设置不同的 backgroudColor
    switch (type) {
        case 'success':
            messageElement.style.backgroundColor = '#67C23A'; // 成功消息背景色
            break;
        case 'info':
            messageElement.style.backgroundColor = '#2094ff'; // 信息消息背景色
            break;
        case 'error':
            messageElement.style.backgroundColor = '#F56C6C'; // 错误消息背景色
            break;
        default:
            break;
    }
    messageElement.style.color = '#fff';
    messageElement.style.fontWeight = 'bold';

    return messageElement;
}

/**
 * 显示消息
 * @param type
 * @param message
 * @param timeout
 */
function showMessage(type = "success", message, timeout = 1000) {
    console.log('-----------------show message -----------------')
    var container;
    if (!(container = document.getElementById('fun_message_box'))) {
        container = createMessageElement(type);
    }
    const content = document.createElement('p');
    content.style.margin = '0';
    content.innerText = message;
    container.appendChild(content);

    document.body.appendChild(container);
    setTimeout(() => {
        container.style.opacity = '0';
        container.style.transform = 'translate3d(0, -50%, 0)';
        container.style.pointerEvents = 'none';
        container.style.display = 'none';
        // container.remove();
    }, timeout);
}

function getPrevAndNextLinks(links, prevLink, nextLink) {
    for (var i = 0; i < links.length; i++) {
        var linkText = links[i].textContent.trim();
        if (linkText === '上一章' || linkText === '上一页') {
            prevLink = links[i];
        } else if (linkText === '下一章' || linkText === '下一页') {
            nextLink = links[i];
        }
    }
    return {prevLink, nextLink};
}


function getLinks() {

    var links = document.querySelectorAll('.fanye a');
    if (links.length === 0) { // different webstite
        links = document.getElementsByClassName('post-page-numbers');
    }
    return links;

}

(function () {
    'use strict';
    console.log(" chapter ---- navgation -----------")

    var links = getLinks();
    if (links.length === 0) {
        return ;
    }

    var prevLink = null;
    var nextLink = null;
    const __ret = getPrevAndNextLinks(links, prevLink, nextLink);
    prevLink = __ret.prevLink;
    nextLink = __ret.nextLink;

    document.addEventListener('keydown', function (event) {
        if (event.key === 'p' || event.key === 'ArrowLeft') { // left arrow key
            console.log("-------------p------------------------")
            if (prevLink) {
                console.log(prevLink)
                showMessage("info", " prev --- page ---- ", 1000)
                window.location.href = prevLink.href;
            }
        } else if (event.key === 'n' || event.key === 'ArrowRight') { // right arrow key

            console.log("----------------n-----------------------")
            if (nextLink) {
                console.log(nextLink)
                showMessage("info", "next---- page ------", 1000)
                window.location.href = nextLink.href;

            }
        }
    });
})();
