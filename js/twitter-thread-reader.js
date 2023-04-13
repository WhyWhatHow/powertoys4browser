// ==UserScript==
// @name         Twitter thread reader
// @namespace    https://whywhathow.github.io/
// @version      1.4
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
            redirect(redirectUrl);
            console.log(response.responseText); // 打印响应内容
        },
        onerror: function (error) {
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
            running()
        }

    }, true);
})();

