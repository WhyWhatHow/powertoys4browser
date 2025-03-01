// ==UserScript==
// @name         Comic Chapter Navigation Hotkeys
// @description  Use arrow keys to navigate between chapters on a web page
// @match        *://*/chapter/*
// @match        http*://*/*/*
// @match        http*://www.colamanga.com/*/*/*.html
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @icon         https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/icons/comic_icon.ico
// @namespace    https://whywhathow.github.io/
// @homepage     https://github.com/WhyWhatHow/powertoys4browser
// @supportURL   https://github.com/WhyWhatHow/powertoys4browser/issues
// @version      1.6
// @updateURL    https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/comic_chapter_navgation.js
// @license      MIT

// ==/UserScript==

const urlSelectorMap = {
    'colamanga.com': ['.mh_prevbook'],
    'default': ['.mh_prevbook', '.fanye a', '.post-page-numbers'],
};
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
        if (links[i].href === null) continue;

        console.log(links[i].textContent);
        var linkText = links[i].textContent.trim();
        if (linkText === '上一章' || linkText === '上一页') {
            prevLink = links[i];
            console.log(prevLink);

        } else if (linkText === '下一章' || linkText === '下一页') {
            nextLink = links[i];
        }
    }
    console.log("-----------------------------------");

    console.log(prevLink);
    console.log(nextLink);
    console.log("-----------------------------------");

    return { prevLink, nextLink };
}


function getLinks(selectors) {
    var links = [];
    console.log('开始查找导航链接...');

    // 依次尝试每个选择器
    for (const selector of selectors) {
        // console.log(`尝试选择器: ${selector}`);
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`找到 ${elements.length} 个匹配元素`);
            links = Array.from(elements);
            break;
        }
    }

    // 如果没有找到任何链接，尝试查找所有包含特定文本的链接
    if (links.length === 0) {
        // console.log('使用文本内容匹配查找链接...');
        const allLinks = document.getElementsByTagName('a');
        links = Array.from(allLinks).filter(link => {
            const text = link.textContent.trim();
            return text === '上一章' || text === '下一章' ||
                text === '上一页' || text === '下一页' ||
                text.includes('上一') || text.includes('下一');
        });
        console.log(`通过文本内容找到 ${links.length} 个链接`);
    }

    return links;
}
function bindKeyboardEvents(prevLink, nextLink) {

    console.log("-----------------bindKeyboardEvents----------------------")
    console.log("prevLink : " + prevLink);
    console.log(nextLink);

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
}


// 获取当前 URL 对应的选择器
function getSelectorForCurrentURL() {
    const currentURL = window.location.hostname;
    for (const [urlPattern, selector] of Object.entries(urlSelectorMap)) {
        if (currentURL.includes(urlPattern)) {
            return selector;
        }
    }
    return urlSelectorMap.default;
}
// 检查目标元素是否存在
function checkElements(selector) {
    const targetElements = document.querySelectorAll(selector);
    if (targetElements.length > 0) {
        console.log('找到目标元素，初始化导航...');
        return true;
    }
    return false;
}

// 实现页面右键可以使用，以及键盘按键可以使用。
function initChapterNavigation() {
    console.log("chapter navigation initialization started");

    let checkInterval;
    let timeoutId;
    // 配置不同网站的选择器映
    const selectors = getSelectorForCurrentURL();
    // 如果初始检查未找到元素，启动定时检查
    // Wait for elements to be found

    const intervalId= setInterval(() => {
        if (checkElements(selectors)) {
            clearInterval(intervalId);
            running();
        }
    }, 500);


}


function running() {
    console.log("---------running--------------");
    const selector = getSelectorForCurrentURL();
    var links = getLinks(selector);
    console.log("Found navigation links:", links);

    var prevLink = null;
    var nextLink = null;
    const __ret = getPrevAndNextLinks(links, prevLink, nextLink);
    prevLink = __ret.prevLink;
    nextLink = __ret.nextLink;

    if (prevLink || nextLink) {
        // 绑定键盘事件
        bindKeyboardEvents(prevLink, nextLink);
    }
}


(function () {
    'use strict';
    initChapterNavigation();
})();
