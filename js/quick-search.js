// ==UserScript==
// @name         Quick Search
// @namespace    quick-search
// @homepage     https
// @author       whywhathow
// @version      1.1
// @description  Quick search for Google,google image, google scholar, duckduckgo, twitter,  GitHub....
// @match        *://*/*
// @grant        none

// ==/UserScript==

/***
 * 光标判断 是否是在输入框 input ,textarea
 */
function isInput() {
    if (document.activeElement.tagName.toLowerCase() == "input" || document.activeElement.tagName.toLowerCase() == "textarea") {
        return true;
    }
    else if (document.activeElement.tagName.toLowerCase() == "div" && document.activeElement.contentEditable == "true") {
        return true;
    } else
        return false;
}
var searchEngines = {};
/**
 *  初始化 搜索引擎 配置信息
 */
function initSearchEngines() {

    const jsonData = {
        "phind":{
          "shortcut":"ph",
          "url":"https://phind.com/search?q="  
        },

        "google": {
            "shortcut": "g",
            "url": "https://www.google.com/search?q="
        },
        "googleimages": {
            "shortcut": "gi",
            "url": "https://www.google.com/search?tbm=isch&q="
        },
        "bing": {
            "shortcut": "b",
            "url": "https://www.bing.com/search?q="
        },
        "bingimages": {
            "shortcut": "bi",
            "url": "https://www.bing.com/images/search?q="
        },
        "duckduckgo": {
            "shortcut": "d",
            "url": "https://duckduckgo.com/?q="
        },
        "wikipedia": {
            "shortcut": "w",
            "url": "https://wikipedia.org/w/index.php?search="
        },
        "youtube": {
            "shortcut": "yt",
            "url": "https://www.youtube.com/results?search_query="
        },
        "amazon": {
            "shortcut": "a",
            "url": "https://www.amazon.com/s?k="
        },
        "twitter": {
            "shortcut": "tw",
            "url": "https://twitter.com/search?q="
        },
        "googlescholar": {
            "shortcut": "s",
            "url": "https://scholar.google.com/scholar?q="
        },
        "arxiv": {
            "shortcut": "x",
            "url": "https://arxiv.org/search/?query="
        },
        "ebay": {
            "shortcut": "e",
            "url": "https://www.ebay.com/sch/i.html?_nkw="
        },
        "stackoverflow": {
            "shortcut": "so",
            "url": "https://stackoverflow.com/search?q="
        },
        "github": {
            "shortcut": "gh",
            "url": "https://github.com/search?q="
        },
        "linkedin": {
            "shortcut": "li",
            "url": "https://www.linkedin.com/search/results/all/?keywords="
        },
        "reddit": {
            "shortcut": "r",
            "url": "https://www.reddit.com/search/?q="
        },
        "wolframalpha": {
            "shortcut": "wa",
            "url": "https://www.wolframalpha.com/input/?i="
        },
        "steam": {
            "shortcut": "st",
            "url": "https://store.steampowered.com/search/?term="
        }
    };

    for (const [key, value] of Object.entries(jsonData)) {
        searchEngines[value.shortcut] = value.url;
    }
}
/**
 * 获取url的hostname, 即 homepage 
 * @param {string} url  
 */
function gengerateHomepage(url){
    const homepageUrl = url.split("/").slice(0, 3).join("/");
    return homepageUrl;
}
/**
 * 输入窗口判断
 */
function running() {
    // 弹出输入窗口
    var search = prompt(" Quick search:   ^-_-^ ");
    // 如果用户输入了内容，则进行搜索
    if (search !== null) {
        var parts = search.trim().split(" ");
        var engine = parts.shift().toLowerCase();
        var keyword = parts.join(" ");
        // 处理keyword 为空, 直接进行go to home page 
        var url ;
        if (keyword ===null){
            url = gengerateHomepage(searchEngines[engine]);
        }else {
            url  = searchEngines[engine] + keyword; 
        }
        console.log("-----------------------------------search url --------------------------");
        console.log(url);
        window.open(url);
    }
}
/**
 * 1. init search engine
 * 2. check is in input 
 */
(function () {
    initSearchEngines();
    document.addEventListener('keydown', function (event) {
        if (event.ctrlKey && event.key === 'q') {
            return;
        }
        else if (event.key === 'q' && !isInput()) {
            running();
        }
    }, true);
});
