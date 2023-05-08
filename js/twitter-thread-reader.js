// ==UserScript==
// @name         Twitter thread reader
// @namespace    https://whywhathow.github.io/
// @homepage     https://github.com/WhyWhatHow/powertoys4browser
// @supportURL   https://github.com/WhyWhatHow/powertoys4browser/issues
// @version      1.5
// @description  when we read twitter thread, it's sucks. so I try to generate twitter thread reader in one single page, so i can easily read and share. Anyway, it's easy to read twitter's thread.
// @author       whywhathow
// @match        https://twitter.com/
// @match        https://twitter.com/*/status/*
// @icon         https://abs.twimg.com/favicons/twitter.2.ico
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// @updateURL    https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/twitter-thread-reader.js
// @license      MIT
// ==/UserScript==
/***
 * url checking ,if true, means twitter-thread, else ,means twitter.com
 * @param str
 * @returns {boolean}
 */
function checkURL(str) {
    const twitter = "https://twitter.com/home";
    return twitter === str ? false : true;
}

function getThreadID(url) {
    const arr = url.split("/");
    var threadId = arr[arr.length - 1];
    console.log("ThreadId:-> {}", threadId);
    return threadId;
}

// 定义跳转函数
function redirect(url) {
    // 执行一些操作
    console.log("准备跳转...");
    console.log(url);
    // 跳转到指定 URL
    // window.location.href=url;
    GM_openInTab(url);

}


// actually doing something
function running() {
    // 1. get url and twitter's thread id.
    let currentUrl = window.location.href;
    if (!checkURL(currentUrl)) {
        alert("not home page!!!")
        // not thread page, don't anything.
        return;
    }
    // 2. get tgread id
    var threadId = getThreadID(currentUrl);
    // 3. gengerate  thread page.
    // https://twitter-thread.com/api/unroll-thread?id=1643514082681602048
    // 发送 GET 请求
    GM.xmlHttpRequest({
        method: "GET",
        url: "https://twitter-thread.com/api/unroll-thread?id=" + threadId,
        headers: {
            "User-Agent": "Mozilla/5.0", // 设置请求头
        },
        onload: function (response) {
            //  页面跳转
            var redirectUrl = "https://twitter-thread.com/t/" + threadId;
            showMessage("success", "--- enjoy ^_^ ---")
            redirect(redirectUrl);
            console.log(response.responseText); // 打印响应内容
        },
        onerror: function (error) {
            showMessage("error","Load page error, please try again!")
            console.error(error);
        }
    });

}

// 检查当前焦点是否在 Twitter 的输入框中
function isInTwitterInput() {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.nodeName === "DIV" && activeElement.getAttribute("role") === "textbox") {
        // 当前焦点在 Twitter 的输入框中
        return true;
    } else {
        // 当前焦点不在 Twitter 的输入框中
        return false;
    }
}
/**
 * 创建 消息通知组件:
 * @param type :类型
 * @returns {HTMLDivElement}
 */
function createMessageElement(type) {
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
    // 根据消息类型设置不同的 backgroudColor
    switch (type) {
        case 'success':
            messageElement.style.backgroundColor = '#67C23A'; // 成功消息背景色
            break;
        case 'info':
            messageElement.style.backgroundColor = '#909399'; // 信息消息背景色
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
function showMessage(type, message, timeout=1000) {
    const container = createMessageElement(type);
    const content = document.createElement('p');
    content.style.margin = '0';
    content.innerText = message;
    container.appendChild(content);

    document.body.appendChild(container);
    setTimeout(() => {
        container.style.opacity = '0';
        container.style.transform = 'translate3d(0, -50%, 0)';
        container.style.pointerEvents = 'none';
        container.remove();
    }, timeout);
}



(function () {
    'use strict';
    GM_registerMenuCommand('read thread in another page', running, 'f');
    // 监听按键事件
    document.addEventListener('keydown', function (event) {
        if (event.ctrlKey && event.key === 'f') {
            return;
        }
        // 如果按下了 f 键，并且事件源对象不是输入框元素
        else if (event.key === 'f' && !isInTwitterInput()) {
            // 执行您的脚本逻辑
            console.log('f------------------------------------f');
            // alert("just wait")
            showMessage("info","Loading Page...",1000)
            running()
        }

    }, true);
})();

