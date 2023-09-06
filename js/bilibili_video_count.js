// ==UserScript==
// @name         Bilibili Online Viewers
// @namespace    https://whywhathow.github.io/
// @homepage     https://github.com/WhyWhatHow/powertoys4browser
// @supportURL   https://github.com/WhyWhatHow/powertoys4browser/issues
// @icon         https://www.bilibili.com/favicon.ico
// @author       whywhathow
// @version      1.1
// @description  统计某个视频在线观看人数的历史信息,观察是否有发生变化

// @match        *://www.bilibili.com/video/av*
// @match        *://www.bilibili.com/video/BV*
// @match        *://www.bilibili.com/bangumi/play/ep*
// @match        *://www.bilibili.com/bangumi/play/ss*
// @match        *://m.bilibili.com/bangumi/play/ep*
// @match        *://m.bilibili.com/bangumi/play/ss*
// @match        *://bangumi.bilibili.com/anime/*
// @match        *://bangumi.bilibili.com/movie/*
// @match        *://www.bilibili.com/bangumi/media/md*
// @match        *://www.bilibili.com/blackboard/html5player.html*
// @match        *://www.bilibili.com/watchroom/*
// @match        *://space.bilibili.com/*
// @match        https://www.bilibili.com/
// @match        https://www.bilibili.com/?*
// @match        https://www.mcbbs.net/template/mcbbs/image/special_photo_bg.png*
// @grant        GM_registerMenuCommand
// @run-at       document-end
// @license      MIT
// ==/UserScript==

// @updateURL    https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/bilibili_video_count.js

// 定义一个函数来提取视频编号
function getVideoIdFromUrl(url) {
    const videoId = url.match(/\/video\/([a-zA-Z0-9]+)/)[1];
    return videoId;
}

const STR_ONLINE_VIEWER_COUNT = 'onlineViewerCount_';

// 定义一个函数来获取在线观看人数，并将结果保存到本地存储中
function saveOnlineViewerCount(videoId) {
    var div;
    while (div === null) {
        div = document.querySelector('.bpx-player-video-info-online');
    }
    const onlineViewerCount = div.textContent.match(/\d+/)[0];
    console.log(onlineViewerCount);

    const key = STR_ONLINE_VIEWER_COUNT + videoId;
    var value = localStorage.getItem(key) !== null ?
        localStorage.getItem(key) + ',' + onlineViewerCount : onlineViewerCount + ",";
    // 将结果保存到本地存储中
    localStorage.setItem(key, onlineViewerCount);
}

function getViewerCount(videoId) {
    var res = localStorage.getItem(STR_ONLINE_VIEWER_COUNT + videoId);
    return res;
}


function main() {
    // 获取当前页面的URL并提取视频编号
    const currentUrl = window.location.href;
    const videoId = getVideoIdFromUrl(currentUrl);

    console.log(videoId); // 输出 BV1fz4y1H7TD
    // 等待页面加载完成后再执行查询操作
    window.addEventListener('load', function () {
        // 定义一个时间间隔（以毫秒为单位）
        const interval = 1000; // 每1秒查询一次

        // 设置定时器来定期执行查询操作
        setInterval(saveOnlineViewerCount(videoId), interval);
    });

    GM_registerMenuCommand('online viewer history', getViewerCount(videoId));
}

main();










