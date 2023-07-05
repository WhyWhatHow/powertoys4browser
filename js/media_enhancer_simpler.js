// ==UserScript==
// @name         HTML5 video Player Enhancer
// @description  Enhances the HTML5 video player with keyboard shortcuts and other features, and provides feedback on key presses.
// @match        *://*/*
// @icon         https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/icons/media_enhancer.ico
// @grant        none
// @run-at       window-load
// @namespace    https://whywhathow.github.io/
// @homepage     https://github.com/WhyWhatHow/powertoys4browser
// @supportURL   https://github.com/WhyWhatHow/powertoys4browser/issues
// @version      1.4
// @author       whywhathow
// @updateURL    https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/media_enhancer_simpler.js
// @license      MIT
// ==/UserScript==
// 快捷键消息提示框 元素ID.


function initVideoPlayer() {
// 获取HTML5视频播放器元素
    var originalVideo = document.querySelector('video');
// 如果没有找到视频播放器则退出
    if (!originalVideo) return;

    originalVideo.style.display='none';

    return originalVideo;
}

(function () {
    'use strict';

    console.log("-----------------video Enhancer simpler---------")
    // 创建 video标签
    var videoPlayer= initVideoPlayer();

    // 创建一个用于显示反馈提示的<div>元素
    var feedback = document.createElement('div');
    feedback.style.cssText = 'position:fixed !important; z-index:2147483647 !important; isolation:isolate !important;top:10%;right:5%;transform:translate(-50%,-50%);background:#333;color:#fff;padding:10px;border-radius:5px;z-index:2147483647;font-size:16px;visibility:hidden;'
    // document.body.appendChild(feedback);

    // 判断video 是否有父节点

    // 为视频播放器创建父元素
    var videoContainer = createVideoParentElement(videoPlayer, feedback);

    // 设置视频播放器的快捷键
    document.addEventListener('keydown', function (event) {
        // Add keyboard event listeners to the video element
        const key = event.key;
        console.log("----------------key: "+key+"-----------------")
        switch (key) {
            case 'ArrowLeft':
                videoPlayer.currentTime -= 5;
                showFeedback('← 5s');
                break;
            case 'ArrowRight':
                videoPlayer.currentTime += 5;
                showFeedback('→ 5s');
                break;
            case 'ArrowUp':
                if (videoPlayer.volume < 1) {
                    videoPlayer.volume += 0.1;
                    showFeedback('↑ Volume');
                }
                break;
            case 'ArrowDown':
                if (videoPlayer.volume > 0) {
                    videoPlayer.volume -= 0.1;
                    showFeedback('↓ Volume');
                }
                break;
            case 'f':
                if (document.fullscreenElement === videoContainer) {
                    document.exitFullscreen();
                } else {
                    videoContainer.requestFullscreen();
                    videoPlayer.play();
                    showFeedback('Fullscreen');
                }
                break;
            case 'm':
                if (videoPlayer.muted) {
                    videoPlayer.muted = false;
                    showFeedback('Mute Off')
                } else {
                    videoPlayer.muted = true;
                    showFeedback('Mute On')
                }
                break;

            case '[':
                videoPlayer.playbackRate = Math.max(0.1, videoPlayer.playbackRate - 0.1);
                showFeedback(`- ${videoPlayer.playbackRate.toFixed(1)}x`);
                break;
            case ']':
                videoPlayer.playbackRate += 0.1;
                showFeedback(`+ ${videoPlayer.playbackRate.toFixed(1)}x`);
                break;
            case 'r': // r 键，重置播放器设置
                videoPlayer.volume = 1;
                videoPlayer.playbackRate = 1;
                document.exitFullscreen();
                showFeedback('Reset');
                break;
            case 'Escape': //esc ,退出全屏
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                break;
            case 'q': // 显示快捷键信息
                showReference();
                break;
            case 'Space':
                if (videoPlayer.paused) { // 如果视频已经暂停，则播放视频
                    videoPlayer.play();
                } else { // 如果视频正在播放，则暂停视频
                    videoPlayer.pause();
                }
                break;
            default:
                break;
        }
    });

// 显示按键反馈
    function showFeedback(text) {
        feedback.textContent = text;
        feedback.style.visibility = 'visible';

        setTimeout(function () {
            feedback.style.visibility = 'hidden';
        }, 1000);
    }
})
();
