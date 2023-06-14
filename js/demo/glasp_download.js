
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://glasp.co/#/whywhathow');

    let element;
    while (!element) {
        element = await page.$('#markdown_download');  // 查找 id 为 markdown_download 的元素
    }

    await element.click();  // 找到元素后,触发点击事件

    await browser.close();
})();
