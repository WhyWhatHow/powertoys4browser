// ==UserScript==
// @name         Dmm Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Extract CID and date from specific HTML elements
// @author       X4fun
// @grant        none
// @match        *://*.dmm.co.jp/*
// @run-at       document-idle
// ==/UserScript==

const LIST_SELECTOR = "[data-e2eid=\"content-card\"]";

let SettingDate = null;

(function () {
    'use strict';
    const checkInterval = setInterval(() => {
        const items = document.querySelectorAll('[data-e2eid="content-card"]');
        if (items.length > 0) {
            console.log('获取到的元素:', items.length);
            addElephantButton()
            // running();
            clearInterval(checkInterval);
        }
    }, 1000); // 每 500 毫秒检查一次
})();

function getDateAfter4Weeks() {
    const currentDate = new Date();
    const daysIn4Weeks = 4 * 7;
    const newDate = new Date(currentDate.getTime() + daysIn4Weeks * 24 * 60 * 60 * 1000);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

function addElephantButton() {
    // 创建按钮元素
    const button = document.createElement('button');
    button.textContent = '🐘';
    button.id = 'elephant-button';
    // 设置按钮的样式
    button.style.position = 'fixed';
    button.style.top = '50%';
    button.style.right = '10px';
    button.style.transform = 'translateY(-50%)';
    button.style.zIndex = '9999';
    button.style.background = 'none';
    button.style.border = 'none';
    button.style.fontSize = '24px';
    button.style.cursor = 'pointer';
    // 为按钮添加点击事件监听器
    button.addEventListener('click', function () {
        if (SettingDate === null) {
            SettingDate = getDateAfter4Weeks();
            console.log("trailerDate:", SettingDate);
            running()
        }else
            running(SettingDate);
    });
    // 右键单击事件：设置日期
    button.addEventListener('contextmenu', function (e) {
        e.preventDefault(); // 阻止默认右键菜单
        const inputDate = prompt('请输入日期（格式如：YYYY/MM/DD）');
        if (inputDate) {
            console.log('你设置的日期是:', inputDate);
            SettingDate = inputDate;
            // 这里可以添加设置日期的具体逻辑，比如更新页面上某个显示日期的元素
        }
    });
    // 将按钮添加到页面
    document.body.appendChild(button);
}



/**
 * 将列表数据复制到剪贴板
 * @param {Array} list - 要复制到剪贴板的列表
 */
function copyListToClipboard(list) {
    // 将列表数据转换为字符串，每行一个元素
    const dataString = list.join('\n');
    // 尝试将数据写入剪贴板
    navigator.clipboard.writeText(dataString)
        .then(() => {
            console.log('数据已成功复制到剪贴板');
        })
        .catch((error) => {
            console.error('复制数据到剪贴板时出错:', error);
        });
}


function running(targetDate = "2025/03/06") {
    console.log("running dmm enhancer with targetDate:", targetDate  )

    // 存储提取的cidList数据
    const results = [];

    // 遍历所有符合条件的 <li> 元素
    console.log("running dmm enhancer")
    const items = document.querySelectorAll('[data-e2eid="content-card"]');
    console.log(items.length)
    items.forEach(item => {
        // console.log(" deal with item:")
        // 提取 CID
        const cid = getCidFromTag(item)
        if (cid === null) return; //
        console.log(cid);
        // check date is qualified
        if (!checkItemDate(item, targetDate)) return;
        results.push(cid);
    });
    var list = [];
    for (let result of results) {
        const url = genTrailerDownloadUrl(result);
        list.push(url)
        console.log(url)
    }
    // writeListToFile(list)
    // 写入剪切板
    copyListToClipboard(list);
    // downloadResource(results[0], 1000)
    // 在控制台中输出结果
    // console.log('提取到的数据:', results)
}

// https://cc3001.dmm.co.jp/litevideo/freepv/s/son/sone00622/sone00622mhb.mp4
const URL_PREFIX = "https://cc3001.dmm.co.jp/litevideo/freepv/";

function genTrailerDownloadUrl(cid) {
    const fileName = cid + "mhb.mp4";
    const mid = transformString(cid);
    return URL_PREFIX + mid + "/" + fileName;
}

function transformString(str) {
    let result = [];
    for (let i = 0; i < str.length; i++) {
        if (i === 0 || i === 2 || i === str.length - 1) {
            result.push(str.slice(0, i + 1));
        }
    }
    return result.join('/');
}

/**
 * 检验当前item的配信开始日是否符合预期
 * 1. 通过<div>标签的class属性获取配信开始日
 * 2. check
 */
function checkItemDate(ele, targetDate) {
    const regex = /(\d{4})\/(\d{2})\/(\d{2})/;
    const list = ele.querySelectorAll('div.text-xxs');

    // 使用 for...of 循环替代 forEach
    for (const item of list) {
        const str = item.innerHTML;
        if (str.match(regex)) {
            // 获取完整日期
            const date = str.match(regex)[0];
            console.log("date:", date);
            if (compareDates(date, targetDate)) {
                return true;
            }
        }
    }
    return false;
}

// 比较两个日期字符串的大小 if a>=b return true else return false
function compareDates(a, b) {
    // 将日期字符串转换为 Date 对象
    const dateA = new Date(a.replace(/\//g, '-'));
    const dateB = new Date(b.replace(/\//g, '-'));
    // 比较两个日期对象
    return dateA >= dateB;
}

// 通过<a>标签的href属性获取CID done
function getCidFromTag(item) {
    const aTag = item.querySelector('a.text-blue-800');
    const href = aTag.getAttribute('href');
    const regex = /([a-z]+)([0-9]+)/;


    if (href) {

        const match = href.match(regex);
        if (match) {
            console.log(`匹配到的部分是：`);
            const cid = match[1] + match[2];
            return cid;
        }

    }
    return null;
}


/**
 * 将列表数据写入本地文件，允许用户指定文件名
 * @param {Array} list - 要保存的列表数据
 */
function writeListToFile(list) {
    // 将列表数据转换为字符串，每行一个元素
    const dataString = list.join('\n');
    // 创建一个 Blob 对象
    const blob = new Blob([dataString], {type: 'text/plain'});
    // 创建一个下载链接
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    // 提示用户输入文件名
    const fileName = prompt('请输入要保存的文件名（包含扩展名，如 example.txt）', 'data.txt');
    if (fileName) {
        a.download = fileName;
        // 模拟点击下载链接
        a.click();
        // 释放 URL 对象
        URL.revokeObjectURL(a.href);
    }
}
