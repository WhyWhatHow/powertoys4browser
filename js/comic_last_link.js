// ==UserScript==
// @name         Comic: Auto link to latest chapter
// @description  auto link to the latest chapter
// @match        *://*/book/*
// @grant        none

// @icon         https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/icons/comic_icon.ico
// @namespace    https://whywhathow.github.io/
// @homepage     https://github.com/WhyWhatHow/powertoys4browser
// @supportURL   https://github.com/WhyWhatHow/powertoys4browser/issues
// @version      1.1

// @author       whywhathow
// @updateURL    https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/comic_last_link.js
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    console.log('---------------last -----page------------------------')
    // 获取最后一章的URL
    var lastChapterUrl = null;
    var detailListSelect = document.querySelector('#detail-list-select');
    if (detailListSelect) {
        var lastLi = detailListSelect.querySelector('li:last-child');
        if (lastLi) {
            var lastA = lastLi.querySelector('a');
            if (lastA) {
                lastChapterUrl = lastA.getAttribute('href');
            }
        }
    }

    console.log(lastChapterUrl)
    // 自动跳转到最后一章的URL
    if (lastChapterUrl !== null) {
        window.location.href = lastChapterUrl;
    }

})();
