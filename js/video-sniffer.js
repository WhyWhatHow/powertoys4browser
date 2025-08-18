// ==UserScript==
// @name         fun-video-sniffer
// @namespace    https://github.com/WhyWhatHow/
// @homepage     https://github.com/WhyWhatHow/powertoys4browser
// @supportURL   https://github.com/WhyWhatHow/powertoys4browser/issues
// @version      1.6
// @author       whywhathow
// @license      MIT
// @match        *://*/*
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    if (window.self !== window.top || window.hasCacheM3U8SnifferRun) return;
    window.hasCacheM3U8SnifferRun = true;

    // 控制链接容器显示的状态
    let showSniffer = false;

    // 样式（包含红色触发按钮和容器样式）
    const style = document.createElement('style');
    style.textContent = `
        /* 红色正方形触发按钮（右侧中间定位） */
        #cache-m3u8-trigger-btn {
            position: fixed;
            right: 0;
            top: 50%;
            transform: translateY(-50%); /* 垂直居中 */
            width: 40px;
            height: 40px;
            background: #ff0000; /* 红色 */
            border: none;
            border-radius: 0; /* 正方形 */
            cursor: pointer;
            z-index: 99999;
            padding: 0;
            color: white;
            font-size: 16px;
            transition: background 0.3s;
        }
        #cache-m3u8-trigger-btn:hover {
            background: #cc0000; /* hover加深红色 */
        }

        /* 链接容器样式 - 自适应位置 */
        #cache-m3u8-sniffer {
            position: fixed;
            z-index: 99999;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 10px;
            border-radius: 4px;
            width: min(90vw, 550px); /* 响应式宽度 */
            max-height: 70vh; /* 减小最大高度，确保在小窗口可见 */
            overflow: auto;
            font-family: Arial, sans-serif;
            font-size: 13px;
            border: 1px solid #4CAF50;
            display: none; /* 默认隐藏 */
            transition: opacity 0.3s, transform 0.3s;
            right: 0;
            bottom: 10px; /* 固定在右下角 */
        }
        .m3u8-group {
            margin-bottom: 12px;
            border-bottom: 1px solid #333;
            padding-bottom: 8px;
        }
        .video-title {
            color: #FF9800;
            font-weight: bold;
            margin-bottom: 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .m3u8-url {
            color: #4CAF50;
            word-break: break-all;
            margin-bottom: 8px;
            position: relative;
            display: flex;
            align-items: center;
        }
        .url-checkbox {
            margin-right: 8px;
        }
        #cache-m3u8-sniffer-header {
            height: 10px;
            margin-bottom: 8px;
        }
        #copy-button {
            background: #2196F3;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 10px;
            width: 100%;
            transition: background 0.3s;
        }
        #copy-button:hover {
            background: #0b7dda;
        }
        #copy-button:disabled {
            background: #757575;
            cursor: not-allowed;
        }
        .copy-success {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 99999;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .copy-success.show {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // 创建链接容器
    const container = document.createElement('div');
    container.id = 'cache-m3u8-sniffer';
    container.innerHTML = `
        <div id="cache-m3u8-sniffer-header"></div>
        <div id="m3u8-entries"></div>
        <button id="copy-button">复制选中的链接到剪贴板</button>
    `;
    document.body.appendChild(container);

    // 创建复制成功提示
    const copySuccess = document.createElement('div');
    copySuccess.className = 'copy-success';
    copySuccess.textContent = '链接已复制到剪贴板!';
    document.body.appendChild(copySuccess);

    // 创建红色触发按钮（点击显示/隐藏链接容器）
    const triggerBtn = document.createElement('button');
    triggerBtn.id = 'cache-m3u8-trigger-btn';
    triggerBtn.textContent = '📺'; // 视频图标提示
    triggerBtn.title = '点击显示/隐藏M3U8链接';
    document.body.appendChild(triggerBtn);

    // 核心变量
    const foundUrls = new Map();
    const copyButton = document.getElementById('copy-button');
    let isCopying = false;
    const MAX_URLS = 3; // 最大嗅探链接数
    const CHECK_INTERVAL = 3000; // 检查间隔3秒
    const MAX_CHECKS = 5; // 最大检查次数
    let sniffingStopped = false;
    let checkCount = 0;

    // 确保容器在可视范围内的函数
    function ensureVisible() {
        if (!showSniffer) return;

        const containerRect = container.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // 检查右侧是否超出可视范围
        if (containerRect.right > viewportWidth) {
            container.style.right = '0';
            container.style.left = 'auto';
        }

        // 检查左侧是否超出可视范围
        if (containerRect.left < 0) {
            container.style.left = '0';
            container.style.right = 'auto';
        }

        // 检查底部是否超出可视范围
        if (containerRect.bottom > viewportHeight) {
            container.style.bottom = '10px';
            container.style.top = 'auto';
        }

        // 检查顶部是否超出可视范围
        if (containerRect.top < 0) {
            container.style.top = '10px';
            container.style.bottom = 'auto';
        }
    }

    // 复制到剪贴板逻辑
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // 备用方法，针对不支持clipboard API的浏览器
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        }
    }

    // 显示复制成功提示
    function showCopySuccess() {
        copySuccess.classList.add('show');
        setTimeout(() => {
            copySuccess.classList.remove('show');
        }, 2000);
    }

    copyButton.addEventListener('click', async () => {
        if (isCopying) return;
        isCopying = true;
        copyButton.disabled = true;
        copyButton.textContent = '复制中...';

        try {
            let textToCopy = '';

            // 单链接逻辑
            if (foundUrls.size === 1) {
                const [title, urls] = [...foundUrls.entries()][0];
                if (urls.size === 1) {
                    textToCopy = [...urls][0];
                }
            }
            // 多链接勾选逻辑
            const checkboxes = document.querySelectorAll('.url-checkbox:checked');
            if (checkboxes.length > 0) {
                textToCopy = Array.from(checkboxes)
                    .map(checkbox => checkbox.getAttribute('data-url'))
                    .join('\n');
            }

            if (textToCopy) {
                await copyToClipboard(textToCopy);
                showCopySuccess();
            }
        } catch (error) {
            console.error('复制失败:', error);
        } finally {
            setTimeout(() => {
                isCopying = false;
                copyButton.disabled = false;
                copyButton.textContent = '复制选中的链接到剪贴板';
            }, 1000);
        }
    });

    // 窗口大小改变事件处理
    window.addEventListener('resize', () => {
        ensureVisible(); // 确保窗口大小改变后仍在可视范围内
        updateUI(false);
    });

    // 辅助函数
    function getVideoTitle() { return document.title.trim() || '未命名视频'; }
    function checkMaxUrlsReached() {
        let totalUrls = 0;
        foundUrls.forEach(urls => totalUrls += urls.size);
        return totalUrls >= MAX_URLS;
    }
    function isM3U8Url(url) { return url && /\.m3u8($|\?)/i.test(url); }
    function addM3U8Url(url, videoTitle) {
        if (!url || sniffingStopped) return;
        // 补全相对链接
        if (url.startsWith('//')) url = window.location.protocol + url;
        else if (url.startsWith('/')) url = window.location.origin + url;
        else if (!url.startsWith('http')) url = new URL(url, window.location.href).href;

        if (isM3U8Url(url)) {
            if (!foundUrls.has(videoTitle)) foundUrls.set(videoTitle, new Set());
            foundUrls.get(videoTitle).add(url);
            if (checkMaxUrlsReached()) sniffingStopped = true;
        }
    }
    function scanHlsObjects(videoTitle) {
        if (unsafeWindow.Hls || unsafeWindow.hls) {
            const hls = unsafeWindow.Hls || unsafeWindow.hls;
            if (hls.players) Object.values(hls.players).forEach(p => { if (p.url) addM3U8Url(p.url, videoTitle); if (sniffingStopped) return; });
        }
        ['videojs', 'plyr', 'shaka', 'flowplayer'].forEach(name => {
            if (unsafeWindow[name]) { scanObjectForUrls(unsafeWindow[name], videoTitle); if (sniffingStopped) return; }
        });
    }
    function scanVideoPlayers(videoTitle) {
        document.querySelectorAll('video').forEach(video => {
            if (video.src) addM3U8Url(video.src, videoTitle); if (sniffingStopped) return;
            if (video.textTracks) Array.from(video.textTracks).forEach(t => { if (t.src) addM3U8Url(t.src, videoTitle); if (sniffingStopped) return; });
        });
        document.querySelectorAll('iframe').forEach(iframe => {
            if (iframe.contentWindow && iframe.src.includes('m3u8')) { addM3U8Url(iframe.src, videoTitle); if (sniffingStopped) return; }
        });
    }
    function deepScanWindow(videoTitle) {
        const win = unsafeWindow || window;
        Object.keys(win).forEach(prop => {
            const value = win[prop];
            if (typeof value === 'string' && isM3U8Url(value)) { addM3U8Url(value, videoTitle); if (sniffingStopped) return; }
            else if (value && typeof value === 'object') { scanObjectForUrls(value, videoTitle); if (sniffingStopped) return; }
        });
    }
    function scanObjectForUrls(obj, videoTitle, depth = 0) {
        if (depth > 2 || sniffingStopped) return;
        if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                if (typeof value === 'string' && isM3U8Url(value)) { addM3U8Url(value, videoTitle); if (sniffingStopped) return; }
                else if (value && typeof value === 'object') { scanObjectForUrls(value, videoTitle, depth + 1); if (sniffingStopped) return; }
            });
        }
    }
    function hookNetworkRequests(videoTitle) {
        // 钩子XMLHttpRequest
        if (window.XMLHttpRequest && !window.XMLHttpRequest._hooked) {
            const originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function() {
                this.addEventListener('load', () => { if (this.responseURL && isM3U8Url(this.responseURL)) addM3U8Url(this.responseURL, videoTitle); });
                originalOpen.apply(this, arguments);
            };
            window.XMLHttpRequest._hooked = true;
        }
        // 钩子fetch
        if (window.fetch && !window.fetch._hooked) {
            const originalFetch = window.fetch;
            window.fetch = async (...args) => {
                const res = await originalFetch.apply(this, args);
                if (res.url && isM3U8Url(res.url)) addM3U8Url(res.url, videoTitle);
                return res;
            };
            window.fetch._hooked = true;
        }
    }

    // 更新UI逻辑
    function updateUI(forceCheck = true) {
        const entriesDiv = document.getElementById('m3u8-entries');
        if (!entriesDiv || !container) return;

        // 渲染链接列表
        entriesDiv.innerHTML = '';
        foundUrls.forEach((urls, title) => {
            const group = document.createElement('div');
            group.className = 'm3u8-group';

            const titleEl = document.createElement('div');
            titleEl.className = 'video-title';
            titleEl.textContent = title;
            titleEl.title = title;
            group.appendChild(titleEl);

            urls.forEach(url => {
                const urlContainer = document.createElement('div');
                urlContainer.className = 'm3u8-url';

                // 多链接时显示勾选框
                if (foundUrls.size > 1 || urls.size > 1) {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'url-checkbox';
                    checkbox.setAttribute('data-title', title);
                    checkbox.setAttribute('data-url', url);
                    urlContainer.appendChild(checkbox);
                }

                const urlText = document.createElement('span');
                urlText.textContent = url;
                urlContainer.appendChild(urlText);
                group.appendChild(urlContainer);

                if (urls.size > 1) {
                    const spacer = document.createElement('div');
                    spacer.style.height = '8px';
                    group.appendChild(spacer);
                }
            });

            entriesDiv.appendChild(group);
        });

        // 显示逻辑
        if (forceCheck) {
            container.style.display = (showSniffer && foundUrls.size > 0) ? 'block' : 'none';
            if (showSniffer && foundUrls.size > 0) {
                ensureVisible(); // 显示时确保在可视范围内
            }
        }
    }

    // 触发按钮点击事件（切换显示/隐藏状态）
    triggerBtn.addEventListener('click', () => {
        showSniffer = !showSniffer;
        updateUI();
    });

    // 嗅探逻辑
    function detectCachedM3U8() {
        if (sniffingStopped) return;
        checkCount++;
        if (checkCount > MAX_CHECKS) { sniffingStopped = true; return; }

        const videoTitle = getVideoTitle();
        // 按优先级嗅探
        hookNetworkRequests(videoTitle);
        if (!sniffingStopped) scanHlsObjects(videoTitle);
        if (!sniffingStopped) scanVideoPlayers(videoTitle);
        if (!sniffingStopped) deepScanWindow(videoTitle);

        updateUI(true);

        if (checkMaxUrlsReached()) {
            sniffingStopped = true;
            console.log('已达最大链接数，停止嗅探');
        }
    }

    // 初始扫描与定时扫描
    detectCachedM3U8();
    const checkInterval = setInterval(() => {
        if (!sniffingStopped) detectCachedM3U8();
        else clearInterval(checkInterval);
    }, CHECK_INTERVAL);

})();
