// ==UserScript==
// @name         Media Player Enhancer
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
// @updateURL    https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/media_enhancer.js
// @license      MIT
// ==/UserScript==
// 快捷键消息提示框 元素ID.
const MSG_BOX_ID = 'reference';

// 初始化快捷键信息提示框
function initReference() {
    const reference = document.createElement('div');
    reference.id = MSG_BOX_ID;
    reference.style.top = '25%';
    reference.style.left = '15%';
    reference.style.margin= '10px';
    reference.style.transform = 'translate(-50%, -50%)';
    reference.style.background = 'rgba(33,33,33,.9)'
    reference.style.color = '#fff';
    reference.style.padding = '10px';
    reference.style.zIndex = '9999';
    reference.style.position='fixed';
    reference.style.display = 'none';
    reference.innerHTML = `
        <h3>Video Player Shortcuts</h3>
        <ul style="list-style-type: none; padding-left: 0;">
            <li style="display: flex; align-items: center;"><code style="font-size: 1.2em; font-weight: bold;">←</code>&nbsp; &nbsp;<span style="color: #999; margin-left: 10px;">Rewind 5 seconds</span></li>
            <li style="display: flex; align-items: center;"><code style="font-size: 1.2em; font-weight: bold;">→</code>&nbsp; &nbsp;<span style="color: #999; margin-left: 10px;">Fast forward 5 seconds</span></li>
            <li style="display: flex; align-items: center;"><code style="font-size: 1.2em; font-weight: bold;">↑</code>&nbsp; &nbsp;&nbsp;<span style="color: #999; margin-left: 10px;">Increase volume</span></li>
            <li style="display: flex; align-items: center;"><code style="font-size: 1.2em; font-weight: bold;">↓</code>&nbsp; &nbsp;&nbsp;<span style="color: #999; margin-left: 10px;">Decrease volume</span></li>
            <li style="display: flex; align-items: center;"><code style="font-size: 1.2em; font-weight: bold;">F</code>&nbsp; &nbsp;&nbsp;<span style="color: #999; margin-left: 10px;">Toggle fullscreen</span></li>
            <li style="display: flex; align-items: center;"><code style="font-size: 1.2em; font-weight: bold;">M</code>&nbsp; &nbsp;&nbsp;<span style="color: #999; margin-left: 10px;">Toggle mute</span></li>
            <li style="display: flex; align-items: center;"><code style="font-size: 1.2em; font-weight: bold;">[</code>&nbsp; &nbsp;&nbsp;<span style="color: #999; margin-left: 10px;">Slow down playback</span></li>
            <li style="display: flex; align-items: center;"><code style="font-size: 1.2em; font-weight: bold;">]</code>&nbsp; &nbsp;&nbsp;<span style="color: #999; margin-left: 10px;">Speed up playback</span></li>
            <li style="display: flex; align-items: center;"><code style="font-size: 1.2em; font-weight: bold;">R</code>&nbsp; &nbsp;&nbsp;<span style="color: #999; margin-left: 10px;">Reset player settings</span></li>
            <li style="display: flex; align-items: center;"><code style="font-size: 1.2em; font-weight: bold;">Q</code>&nbsp; &nbsp;&nbsp;<span style="color: #999; margin-left: 10px;">Show shortcuts reference</span></li>
            <li style="display: flex; align-items: center;"><code style="font-size: 1.2em; font-weight: bold;">Esc</code> <span style="color: #999; margin-left: 10px;">Exit fullscreen</span></li>
         
        </ul>
        <button style="position: absolute; top: 5px; right: 5px; background: none; border: none; font-size: 20px; color: #fff; cursor: pointer;" onclick="this.parentNode.style.display = 'none'">×</button>
    `;
    document.body.appendChild(reference);
}

// 显示快捷键提示框
function showReference() {
    let ele = document.getElementById(MSG_BOX_ID);
    if (ele.style.display === 'none') {
        ele.style.display = 'block';
    } else {
        ele.style.display = 'none';
    }
}

/**
 * 生成video标签的父标签
 * @param videoElement video player tag
 * @param feedbackElement some Information
 * @returns videoContainer
 */
function createVideoParentElement(videoElement, feedbackElement) {
    var videoContainer;
    //  判断父节点是否是body标签 ,是body节点重新生成div作为父节点
    // if (videoElement.parentElement === document.body) {
    ///////
    videoContainer = document.createElement('div');
    videoContainer.id='video-container';
    // videoContainer 样式设置
    videoContainer.style.position = 'relative'; // 设置父节点 div 的定位方式
    videoContainer.style.width = videoElement.offsetWidth + 'px'; // 设置父节点 div 的宽度
    videoContainer.style.height = videoElement.offsetHeight + 'px'; // 设置父节点 div 的高度
    videoElement.parentNode.insertBefore(videoContainer, videoElement); // 将父节点 div 插入到 video 的前面

    // box-sizing: border-box;
    // } else {
    //     videoContainer = videoElement.parentElement;
    // }
    console.log(videoContainer)
    videoContainer.appendChild(videoElement);
    videoContainer.appendChild(feedbackElement); //
    videoContainer.appendChild(document.getElementById(MSG_BOX_ID)); // 添加 快捷键消息提示框.
    document.body.appendChild(videoContainer);
    return videoContainer;
}

(function () {
    'use strict';
    // 初始化消息提示框
    initReference();

    console.log("-----------------video Enhancer---------")
    // 获取HTML5视频播放器元素
    var videoPlayer = document.querySelector('video');

    // 如果没有找到视频播放器则退出
    if (!videoPlayer) return;


    // 设置视频播放器的属性
    videoPlayer.setAttribute('controls', true);
    videoPlayer.constrolsList ='nofullscreen';
    videoPlayer.style.cssText = 'width:100%;height:100%;display:inline-block';

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
