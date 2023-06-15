//  useful function collections
// usage :means where they have been used.
/**
 *
 * create Icon ,choose Emoji (easy to create, don't need to care the fucking unicode),not font-awesome(too heavy and not suitable for unicode )
 * usage: demo-div.js#23
 */
function createIcon(elementType="span",fontSize="2em", fontWeight="900",code="&#129412;"){
    var icon = document.createElement(elementType);
    icon.style.fontFamily = "Font Awesome 5 Free";
    icon.style.fontWeight = fontWeight;
    icon.style.fontSize = fontSize; // fa-3x
    icon.innerHTML =code;

    return icon;
}
/**
 * 创建 消息通知组件:
 * @param type :类型
 * @returns {HTMLDivElement}
 * @usage: twitter-thread-reader.js#95
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
