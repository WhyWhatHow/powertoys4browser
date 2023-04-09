// ==UserScript==
// @name         Twitter thread reader
// @namespace    https://whywhathow.github.io/
// @version      1.1
// @description  when we read twitter thread, it's sucks. so I try to generate twitter thread reader in one single page, so i can easily read and share. Anyway, it's easy to read twitter's thread.
// @author       whywhathow
// @match        https://twitter.com/*/status/*
// @icon         https://abs.twimg.com/favicons/twitter.2.ico
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @updateURL    https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/twitter-thread-reader.js
// @license      MIT
// ==/UserScript==

let curUrl = window.location.href;
console.log(curUrl);

// function handleUrl(curUrl) {
//     if (curUrl.includes("/status/")) {
//         return curUrl;
//     } else {
//         return null;
//     }
// }
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
    window.location.href=url;
    // GM_openInTab(url);
    
}
// actually doing something 
function running() {
    // 1. get url and twitter's thread id.

    var currentUrl = curUrl;
    // if (currentUrl === null) {
    //     return;
    // }
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
(function () {
    'use strict';
    GM_registerMenuCommand('read thread in another page', running);   

})();
