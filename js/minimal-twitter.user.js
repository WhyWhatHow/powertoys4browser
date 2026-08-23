// ==UserScript==
// @name         Minimal Twitter
// @name:zh       Minimal Twitter — X/Twitter 极简主题
// @namespace    https://github.com/WhyWhatHow/
// @homepage     https://github.com/WhyWhatHow/powertoys4browser
// @supportURL   https://github.com/WhyWhatHow/powertoys4browser/issues
// @version      1.0.20
// @description  Refine and clean up the Twitter interface, and customize your experience. A clean and minimal theme for Twitter/X. Userscript adaptation of the Chrome extension from https://github.com/typefully/minimal-twitter (by Typefully), implemented by whywhathow.
// @description:zh  为 X/Twitter 打造极简主题:图标化左侧导航（悬停显示标签）、时间线限宽、Premium/Grok/Creator Studio 等导航项逐项显隐、Grok 页面零干扰、内置中/英/繁三语设置面板、自定义 CSS 注入。Typefully 同名 Chrome 插件的轻量油猴翻版，MIT 开源免费。
// @author       whywhathow
// @license      MIT
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// @run-at       document-idle
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'minimal_twitter_settings';
  const SELECTORS = {
    mainWrapper: 'main[role="main"]',
    mainColumn: '[data-testid="primaryColumn"]',
    topHeader: '[data-testid="primaryColumn"] > div > div:nth-of-type(1)',
    timelineTabs: '[data-testid="primaryColumn"] > div:first-child > div:first-child > div:first-child > div:only-child > nav:only-child',
    leftSidebar: 'header[role="banner"]',
    leftSidebarLinks: 'header[role="banner"] nav[role="navigation"]',
    leftSidebarUnreadBadge: 'header[role="banner"] nav[role="navigation"] a svg + div[aria-label]:only-of-type',
    sidebarLinks: {
      logo: 'header[role="banner"] div:first-child > div:first-child div:first-child > div:first-child > h1:only-child[role="heading"]',
      home: 'header[role="banner"] [data-testid="AppTabBar_Home_Link"]',
      explore: 'header[role="banner"] [data-testid="AppTabBar_Explore_Link"]',
      notifications: 'header[role="banner"] [data-testid="AppTabBar_Notifications_Link"]',
      messages: 'header[role="banner"] [data-testid="AppTabBar_DirectMessage_Link"]',
      bookmarks: 'header[role="banner"] a[href*="bookmarks"]',
      jobs: 'header[role="banner"] a[href*="jobs"]',
      articles: 'header[role="banner"] a[href="/compose/articles"]',
      topics: 'header[role="banner"] a[href*=topics]',
      circles: 'header[role="banner"] a[href*=circles]',
      communities: 'header[role="banner"] a[href*=communities]',
      profile: 'header[role="banner"] [data-testid="AppTabBar_Profile_Link"]',
      lists: 'header[role="banner"] a[href*="lists"][role="link"][aria-label]',
      xPremium: 'header[role="banner"] a[href*="premium"][role="link"][aria-label]:not([href*="premium_signups"])',
      verifiedOrgs: 'header[role="banner"] a[href*="verified-orgs"][role="link"][aria-label]',
      creatorCenter: 'header[role="banner"] a[href*="creator"], header[role="banner"] [data-testid="creatorStudioButton"], header[role="banner"] [data-testid="creator-studio-button"], header[role="banner"] [data-testid="creatorCenterButton"], header[role="banner"] [data-testid="creator-center-button"]',
      analytics: '.mt-sidebar-button[aria-label="Analytics"]',
      accountSwitcher: '[data-testid="SideNav_AccountSwitcher_Button"]',
      grok: 'header[role="banner"] a[href*="grok"][role="link"][aria-label]',
    },
    accountSwitcherButton: '[data-testid="SideNav_AccountSwitcher_Button"]',
    leftSidebarLabel: 'header[role="banner"] nav[role="navigation"] > * > div > div + div:last-child',
    accountSwitcherLabel: '[data-testid="SideNav_AccountSwitcher_Button"] > div:not(:first-child)',
    leftSidebarLabel_hover: 'header[role="banner"] nav[role="navigation"]:hover > * > div > div + div:last-child',
    accountSwitcherLabel_hover: '[data-testid="SideNav_AccountSwitcher_Button"]:hover > div:not(:first-child)',
    rightSidebar: '[data-testid="sidebarColumn"]',
    grokDrawer: '[data-testid="GrokDrawer"]',
    grokDrawerHeader: 'div[data-testid="GrokDrawerHeader"]',
    timelineTablist: 'div[data-testid="ScrollSnap-List"][role="tablist"]',
    timelineTab: 'div[role="tab"]',
    timelineTabPresentation: 'div[role="presentation"]',
    timelineTabSelected: 'div[role="tab"][aria-selected="true"]',
    timelineTabText: 'div[dir="ltr"] > span',
    timelineOptions: 'div[aria-label="Timeline options"]',
    topTweetsOn: 'div[aria-label="Top Tweets on"]',
    menuItem: 'div[role="menuitem"][tabindex="0"]',
    tweetCounts: '[role="group"][id*="id__"]:only-child',
    viewCount: '[role="group"][id*="id__"]:only-child a[href*="/analytics"]',
    tweet: '[data-testid="tweet"][role="article"]',
    tweetSpan: '[data-testid="tweet"][role="article"] div > div:only-child > span:only-child > span',
    grokSvg: 'svg:has(path[d="M12.745 20.54l10.97-8.19c.539-.4 1.307-.244 1.564.38 1.349 3.288.746 7.241-1.938 9.955-2.683 2.714-6.417 3.31-9.83 1.954l-3.728 1.745c5.347 3.697 11.84 2.782 15.898-1.324 3.219-3.255 4.216-7.692 3.284-11.693l.008.009c-1.351-5.878.332-8.227 3.782-13.031L33 0l-4.54 4.59v-.014L12.743 20.544m-2.263 1.987c-3.837-3.707-3.175-9.446.1-12.755 2.42-2.449 6.388-3.448 9.852-1.979l3.72-1.737c-.67-.49-1.53-1.017-2.515-1.387-4.455-1.854-9.789-.931-13.41 2.728-3.483 3.523-4.579 8.94-2.697 13.561 1.405 3.454-.899 5.898-3.22 8.364C1.49 30.2.666 31.074 0 32l10.478-9.466"])',
    searchBox: '[data-testid="sidebarColumn"] form[role="search"]',
    searchBoxInput: '[data-testid="sidebarColumn"] form[role="search"] input:only-child',
    searchListBox: '[data-testid="sidebarColumn"] form[role="search"] div[role="listbox"]',
    modalExternalWrapper: 'div[role="group"]',
    modalBackground: 'div[role="group"] > div:empty',
    modalWrapper: 'div[aria-labelledby="modal-header"][role="dialog"]',
    modalUi: 'div[aria-labelledby="modal-header"][role="dialog"] > div',
    tweetButton: '[data-testid="SideNav_NewTweet_Button"]',
    securityAndAccountAccess: '[data-testid="accountAccessScreen"]',
  };

  const DEFAULT_SETTINGS = {
    extensionStatus: 'on',
    timelineWidth: 700,
    timelineBorders: 'off',
    tweetBorders: 'off',
    stickyHeader: 'on',
    writerMode: 'off',
    followingTimeline: 'off',
    hideViewCount: 'off',
    recentMedia: 'off',
    trendsHomeTimeline: 'off',
    removePromotedPosts: 'on',
    removeTopicsToFollow: 'on',
    removeTimelineTabs: 'off',
    typefullyEnhancementsButtons: 'on',
    followCount: 'show',
    replyCount: 'show',
    retweetCount: 'show',
    likeCount: 'show',
    sidebarLogo: 'off',
    navigationButtonsLabels: 'never',
    navigationCenter: 'off',
    unreadCountBadge: 'off',
    accountSwitcherButton: 'on',
    hideGrokDrawer: 'on',
    interFont: 'off',
    searchBar: 'on',
    transparentSearch: 'off',
    titleNotifications: 'on',
    tweetButton: 'on',
    homeButton: 'on',
    exploreButton: 'on',
    notificationsButton: 'on',
    messagesButton: 'on',
    grokButton: 'on',
    xPremiumButton: 'off',
    listsButton: 'on',
    bookmarksButton: 'on',
    jobsButton: 'off',
    communitiesButton: 'on',
    articles: 'off',
    topicsButton: 'off',
    verifiedOrgsButton: 'off',
    creatorCenterButton: 'on',
    accountSwitcherButton: 'on',
    showFloatingButton: 'on',
    panelLanguage: 'auto',
    typefullyGrowTab: 'on',
    profileButton: 'on',
    customCss: '',
  };

  const STORAGE_KEYS = Object.keys(DEFAULT_SETTINGS);

  // 设置面板多语言（flat key；新增语言只需加一个词典）
  const I18N = {
    en: {
      'panel.title': 'Minimal Twitter Settings',
      'section.general': 'General',
      'section.timeline': 'Timeline',
      'section.content': 'Content',
      'section.navigation': 'Navigation',
      'section.interface': 'Interface',
      'section.customCss': 'Custom CSS',
      'row.panelLanguage': 'Language',
      'row.showFloatingButton': 'Settings Button',
      'row.timelineWidth': 'Timeline Width',
      'row.timelineBorders': 'Remove Timeline Borders',
      'row.tweetBorders': 'Remove Tweet Borders',
      'row.stickyHeader': 'Sticky Header',
      'row.followingTimeline': 'Default to Following Timeline',
      'row.removeTimelineTabs': 'Remove Timeline Tabs',
      'row.writerMode': 'Writer Mode',
      'row.removePromotedPosts': 'Remove Promoted Posts',
      'row.removeTopicsToFollow': 'Remove Topics to Follow',
      'row.hideViewCount': 'Hide View Count',
      'row.followCount': 'Hide Follow Count',
      'row.replyCount': 'Hide Reply Count',
      'row.retweetCount': 'Hide Retweet Count',
      'row.likeCount': 'Hide Like Count',
      'row.navigationLabels': 'Navigation Labels',
      'row.homeButton': 'Home',
      'row.exploreButton': 'Explore',
      'row.notificationsButton': 'Notifications',
      'row.messagesButton': 'Messages',
      'row.grokButton': 'Grok',
      'row.xPremiumButton': 'Premium',
      'row.verifiedOrgsButton': 'Verified Orgs',
      'row.communitiesButton': 'Communities',
      'row.profileButton': 'Profile',
      'row.bookmarksButton': 'Bookmarks',
      'row.listsButton': 'Lists',
      'row.jobsButton': 'Jobs',
      'row.topicsButton': 'Topics',
      'row.articles': 'Articles',
      'row.creatorCenterButton': 'Creator Center',
      'row.accountSwitcherButton': 'Account Switcher',
      'row.navigationCenter': 'Center Navigation',
      'row.unreadCountBadge': 'Unread Badge',
      'row.hideGrokDrawer': 'Hide Grok Drawer',
      'row.searchBar': 'Search Bar',
      'row.transparentSearch': 'Transparent Search Bar',
      'row.tweetButton': 'Tweet Button',
      'row.interFont': 'Use Inter Font',
      'option.never': 'Never',
      'option.always': 'Always',
      'option.hover': 'On Hover',
      'placeholder.customCss': 'Paste custom CSS here...',
    },
    'zh-CN': {
      'panel.title': 'Minimal Twitter 设置',
      'section.general': '通用',
      'section.timeline': '时间线',
      'section.content': '内容',
      'section.navigation': '导航',
      'section.interface': '界面',
      'section.customCss': '自定义 CSS',
      'row.panelLanguage': '面板语言',
      'row.showFloatingButton': '悬浮设置按钮',
      'row.timelineWidth': '时间线宽度',
      'row.timelineBorders': '移除时间线边框',
      'row.tweetBorders': '移除推文边框',
      'row.stickyHeader': '固定顶部栏',
      'row.followingTimeline': '默认 Following 时间线',
      'row.removeTimelineTabs': '移除时间线标签页',
      'row.writerMode': '写作模式',
      'row.removePromotedPosts': '移除推广帖',
      'row.removeTopicsToFollow': '移除推荐话题',
      'row.hideViewCount': '隐藏浏览数',
      'row.followCount': '隐藏关注数',
      'row.replyCount': '隐藏回复数',
      'row.retweetCount': '隐藏转推数',
      'row.likeCount': '隐藏点赞数',
      'row.navigationLabels': '导航文字标签',
      'row.homeButton': '首页',
      'row.exploreButton': '探索',
      'row.notificationsButton': '通知',
      'row.messagesButton': '私信',
      'row.grokButton': 'Grok',
      'row.xPremiumButton': 'Premium',
      'row.verifiedOrgsButton': '认证企业',
      'row.communitiesButton': '社区',
      'row.profileButton': '个人主页',
      'row.bookmarksButton': '书签',
      'row.listsButton': '列表',
      'row.jobsButton': '职位',
      'row.topicsButton': '话题',
      'row.articles': '文章',
      'row.creatorCenterButton': '创作者中心',
      'row.accountSwitcherButton': '账户头像/切换器',
      'row.navigationCenter': '导航居中',
      'row.unreadCountBadge': '未读角标',
      'row.hideGrokDrawer': '隐藏 Grok 抽屉',
      'row.searchBar': '搜索框',
      'row.transparentSearch': '透明搜索框',
      'row.tweetButton': '发推按钮',
      'row.interFont': '使用 Inter 字体',
      'option.never': '从不',
      'option.always': '总是',
      'option.hover': '悬停时',
      'placeholder.customCss': '在此粘贴自定义 CSS…',
    },
    'zh-TW': {
      'panel.title': 'Minimal Twitter 設定',
      'section.general': '一般',
      'section.timeline': '時間線',
      'section.content': '內容',
      'section.navigation': '導覽',
      'section.interface': '介面',
      'section.customCss': '自訂 CSS',
      'row.panelLanguage': '面板語言',
      'row.showFloatingButton': '懸浮設定按鈕',
      'row.timelineWidth': '時間線寬度',
      'row.timelineBorders': '移除時間線邊框',
      'row.tweetBorders': '移除推文邊框',
      'row.stickyHeader': '固定頂部欄',
      'row.followingTimeline': '預設 Following 時間線',
      'row.removeTimelineTabs': '移除時間線標籤',
      'row.writerMode': '寫作模式',
      'row.removePromotedPosts': '移除推廣貼文',
      'row.removeTopicsToFollow': '移除推薦話題',
      'row.hideViewCount': '隱藏瀏覽數',
      'row.followCount': '隱藏追蹤數',
      'row.replyCount': '隱藏回覆數',
      'row.retweetCount': '隱藏轉推數',
      'row.likeCount': '隱藏喜歡數',
      'row.navigationLabels': '導覽文字標籤',
      'row.homeButton': '首頁',
      'row.exploreButton': '探索',
      'row.notificationsButton': '通知',
      'row.messagesButton': '私訊',
      'row.grokButton': 'Grok',
      'row.xPremiumButton': 'Premium',
      'row.verifiedOrgsButton': '認證企業',
      'row.communitiesButton': '社群',
      'row.profileButton': '個人主頁',
      'row.bookmarksButton': '書籤',
      'row.listsButton': '列表',
      'row.jobsButton': '職位',
      'row.topicsButton': '話題',
      'row.articles': '文章',
      'row.creatorCenterButton': '創作者中心',
      'row.accountSwitcherButton': '帳號頭像/切換器',
      'row.navigationCenter': '導覽置中',
      'row.unreadCountBadge': '未讀標記',
      'row.hideGrokDrawer': '隱藏 Grok 抽屜',
      'row.searchBar': '搜尋框',
      'row.transparentSearch': '透明搜尋框',
      'row.tweetButton': '發推按鈕',
      'row.interFont': '使用 Inter 字型',
      'option.never': '從不',
      'option.always': '總是',
      'option.hover': '懸停時',
      'placeholder.customCss': '貼上自訂 CSS…',
    },
  };

  function panelLang() {
    const pref = settings.panelLanguage || 'auto';
    if (pref !== 'auto' && I18N[pref]) return pref;
    const nav = (typeof navigator !== 'undefined' && navigator.language || 'en').toLowerCase();
    if (nav.startsWith('zh')) {
      return (nav.includes('tw') || nav.includes('hk') || nav.includes('hant')) ? 'zh-TW' : 'zh-CN';
    }
    return 'en';
  }

  function t(key) {
    const lang = panelLang();
    return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
  }

  let settings = {};
  let styleElements = {};
  let observer = null;
  let titleObserver = null;
  let isInitialized = false;

  function getStorage(key) {
    if (typeof key === 'string') {
      return GM_getValue(key, DEFAULT_SETTINGS[key]);
    } else if (Array.isArray(key)) {
      const result = {};
      key.forEach(k => {
        result[k] = GM_getValue(k, DEFAULT_SETTINGS[k]);
      });
      return result;
    }
    return GM_getValue(STORAGE_KEY, DEFAULT_SETTINGS);
  }

  function setStorage(key, value) {
    if (typeof key === 'object') {
      Object.entries(key).forEach(([k, v]) => {
        GM_setValue(k, v);
        settings[k] = v;
      });
    } else {
      GM_setValue(key, value);
      settings[key] = value;
    }
    if (isInitialized) {
      applyAllFeatures();
    }
  }

  function loadAllSettings() {
    STORAGE_KEYS.forEach(key => {
      settings[key] = GM_getValue(key, DEFAULT_SETTINGS[key]);
    });
  }

  function addStyles(id, css) {
    removeStyles(id);
    const head = document.querySelector('head');
    if (!head) return;
    const style = document.createElement('style');
    style.id = 'mt-style-' + id;
    style.textContent = css.trim().split('\n').join('');
    head.appendChild(style);
    styleElements[id] = style;
  }

  function removeStyles(id) {
    const existing = document.getElementById('mt-style-' + id);
    if (existing) {
      existing.remove();
      delete styleElements[id];
    }
  }

  function stylesExist(id) {
    return document.getElementById('mt-style-' + id);
  }

  // Grok 页面路由检测（/i/grok 及其子路由）。Grok 布局与三栏时间线差异大，
  // 冲突的布局规则需在其下豁免：给根元素打标记类，配合 html:not(.mt-grok-page) 作用域。
  function isGrokRoute() {
    return /(^|\/)i\/grok($|\/)/.test(window.location.pathname);
  }

  function syncGrokRouteFlag() {
    document.documentElement.classList.toggle('mt-grok-page', isGrokRoute());
  }

  function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), timeout);
    };
  }

  function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function () {
      const context = this;
      const args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function () {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }

  function extractColorsAsRootVars() {
    const extractColor = (selector, varName) => {
      const element = document.querySelector(selector);
      if (element) {
        let color;
        if (varName.includes('bg')) {
          color = window.getComputedStyle(element).backgroundColor;
        } else if (varName.includes('border')) {
          color = window.getComputedStyle(element).borderColor;
        } else {
          color = window.getComputedStyle(element).color;
        }
        const root = document.documentElement;
        if (!color) return;
        const colorRgb = color.replace('rgb(', '').replace(')', '');
        root.style.setProperty(`--${varName}-color`, color);
        root.style.setProperty(`--${varName}-color-rgb`, colorRgb);
      }
    };

    extractColor('body', 'body-bg');
    extractColor('[data-testid="primaryColumn"]', 'border');
    extractColor('h2 > span', 'main-text');
    extractColor('div > span', 'main-text');
    extractColor('a > time', 'secondary-text');
    extractColor("[data-testid='primaryColumn'] div[aria-haspopup='menu'] > div > div > svg", 'secondary-text');
    extractColor('a', 'accent');
    extractColor('div > svg', 'glyphs');
  }

  // 原 isMutationSkippable 已足够，保留不变
  function isMutationSkippable(mutationsList) {
    const a = mutationsList[0]?.addedNodes[0];
    const r = mutationsList[0]?.removedNodes[0];
    const t = mutationsList[0]?.target;
    const el = a || r;

    try {
      if (el?.id?.startsWith('mt-') || t?.id?.startsWith('mt-') ||
          el?.id?.startsWith('typefully-') || t?.className?.startsWith('mt-')) {
        return true;
      }
      if (t.closest('[data-testid="like"]') || t.closest('[data-testid="retweet"]') || t.closest('[data-testid="reply"]')) {
        return true;
      }
      if (t.closest('nav[role="navigation"]')) return true;
      if (t?.nodeName === 'NAV' && t?.getAttribute('role') === 'navigation') return true;
      if (t.closest('head')) return true;
      if (el?.closest("[data-testid^='UserAvatar-Container']") || t?.closest("[data-testid^='UserAvatar-Container']")) return true;
      if (el?.closest("[data-testid='tweetPhoto']")) return true;
      if (el?.nodeName === 'IMG' || t?.nodeName === 'IMG' || el?.nodeName === 'VIDEO' ||
          el?.firstChild?.nodeName === 'VIDEO' || el?.querySelector(':scope > img') ||
          el?.getAttribute('data-testid') === 'tweetPhoto' ||
          el?.parentNode?.getAttribute('data-testid') === 'tweetPhoto' ||
          t?.closest("[data-testid='videoPlayer']")) {
        return true;
      }
      if (el?.closest("[data-testid='card.wrapper']")) return true;
      if (el?.nodeName === 'SCRIPT') return true;
      if (el?.nodeName === 'STYLE') return true;
      if (el?.closest("[data-testid='DMDrawer']") || t?.closest("[data-testid='DMDrawer']")) return true;
      if (el?.closest("[data-testid='sidebarColumn']") || t?.closest("[data-testid='sidebarColumn']")) return true;
      if (el?.nodeName === '#text') return true;
      if (el?.nodeName === 'DIV' && el?.firstChild?.firstChild?.firstChild?.getAttribute('data-testid') === 'caret') {
        return true;
      }
      if (el?.nodeName === 'path') return true;
      return false;
    } catch (e) {}
    return false;
  }

  function changeTimelineWidth(width) {
    if (isGrokRoute()) {
      // Grok 页主列是聊天面板，强制宽度会破坏排版：豁免
      removeStyles('timelineWidth');
      return;
    }
    if (width && !isNaN(width)) {
      addStyles('timelineWidth', `
          @media only screen and (min-width: 988px) {
            ${SELECTORS.mainColumn} {
              width: ${width}px;
              max-width: ${width}px;
            }
          }
        `);
    }
  }

  function changeTimelineBorders(value) {
    if (value === 'on') {
      addStyles('timelineBorders', `
        @media only screen and (min-width: 988px) {
          div${SELECTORS.mainColumn} {
            border-style: hidden;
          }
        }
      `);
    } else {
      removeStyles('timelineBorders');
    }
  }

  function changeTweetBorders(value) {
    if (value === 'on') {
      addStyles('tweetBorders', `
        ${SELECTORS.mainWrapper} section > div > div > div > div[role="separator"] {
          display: none;
        }
        ${SELECTORS.mainColumn} > div > div:empty {
          background: transparent;
        }
      `);
    } else {
      removeStyles('tweetBorders');
    }
  }

  function changeStickyHeader(value) {
    if (value === 'off') {
      addStyles('stickyHeader', `
        ${SELECTORS.mainColumn} > div > div {
          position: unset;
        }
      `);
    } else {
      removeStyles('stickyHeader');
    }
  }

  function changePromotedPosts(value) {
    if (value === 'off') {
      addStyles('removePromotedPosts', `
        [data-testid="placementTracking"] article {
          display: flex;
        }
      `);
    } else {
      removeStyles('removePromotedPosts');
    }
  }

  function changeTopicsToFollow(value) {
    if (value === 'on') {
      addStyles('removeTopicsToFollow', `
        ${SELECTORS.mainColumn} section[aria-labelledby^="accessible-list-"] > div[aria-label$="Carousel"],
        ${SELECTORS.mainColumn} a[href*="/i/flow/topics_selector"],
        ${SELECTORS.mainColumn} a[href*="/i/topics/picker/home"] {
          display: none;
        }
        [aria-label="Lists timeline"] section[aria-labelledby^="accessible-list-"] > div[aria-label$="Carousel"] {
          display: flex;
        }
      `);
    } else {
      removeStyles('removeTopicsToFollow');
    }
  }

  function changeTimelineTabs(value, writerMode) {
    const isHome = window.location.pathname === '/' || window.location.pathname.includes('/home');
    if (writerMode === 'on' || window.location.pathname.includes('compose/tweet') || !isHome) {
      removeStyles('removeTimelineTabs');
      return;
    }
    if (value === 'on') {
      if (!stylesExist('removeTimelineTabs')) {
        addStyles('removeTimelineTabs', `
          ${SELECTORS.timelineTabs} {
            display: none;
          }
        `);
      }
    } else {
      removeStyles('removeTimelineTabs');
    }
  }

  function changeFollowingTimeline() {
    if (getStorage('followingTimeline') !== 'on') return;
    const tablist = document.querySelector(SELECTORS.timelineTablist);
    const selectedTab = document.querySelector(`${SELECTORS.timelineTablist} ${SELECTORS.timelineTabSelected}`);
    if (!tablist || !selectedTab) return;
    const followingTabSpan = tablist.querySelector(`${SELECTORS.timelineTabPresentation}:nth-of-type(2) span`);
    if (!followingTabSpan) return;
    const followingTabText = followingTabSpan.textContent.toLowerCase();
    const selectedTabSpan = selectedTab.querySelector(SELECTORS.timelineTabText);
    if (!selectedTabSpan) return;
    const selectedTabText = selectedTabSpan.textContent.toLowerCase();
    if (selectedTabText === followingTabText) return;
    const secondTab = tablist.querySelector(`${SELECTORS.timelineTabPresentation}:nth-child(2) ${SELECTORS.timelineTab}`);
    if (!secondTab) return;
    secondTab.click();
  }

  // 改为纯 CSS 实现，不再需要遍历 DOM，大幅提升性能
  function changeHideViewCounts(value) {
    if (value === 'on') {
      addStyles('hideViewCount', `
        [role="group"][id*="id__"]:only-child a[href*="/analytics"] {
          display: none !important;
        }
      `);
    } else {
      removeStyles('hideViewCount');
    }
  }

  function hideRightSidebar() {
    const isSearchPage = window.location.pathname === '/search';
    if (isSearchPage) {
      removeStyles('hide-sidebar');
      removeOtherSections();
      setTimeout(() => removeOtherSections(), 500);
    } else {
      if (!stylesExist('hide-sidebar')) {
        addStyles('hide-sidebar', `
          ${SELECTORS.rightSidebar} {
            visibility: hidden;
            width: 0;
            margin: 0;
            padding: 0;
            z-index: 1;
          }
        `);
      }
    }
  }

  function removeOtherSections() {
    const sidebar = document.querySelector(SELECTORS.rightSidebar);
    if (!sidebar) return;
    sidebar.querySelector('aside[role="complementary"]')?.parentElement?.remove();
    sidebar.querySelector('section[role="region"]')?.parentElement?.parentElement?.remove();
  }

  function updateLeftSidebarPositioning() {
    if (isGrokRoute()) {
      // Grok 布局对 header 定位/body 内边距敏感：豁免
      removeStyles('navigation-position');
      return;
    }
    addStyles('navigation-position', `
      @media only screen and (min-width: 1000px) {
        ${SELECTORS.leftSidebar} {
          position: fixed;
          left: 0;
        }
      }
      @media only screen and (min-width: 1000px) and (max-width: 1265px) {
        body {
          padding-left: 88px;
        }
      }
    `);
  }

  function addSmallerSearchBarStyle() {
    const searchInput = document.querySelector('form[role="search"] input:only-child');
    if (!searchInput) return;
    // 搜索结果页：输入框需完整显示已输入的查询词，不做窄化
    if (window.location.pathname.includes('/search') || window.location.pathname.includes('/explore')) {
      removeStyles('searchInputWidth');
      addStyles('searchPageInput', `
        form[role="search"] input:only-child {
          width: 100% !important;
          min-width: 0 !important;
          text-overflow: ellipsis;
        }
      `);
      return;
    } else {
      removeStyles('searchPageInput');
    }
    if (document.activeElement === searchInput) return;
    const searchBarPlaceholderWidth = searchInput.getAttribute('placeholder')?.length || 0;
    if (searchBarPlaceholderWidth > 0) {
      addStyles('searchInputWidth', `
        form[role="search"] input:only-child {
          width: ${searchBarPlaceholderWidth + 4}ch;
          min-width: ${searchBarPlaceholderWidth + 4}ch;
        }
      `);
    }
  }

  function changeHideSearchBar(value) {
    if (value === 'off') {
      addStyles('searchBar', `
        form[role="search"] {
          display: none !important;
          visibility: hidden !important;
        }
      `);
      addStyles('trendsHomeTimeline-more', `
        @media only screen and (min-width: 1265px) {
          ${SELECTORS.rightSidebar} section[aria-labelledby^="accessible-list-"] {
            top: 12px !important;
          }
          .mt-recentMedia-photoGrid {
            top: 12px !important;
          }
        }
      `);
    } else {
      removeStyles('searchBar');
      addStyles('trendsHomeTimeline-more', `
        @media only screen and (min-width: 1265px) {
          ${SELECTORS.rightSidebar} section[aria-labelledby^="accessible-list-"] {
            top: unset;
          }
          .mt-recentMedia-photoGrid {
            top: unset !important;
          }
        }
      `);
    }
  }

  /**
   * 搜索框固定在右上角（不移动 DOM，避免破坏 React 状态）。
   * q1 固定不动、q2 独立悬浮、q3 避免与 post 返回栏同行重叠、q4 仅 on/off。
   */
  function applySearchBarPosition() {
    if (settings.searchBar === 'off') {
      removeStyles('searchBarPosition');
      return;
    }
    // 搜索页/探索页保留原生布局，不做固定定位
    if (window.location.pathname === '/search' || window.location.pathname.includes('/explore')) {
      removeStyles('searchBarPosition');
      return;
    }
    addStyles('searchBarPosition', `
      @media only screen and (min-width: 1100px) {
        ${SELECTORS.searchBox} {
          visibility: visible !important;
          position: fixed !important;
          top: 12px !important;
          right: 16px !important;
          z-index: 5 !important;
          width: 320px !important;
          max-width: 32vw !important;
          pointer-events: auto !important;
          cursor: text !important;
        }
        ${SELECTORS.searchBox}:focus-within {
          width: 360px !important;
          max-width: 36vw !important;
        }
        ${SELECTORS.searchBox} input:only-child {
          pointer-events: auto !important;
          cursor: text !important;
          width: 100% !important;
          min-width: 0 !important;
        }
        ${SELECTORS.searchBox} > div:first-child {
          cursor: text !important;
          pointer-events: auto !important;
        }
      }
      @media only screen and (max-width: 1099px) {
        ${SELECTORS.searchBox} {
          position: static !important;
          visibility: visible !important;
          width: auto !important;
        }
      }
    `);
    // 点击表单空白处也能聚焦输入框（输入框窄化时后半区原本点不到）
    const _form = document.querySelector(SELECTORS.searchBox);
    if (_form && !_form._mtClickBound) {
      _form._mtClickBound = true;
      _form.addEventListener('click', (e) => {
        const _input = _form.querySelector('input:only-child');
        if (_input && e.target !== _input && document.activeElement !== _input) _input.focus();
      });
    }
  }

  function changeTransparentSearchBar(value) {
    if (value === 'on') {
      addStyles('transparentSearch', `
        form[role="search"] > div:nth-child(1) > div {
          background-color: transparent;
        }
        form[role="search"] input:only-child {
          transform: translateX(2ch);
          margin-left: -2.5ch;
        }
      `);
    } else {
      removeStyles('transparentSearch');
    }
  }

  function changeTweetButton(value) {
    if (value === 'off') {
      addStyles('tweetButton', `
        ${SELECTORS.tweetButton} {
          visibility: hidden;
        }
      `);
    } else {
      removeStyles('tweetButton');
    }
  }

  function changeTitleNotifications(value) {
    const run = () => {
      const favicon = document.querySelector('link[rel="shortcut icon"]');
      if (!favicon) return;
      if (value === 'on') {
        favicon.setAttribute('href', favicon.href.replace('twitter.ico', 'twitter-pip.2.ico'));
      } else {
        if (document.title.charAt(0) === '(') {
          document.title = document.title.split(' ').slice(1).join(' ');
        }
      }
    };
    run();
    // 复用同一个观察器，避免重复创建导致内存泄漏
    if (!titleObserver) {
      titleObserver = new MutationObserver(() => run());
      const target = document.querySelector('title');
      if (target) titleObserver.observe(target, { subtree: true, characterData: true, childList: true });
    }
  }

  function changeReplyCount(value) {
    if (value === 'hide') {
      addStyles('replyCount', `
        [data-testid="reply"] span {
          visibility: hidden;
        }
      `);
    } else {
      removeStyles('replyCount');
    }
  }

  function changeRetweetCount(value) {
    if (value === 'hide') {
      addStyles('retweetCount', `
        [href$="/retweets"],
        [href$="/retweets/with_comments"],
        [data-testid="retweet"] span,
        [data-testid="unretweet"] span {
          visibility: hidden;
        }
      `);
    } else {
      removeStyles('retweetCount');
    }
  }

  function changeLikeCount(value) {
    if (value === 'hide') {
      addStyles('likeCount', `
        [href$="/likes"][href*="/status/"],
        [data-testid="like"] span,
        [data-testid="unlike"] span {
           visibility: hidden;
        }
      `);
    } else {
      removeStyles('likeCount');
    }
  }

  function changeFollowingAndFollowersCounts(value) {
    if (value === 'hide') {
      addStyles('followCount', `
        [href$="following"][dir][role="link"],
        [href$="followers"][dir][role="link"] {
          display: none;
        }
      `);
    } else {
      removeStyles('followCount');
    }
  }

  function changeSidebarSetting(selector, state) {
    const sidebarSelector = SELECTORS.sidebarLinks[selector];
    if (!sidebarSelector) return;
    if (state === 'off') {
      addStyles(selector, `
        ${sidebarSelector} {
          display: none;
        }
      `);
    } else {
      removeStyles(selector);
    }
  }

  function changeUnreadCountBadge(value) {
    if (value === 'off') {
      addStyles('unreadCountBadge', `
        ${SELECTORS.leftSidebarUnreadBadge} {
          display: none;
        }
        ${SELECTORS.accountSwitcherButton} > div > svg+div[aria-label] {
          display: none;
        }
      `);
    } else {
      removeStyles('unreadCountBadge');
    }
  }

  function changeNavigationButtonsLabels(setting) {
    const isMessagesPage = window.location.pathname.startsWith('/messages');
    // 仅对私信页做特殊处理，搜索页不再进入此分支
    if (isMessagesPage) {
      removeStyles('navigation-position');
      addStyles('customDMsAndSearchStyle', `
        ${SELECTORS.leftSidebar} {
          flex: 0.5 1 auto;
        }
        @media only screen and (min-width: 1200px) {
          ${SELECTORS.leftSidebar} {
            flex: 0.3 1 auto;
          }
        }
        ${SELECTORS.mainWrapper} {
          align-items: flex-start;
        }
      `);
    } else {
      removeStyles('customDMsAndSearchStyle');
    }
    switch (setting) {
      case 'never':
        addStyles('removeLabels', `
          ${SELECTORS.leftSidebarLinks} > * > div > div + div:last-child {
            display: none;
          }
          ${SELECTORS.accountSwitcherLabel} {
            display: none;
          }
          #mt-sidebar-lists > div[dir] > div:last-child {
            display: none !important;
          }
        `);
        removeStyles('hideLabels');
        removeStyles('showLabelsOnHover');
        break;
      case 'always':
        removeStyles('hideLabels');
        removeStyles('removeLabels');
        removeStyles('showLabelsOnHover');
        break;
      case 'hover':
        removeStyles('removeLabels');
        addStyles('hideLabels', `
          ${SELECTORS.leftSidebarLabel},
          ${SELECTORS.accountSwitcherLabel} {
            display: inline-block;
            opacity: 0;
            transition: 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
          #mt-sidebar-lists > div[dir] > div:last-child {
            display: inline-block;
            opacity: 0;
            transition: 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          }
        `);
        addStyles('showLabelsOnHover', `
          ${SELECTORS.leftSidebarLabel_hover},
          ${SELECTORS.accountSwitcherLabel_hover} {
            opacity: 1;
          }
          header[role="banner"] nav[role="navigation"]:hover #mt-sidebar-lists > div[dir] > div:last-child {
            opacity: 1;
          }
        `);
        break;
    }
  }

  function changeNavigationCenter(value) {
    if (value === 'on') {
      addStyles('navigationCenter', `
        ${SELECTORS.leftSidebar} > div > div > div {
          justify-content: center;
          padding-top: 0;
        }
      `);
    } else {
      removeStyles('navigationCenter');
    }
  }

  function hideGrokDrawer(value) {
    if (value === 'on') {
      addStyles('grokDrawer', `
        ${SELECTORS.grokDrawer}:not(.typefully-grok-drawer-enabled) {
          display: none !important;
        }
      `);
    } else {
      removeStyles('grokDrawer');
    }
  }

  function changeCustomCss(css) {
    let styleEl = document.getElementById('custom-css');
    if (!styleEl) {
      // 本脚本没有 mt-external-stylesheet，直接创建并追加到 head
      styleEl = document.createElement('style');
      styleEl.id = 'custom-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
  }

  function changeWriterMode(value) {
    if (!window.location.pathname.includes('/home') && window.location.pathname !== '/' &&
        !window.location.pathname.includes('/compose/tweet')) {
      removeStyles('writerMode');
      return;
    }
    if (value === 'on') {
      if (stylesExist('writerMode')) return;
      addStyles('writerMode', `
        body {
          padding-left: 0;
          overflow: hidden;
        }
        ${SELECTORS.mainColumn} {
          border-style: hidden;
          padding-top: 3vh;
          margin: 0 auto;
        }
        ${SELECTORS.mainWrapper} {
          flex-basis: 100%;
        }
        ${SELECTORS.mainWrapper} > div {
          width: 100%;
          max-width: 100%;
        }
        ${SELECTORS.leftSidebar},
        ${SELECTORS.rightSidebar},
        ${SELECTORS.mainColumn} > div > div:not(:nth-of-type(1)):not(:nth-of-type(2)):not(:nth-of-type(3)) {
          overflow: hidden;
          visibility: hidden;
          opacity: 0;
          width: 0;
          height: 0;
        }
        ${SELECTORS.topHeader} {
          visibility: hidden;
        }
        ${SELECTORS.modalWrapper} {
          width: 100vw;
          max-width: 100vw;
          top: 0;
          border-radius: 0;
        }
        div[role="group"] > div:empty {
          background-color: var(--body-bg-color);
        }
        ${SELECTORS.modalUi} {
          border-radius: 0;
        }
        ${SELECTORS.modalWrapper} > div > div > div {
          padding-bottom: 10vh;
        }
      `);
    } else {
      removeStyles('writerMode');
    }
  }

  function applyStaticFeatures() {
    changeTimelineWidth(settings.timelineWidth);
    changeTimelineBorders(settings.timelineBorders);
    changeTweetBorders(settings.tweetBorders);
    changeStickyHeader(settings.stickyHeader);
    changeWriterMode(settings.writerMode);
    changeFollowingTimeline();
    changeHideViewCounts(settings.hideViewCount);
    changeTrendsHomeTimeline();
    changePromotedPosts(settings.removePromotedPosts);
    changeTopicsToFollow(settings.removeTopicsToFollow);
    changeTimelineTabs(settings.removeTimelineTabs, settings.writerMode);
    changeFollowingAndFollowersCounts(settings.followCount);
    changeReplyCount(settings.replyCount);
    changeRetweetCount(settings.retweetCount);
    changeLikeCount(settings.likeCount);
    changeSidebarSetting('logo', settings.sidebarLogo);
    changeNavigationButtonsLabels(settings.navigationButtonsLabels);
    changeNavigationCenter(settings.navigationCenter);
    changeUnreadCountBadge(settings.unreadCountBadge);
    hideGrokDrawer(settings.hideGrokDrawer);
    changeInterFont();
    changeHideSearchBar(settings.searchBar);
    applySearchBarPosition();
    changeTransparentSearchBar(settings.transparentSearch);
    changeTitleNotifications(settings.titleNotifications);
    changeTweetButton(settings.tweetButton);
    changeHomeButton();
    changeExploreButton();
    changeNotificationsButton();
    changeMessagesButton();
    changeBookmarksButton();
    changeJobsButton();
    changeCommunitiesButton();
    changeListsButton();
    pinListsToSidebar();
    moveProfileLinkToBottom();
    hideIconlessNavEntries();
    changeProfileButton();
    changeGrokButton();
    changeXPremiumButton();
    changeVerifiedOrgsButton();
    changeTopicsButton();
    changeArticlesButton();
    changeCreatorCenterButton();
    applyCreatorStudioFallback();
    changeAccountSwitcherButton();
    changeCustomCss(settings.customCss);
    createFloatingButton();
  }

  function changeTrendsHomeTimeline() {
    const isHome = window.location.pathname === '/' || window.location.pathname.includes('/home');
    if (settings.writerMode === 'on' || window.location.pathname.includes('compose/tweet') || !isHome) {
      removeStyles('trendsHomeTimeline');
      return;
    }
    if (settings.trendsHomeTimeline === 'on') {
      if (!stylesExist('trendsHomeTimeline')) {
        addStyles('trendsHomeTimeline', `
          @keyframes render {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
              transform: none;
            }
          }
          @media only screen and (min-width: 1265px) {
            ${SELECTORS.rightSidebar} section[aria-labelledby^="accessible-list-"] {
              visibility: visible;
              position: fixed;
              right: 16px;
              top: 66px;
              max-height: 78vh;
              overflow: auto;
              width: 300px;
              border-radius: 16px;
              border-color: var(--border-color);
              border-width: 1px;
              background-color: var(--body-bg-color);
              opacity: 0;
              will-change: opacity;
              animation-name: render;
              animation-duration: 0s;
              animation-fill-mode: forwards;
              animation-delay: 500ms;
              margin-top: 4px;
            }
            [data-testid="primaryColumn"] {
              transform: translateX(-64px);
            }
          }
        `);
      }
    } else {
      removeStyles('trendsHomeTimeline');
    }
  }

  function changeInterFont() {
    if (settings.interFont === 'on') {
      addStyles('interFont', `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        div, span, input, textarea {
          font-family: Inter, TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }
      `);
    } else {
      removeStyles('interFont');
    }
  }

  function changeHomeButton() { changeSidebarSetting('home', settings.homeButton); }
  function changeExploreButton() { changeSidebarSetting('explore', settings.exploreButton); }
  function changeNotificationsButton() { changeSidebarSetting('notifications', settings.notificationsButton); }
  function changeMessagesButton() { changeSidebarSetting('messages', settings.messagesButton); }
  function changeBookmarksButton() { changeSidebarSetting('bookmarks', settings.bookmarksButton); }
  function changeJobsButton() { changeSidebarSetting('jobs', settings.jobsButton); }
  function changeCommunitiesButton() { changeSidebarSetting('communities', settings.communitiesButton); }
  function changeListsButton() { changeSidebarSetting('lists', settings.listsButton); }
  function changeProfileButton() { changeSidebarSetting('profile', settings.profileButton); }
  function changeGrokButton() { changeSidebarSetting('grok', settings.grokButton); }
  function changeXPremiumButton() { changeSidebarSetting('xPremium', settings.xPremiumButton); }
  function changeVerifiedOrgsButton() { changeSidebarSetting('verifiedOrgs', settings.verifiedOrgsButton); }
  function changeTopicsButton() { changeSidebarSetting('topics', settings.topicsButton); }
  function changeArticlesButton() { changeSidebarSetting('articles', settings.articles); }
  function changeCreatorCenterButton() { changeSidebarSetting('creatorCenter', settings.creatorCenterButton); }

  // Creator Studio/Center 条目可能无稳定 href/testid（真机反馈 CSS 选择器未命中），
  // 用 aria-label + 可见文本兑底识别，直接内联隐藏；开启时仅清除本脚本标记的隐藏
  const CREATOR_STUDIO_TEXT_RE = /creator\s*(studio|center|centre)|创作者中心|創作者中心/i;
  function findCreatorStudioEntry() {
    const nav = document.querySelector(SELECTORS.leftSidebarLinks);
    if (!nav) return null;
    return nav.querySelector('[data-testid*="reator"], a[href*="creator"]')
      || Array.from(nav.querySelectorAll('a[role="link"]')).find(a =>
        CREATOR_STUDIO_TEXT_RE.test((a.getAttribute('aria-label') || '') + ' ' + (a.textContent || '')));
  }
  function applyCreatorStudioFallback() {
    const el = findCreatorStudioEntry();
    if (!el) return;
    if (getStorage('creatorCenterButton') === 'off') {
      el.dataset.mtCreatorHidden = '1';
      el.style.display = 'none';
    } else if (el.dataset.mtCreatorHidden === '1') {
      delete el.dataset.mtCreatorHidden;
      el.style.display = '';
    }
  }
  function changeAccountSwitcherButton() { changeSidebarSetting('accountSwitcher', settings.accountSwitcherButton); }

  // X 的 Lists 页面链接是 /{username}/lists，而不是 /lists，需要动态生成
  function getListsHref() {
    const profileLink = document.querySelector('[data-testid="AppTabBar_Profile_Link"]');
    if (profileLink) {
      const path = new URL(profileLink.getAttribute('href') || '', window.location.origin).pathname;
      const usernamePath = path.replace(/\/+$/, '');
      if (usernamePath) return usernamePath + '/lists';
    }
    // 回退：复用页面中已存在的 Lists 链接（例如 More 菜单里的）
    const existingLink = document.querySelector('a[href*="/lists"][role="link"][aria-label]:not(#mt-sidebar-lists)');
    if (existingLink) return existingLink.getAttribute('href');
    return '/lists';
  }

  // 将 Lists 直接固定到左侧竖向导航栏（X 默认把它收在 More 菜单里）
  function pinListsToSidebar() {
    const nav = document.querySelector(SELECTORS.leftSidebarLinks);
    if (!nav) return;
    // 关闭时立即移除已固定的 Lists 项（不能只靠 CSS 隐藏，ID 优先级会覆盖隐藏规则）
    if (settings.listsButton !== 'on') {
      document.getElementById('mt-sidebar-lists')?.remove();
      return;
    }
    const listsHref = getListsHref();

    // 已固定：切换账号后更新链接
    const existing = document.getElementById('mt-sidebar-lists');
    if (existing) {
      if (existing.getAttribute('href') !== listsHref) existing.setAttribute('href', listsHref);
      return;
    }
    // 导航栏里已有原生 Lists，不重复添加
    if (nav.querySelector('a[href*="lists"][role="link"][aria-label]')) return;

    const item = document.createElement('a');
    item.id = 'mt-sidebar-lists';
    item.href = listsHref;
    item.setAttribute('role', 'link');
    item.setAttribute('aria-label', 'Lists');
    // 结构与其他导航项一致（icon 包裹层 + 标签层），hover 显示标签的 CSS 会自动生效
    item.innerHTML = `
      <div dir="ltr">
        <div>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 4.5C3 3.12 4.12 2 5.5 2h13C19.88 2 21 3.12 21 4.5v15c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 22 3 20.88 3 19.5v-15zM5.5 4c-.28 0-.5.22-.5.5v15c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5h-13zM7 6h10v2H7V6zm0 4h10v2H7v-2zm0 4h6v2H7v-2z"></path>
          </svg>
        </div>
        <div>
          <span dir="ltr">Lists</span>
        </div>
      </div>
    `;

    // 插到 More 按钮之前；找不到则插到账户切换器之前，再不行就追加到末尾
    const moreButton = nav.querySelector('[data-testid="SideNav_MoreButton"], button[aria-label="More"]');
    if (moreButton) {
      nav.insertBefore(item, moreButton);
    } else {
      const switcher = nav.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]');
      if (switcher) {
        nav.insertBefore(item, switcher);
      } else {
        nav.appendChild(item);
      }
    }
  }

  // 左侧导航默认排序：启用项保持原生位置，仅把个人主页(Profile)移到最下。
  // 直接操作 DOM，与 pinListsToSidebar 同模式；MutationObserver 驱动的
  // runDynamicFeatures 会在 SPA 重渲染后重新应用（isMutationSkippable 跳过 nav 变动，无死循环）。
  function moveProfileLinkToBottom() {
    const nav = document.querySelector(SELECTORS.leftSidebarLinks);
    if (!nav) return;
    const profile = nav.querySelector('[data-testid="AppTabBar_Profile_Link"]');
    if (!profile || profile.parentElement !== nav) return;
    const switcher = document.querySelector(SELECTORS.accountSwitcherButton);
    const anchor = (switcher && switcher.parentElement === nav && switcher !== profile) ? switcher : null;
    if (anchor) {
      if (profile.nextElementSibling === anchor) return; // 已就位
      nav.insertBefore(profile, anchor);
    } else {
      if (!profile.nextElementSibling) return; // 已在末尾
      nav.appendChild(profile);
    }
  }

  // 去掉左侧导航中没有图标的条目（如“文章/Articles”）：
  // 仅处理 nav 直接子级的 <a> 链接，无 svg/img 图标则内联隐藏并打标记；
  // 若之后 X 为其补上图标，则自动恢复。幂等，SPA 重渲染后由 runDynamicFeatures 重放。
  function hideIconlessNavEntries() {
    const nav = document.querySelector(SELECTORS.leftSidebarLinks);
    if (!nav) return;
    Array.from(nav.children).forEach(el => {
      if (el.tagName !== 'A' || el.id === 'mt-sidebar-lists') return;
      if (el.querySelector('svg, img')) {
        if (el.dataset.mtIconless === '1') {
          delete el.dataset.mtIconless;
          el.style.display = '';
        }
        return;
      }
      el.dataset.mtIconless = '1';
      el.style.display = 'none';
    });
  }

  // 移除了 changeHideViewCounts 的调用，它现在完全由 CSS 控制
  // Grok 路由切换时同步：打标记类 + 双向豁免/恢复冲突布局规则
  function applyGrokScopedLayouts() {
    syncGrokRouteFlag();
    if (isGrokRoute()) {
      removeStyles('timelineWidth');
      removeStyles('navigation-position');
    } else if (window.location.pathname.startsWith('/messages')) {
      // 私信页由 customDMsAndSearchStyle 接管侧栏布局（flex 弹性宽度、非固定）。
      // 这里若把 navigation-position 加回去，会与 flex 规则叠加导致左侧导航排版错乱。
      removeStyles('navigation-position');
    } else {
      changeTimelineWidth(settings.timelineWidth);
      updateLeftSidebarPositioning();
    }
  }

  const runDynamicFeatures = throttle(() => {
    if (settings.extensionStatus === 'off') return;
    applyGrokScopedLayouts();
    applySearchBarPosition();
    hideRightSidebar();
    addSmallerSearchBarStyle();
    changeTimelineTabs(settings.removeTimelineTabs, settings.writerMode);
    changeWriterMode(settings.writerMode);
    hideGrokDrawer(settings.hideGrokDrawer);
    pinListsToSidebar();
    applyCreatorStudioFallback();
    moveProfileLinkToBottom();
    hideIconlessNavEntries();
  }, 80); // 稍微放宽节流时间

  function injectMainStyles() {
    const css = `
      [data-testid="placementTracking"] article,
      a[href*="quick_promote_web"] {
        display: none;
      }
      [data-testid="DMDrawer"] {
        visibility: hidden;
      }
      @media only screen and (min-width: 1000px) {
        /* 以下主列布局规则仅作用于非 Grok 页：Grok 聊天布局下会错位（html:not(.mt-grok-page) 豁免） */
        html:not(.mt-grok-page) main[role="main"] {
          align-items: center;
          overflow-x: clip;
        }
        html:not(.mt-grok-page) [data-testid="primaryColumn"] {
          margin: 0 auto;
        }
        html:not(.mt-grok-page) [data-testid="primaryColumn"] > div > div:last-child,
        html:not(.mt-grok-page) [data-testid="primaryColumn"] > div > div:last-child div {
          max-width: unset;
        }
        header[role="banner"] {
          align-items: flex-start;
        }
        h1[role="heading"] {
          padding-top: 4px;
        }
        header[role="banner"] nav[role="navigation"]:hover > * > div {
          backdrop-filter: blur(12px);
        }
        header[role="banner"] > div > div > div > div:last-child {
          margin-bottom: 0px !important;
        }
        [data-testid="SideNav_AccountSwitcher_Button"] {
          bottom: 12px;
        }
        header[role="banner"] > div > div > div > div:first-child {
          flex-shrink: 1;
          overflow-y: auto;
        }
        html:not(.mt-grok-page) [data-testid="SideNav_NewTweet_Button"] {
          position: fixed;
          right: 16px;
          bottom: 24px;
        }
        /* Grok 页左侧导航不需要 Post 按钮 */
        html.mt-grok-page [data-testid="SideNav_NewTweet_Button"] {
          display: none;
        }
        header[role="banner"] > div > div > div {
          overflow: visible;
        }
      }
      [data-testid="sidebarColumn"] {
        margin-left: 12px;
      }
      /* 搜索框基础样式（原位 fixed 定位在 applySearchBarPosition 中按配置开启） */
      @media only screen and (min-width: 1100px) {
        [data-testid="sidebarColumn"] input[placeholder="Search Twitter"],
        [data-testid="sidebarColumn"] input[placeholder="Search X"] {
          width: 150px;
        }
        [data-testid="sidebarColumn"] form[role="search"]:focus-within {
          width: 374px;
          backdrop-filter: blur(12px);
        }
        [data-testid="sidebarColumn"] form[role="search"] input:focus {
          width: 100% !important;
        }
        /* 搜索建议下拉框跟随搜索框定位 */
        [data-testid="sidebarColumn"] form[role="search"] div[role="listbox"] {
          left: unset !important;
          width: 374px !important;
        }
        /* 搜索下拉定位 hack 仅作用于非 Grok 页，避免干扰聊天布局内同 inline-style 元素 */
        html:not(.mt-grok-page) div[style*="left: -12px"] {
          left: unset;
        }
        html:not(.mt-grok-page) div[style="left: -8px; width: 306px;"] {
          left: unset;
          width: 374px;
        }
      }
      .mt-sidebar-button > div > div[dir] {
        font-weight: 400;
      }
      .mt-sidebar-button:hover > div {
        background-color: rgba(var(--glyphs-color-rgb, 29, 155, 240), 0.1);
      }
      @media only screen and (max-width: 1264px) {
        .mt-sidebar-button > div > div[dir] {
          display: none;
        }
      }
      .mt-tooltip {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 2px;
        background: var(--body-bg-color);
        color: var(--main-text-color);
        padding: 6px 8px;
        max-width: 250px;
        border-radius: 5px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 2px 14px rgba(0, 0, 0, 0.08);
        z-index: 9999;
        font-family: TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        transition: opacity 0.15s cubic-bezier(0.3, 0, 0.1, 1), transform 0.15s cubic-bezier(0.3, 0, 0.1, 1);
      }
      .mt-tooltip.hidden {
        opacity: 0;
        transform: translateY(3px);
        pointer-events: none;
      }
      .mt-tooltip .title {
        font-weight: 500;
        color: var(--main-text-color);
        font-size: 13px;
      }
      .mt-tooltip .description {
        color: var(--secondary-text-color);
        font-size: 12.5px;
      }

      /* 发推按钮强制蓝色背景 + 白色图标 */
      [data-testid="SideNav_NewTweet_Button"] {
        background-color: #1d9bf0 !important;
        color: #fff !important;
      }
      [data-testid="SideNav_NewTweet_Button"] svg {
        fill: #fff !important;
      }

      /* 固定到侧栏的 Lists 项 */
      #mt-sidebar-lists {
        display: flex;
        align-items: center;
        margin: 4px 0;
        padding: 12px;
        border-radius: 9999px;
        color: var(--main-text-color);
        transition: background-color 0.2s;
      }
      #mt-sidebar-lists:hover {
        background-color: rgba(var(--glyphs-color-rgb, 29, 155, 240), 0.1);
      }
      #mt-sidebar-lists > div[dir] {
        display: flex;
        align-items: center;
      }
      #mt-sidebar-lists svg {
        width: 26.25px;
        height: 26.25px;
        fill: currentColor;
      }
      #mt-sidebar-lists span {
        font-size: 20px;
        font-weight: 400;
        line-height: 24px;
        margin-left: 20px;
        color: var(--main-text-color);
      }
      @media only screen and (max-width: 1264px) {
        #mt-sidebar-lists > div[dir] > div:last-child {
          display: none !important;
        }
      }
    `;
    GM_addStyle(css);
  }

  // 省略 createSettingsPanel、createFloatingButton 等 UI 函数，与原版完全相同
  function createSettingsPanel() {
    const existingPanel = document.getElementById('mt-settings-panel');
    if (existingPanel) {
      existingPanel.remove();
      document.getElementById('mt-settings-overlay')?.remove();
      return;
    }

    const isDark = document.documentElement.style.backgroundColor === 'rgb(0, 0, 0)'
      || document.querySelector('meta[name="theme-color"]')?.content === '#000000';

    const colors = isDark ? {
      bg: '#000000',
      border: '#2f3336',
      text: '#e7e9ea',
      secondary: '#71767b',
      inputBg: '#16181c',
      shadow: 'rgba(255,255,255,0.08)',
    } : {
      bg: '#ffffff',
      border: '#cfd9de',
      text: '#0f1419',
      secondary: '#536471',
      inputBg: '#f7f9f9',
      shadow: 'rgba(0,0,0,0.08)',
    };

    const styleId = 'mt-settings-panel-styles';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = `
        #mt-settings-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(91,112,131,0.4);z-index:9999;}
        #mt-settings-panel{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:92%;max-width:520px;max-height:84vh;background:${colors.bg};border:1px solid ${colors.border};border-radius:16px;z-index:10000;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 0 0 1px ${colors.shadow},0 8px 40px ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.12)'};}
        #mt-settings-panel *{box-sizing:border-box;}
        #mt-settings-header{display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid ${colors.border};background:${colors.bg};flex-shrink:0;}
        #mt-settings-header h2{margin:0;font-size:17px;font-weight:700;color:${colors.text};}
        #mt-settings-close{background:none;border:none;cursor:pointer;padding:6px 10px;color:${colors.secondary};font-size:22px;line-height:1;border-radius:999px;transition:background 0.2s;}
        #mt-settings-close:hover{background:${isDark ? 'rgba(239,243,244,0.1)' : 'rgba(15,20,25,0.08)'};color:${colors.text};}
        #mt-settings-content{overflow-y:auto;flex:1;padding:12px 20px 20px;}
        .mt-settings-section{margin-bottom:20px;}
        .mt-settings-section h3{font-size:13px;font-weight:700;color:${colors.secondary};margin:0 0 10px 0;text-transform:uppercase;letter-spacing:0.3px;}
        .mt-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid ${colors.border};}
        .mt-row:last-child{border-bottom:none;}
        .mt-label{font-size:14px;color:${colors.text};line-height:1.4;flex:1;padding-right:12px;}
        .mt-toggle{position:relative;width:44px;height:26px;background:${isDark ? '#536471' : '#cfd9de'};border-radius:13px;cursor:pointer;transition:background 0.2s;flex-shrink:0;}
        .mt-toggle.on,.mt-toggle.hide{background:#1d9bf0;}
        .mt-toggle::after{content:'';position:absolute;top:3px;left:3px;width:20px;height:20px;background:#fff;border-radius:50%;transition:transform 0.2s;box-shadow:0 1px 2px rgba(0,0,0,0.15);}
        .mt-toggle.on::after,.mt-toggle.hide::after{transform:translateX(18px);}
        .mt-select{padding:6px 28px 6px 12px;border-radius:6px;border:1px solid ${colors.border};background:${colors.inputBg};color:${colors.text};font-size:13px;cursor:pointer;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 12 12%27%3E%3Cpath fill=%27${encodeURIComponent(colors.secondary)}%27 d=%27M6 8.825L1.175 4 2.238 2.938 6 6.7 9.763 2.937 10.825 4z%27/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center;flex-shrink:0;}
        .mt-select:focus{outline:none;border-color:#1d9bf0;}
        .mt-custom-css{width:100%;min-height:100px;padding:12px;border-radius:8px;border:1px solid ${colors.border};background:${colors.inputBg};color:${colors.text};font-family:monospace;font-size:12px;line-height:1.5;resize:vertical;}
        .mt-custom-css:focus{outline:none;border-color:#1d9bf0;}
        .mt-custom-css::placeholder{color:${colors.secondary};}
      `.replace(/\s+/g, ' ').trim();
      document.head.appendChild(styleEl);
    }

    const overlay = document.createElement('div');
    overlay.id = 'mt-settings-overlay';

    const panel = document.createElement('div');
    panel.id = 'mt-settings-panel';

    panel.innerHTML = `
      <div id="mt-settings-header">
        <h2>Minimal Twitter Settings</h2>
        <button id="mt-settings-close">\u00d7</button>
      </div>
      <div id="mt-settings-content">
        <div class="mt-settings-section">
          <h3 data-i18n="section.general">General</h3>
          <div class="mt-row">
            <span class="mt-label">Language</span>
            <select class="mt-select" data-setting="panelLanguage">
              <option value="auto">Auto</option>
              <option value="en">English</option>
              <option value="zh-CN">简体中文</option>
              <option value="zh-TW">繁體中文</option>
            </select>
          </div>
          <div class="mt-row">
            <span class="mt-label">Settings Button</span>
            <div class="mt-toggle" data-setting="showFloatingButton"></div>
          </div>
        </div>
        <div class="mt-settings-section">
          <h3 data-i18n="section.timeline">Timeline</h3>
          <div class="mt-row">
            <span class="mt-label">Timeline Width</span>
            <select class="mt-select" data-setting="timelineWidth">
              <option value="600">600px</option>
              <option value="650">650px</option>
              <option value="700">700px</option>
              <option value="750">750px</option>
              <option value="800">800px</option>
              <option value="900">900px</option>
              <option value="1000">1000px</option>
              <option value="1100">1100px</option>
              <option value="1200">1200px</option>
            </select>
          </div>
          <div class="mt-row">
            <span class="mt-label">Remove Timeline Borders</span>
            <div class="mt-toggle" data-setting="timelineBorders"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Remove Tweet Borders</span>
            <div class="mt-toggle" data-setting="tweetBorders"></div>
          </div>
          <div class="mt-row">
             <span class="mt-label">Sticky Header</span>
             <div class="mt-toggle" data-setting="stickyHeader"></div>
           </div>
          <div class="mt-row">
            <span class="mt-label">Default to Following Timeline</span>
            <div class="mt-toggle" data-setting="followingTimeline"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Remove Timeline Tabs</span>
            <div class="mt-toggle" data-setting="removeTimelineTabs"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Writer Mode</span>
            <div class="mt-toggle" data-setting="writerMode"></div>
          </div>
        </div>
        <div class="mt-settings-section">
          <h3 data-i18n="section.content">Content</h3>
          <div class="mt-row">
            <span class="mt-label">Remove Promoted Posts</span>
            <div class="mt-toggle" data-setting="removePromotedPosts"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Remove Topics to Follow</span>
            <div class="mt-toggle" data-setting="removeTopicsToFollow"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Hide View Count</span>
             <div class="mt-toggle" data-setting="hideViewCount"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Hide Follow Count</span>
            <div class="mt-toggle" data-setting="followCount"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Hide Reply Count</span>
            <div class="mt-toggle" data-setting="replyCount"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Hide Retweet Count</span>
            <div class="mt-toggle" data-setting="retweetCount"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Hide Like Count</span>
            <div class="mt-toggle" data-setting="likeCount"></div>
          </div>
        </div>
        <div class="mt-settings-section">
          <h3 data-i18n="section.navigation">Navigation</h3>
          <div class="mt-row">
            <span class="mt-label">Navigation Labels</span>
            <select class="mt-select" data-setting="navigationButtonsLabels">
              <option value="never">Never</option>
              <option value="always">Always</option>
              <option value="hover">On Hover</option>
            </select>
          </div>
          <div class="mt-row">
            <span class="mt-label">Home</span>
            <div class="mt-toggle" data-setting="homeButton"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Explore</span>
            <div class="mt-toggle" data-setting="exploreButton"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Notifications</span>
            <div class="mt-toggle" data-setting="notificationsButton"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Messages</span>
            <div class="mt-toggle" data-setting="messagesButton"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Grok</span>
            <div class="mt-toggle" data-setting="grokButton"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Premium</span>
            <div class="mt-toggle" data-setting="xPremiumButton"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Verified Orgs</span>
            <div class="mt-toggle" data-setting="verifiedOrgsButton"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Communities</span>
            <div class="mt-toggle" data-setting="communitiesButton"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Profile</span>
            <div class="mt-toggle" data-setting="profileButton"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Bookmarks</span>
            <div class="mt-toggle" data-setting="bookmarksButton"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Lists</span>
            <div class="mt-toggle" data-setting="listsButton"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Jobs</span>
            <div class="mt-toggle" data-setting="jobsButton"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Topics</span>
            <div class="mt-toggle" data-setting="topicsButton"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Articles</span>
            <div class="mt-toggle" data-setting="articles"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Creator Center</span>
            <div class="mt-toggle" data-setting="creatorCenterButton"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Center Navigation</span>
            <div class="mt-toggle" data-setting="navigationCenter"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Unread Badge</span>
            <div class="mt-toggle" data-setting="unreadCountBadge"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Account Switcher</span>
            <div class="mt-toggle" data-setting="accountSwitcherButton"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Hide Grok Drawer</span>
            <div class="mt-toggle" data-setting="hideGrokDrawer"></div>
          </div>
        </div>
        <div class="mt-settings-section">
          <h3 data-i18n="section.interface">Interface</h3>
          <div class="mt-row">
            <span class="mt-label">Search Bar</span>
             <div class="mt-toggle" data-setting="searchBar"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Transparent Search Bar</span>
            <div class="mt-toggle" data-setting="transparentSearch"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Tweet Button</span>
             <div class="mt-toggle" data-setting="tweetButton"></div>
          </div>
          <div class="mt-row">
            <span class="mt-label">Use Inter Font</span>
            <div class="mt-toggle" data-setting="interFont"></div>
          </div>
        </div>
        <div class="mt-settings-section">
          <h3 data-i18n="section.customCss">Custom CSS</h3>
          <textarea class="mt-custom-css" data-setting="customCss" placeholder="Paste custom CSS here..."></textarea>
        </div>
      </div>
    `;

    // 按 panelLanguage 填充面板文案（模板内英文文案作为回退）
    const applyPanelI18n = () => {
      panel.querySelector('#mt-settings-header h2').textContent = t('panel.title');
      panel.querySelectorAll('h3[data-i18n]').forEach(h => { h.textContent = t(h.dataset.i18n); });
      panel.querySelectorAll('.mt-label[data-i18n]').forEach(l => { l.textContent = t(l.dataset.i18n); });
      panel.querySelectorAll('button[data-i18n]').forEach(b => { b.textContent = t(b.dataset.i18n); });
      panel.querySelectorAll('.mt-row').forEach(row => {
        const control = row.querySelector('[data-setting]');
        const label = row.querySelector('.mt-label');
        if (control && label) label.textContent = t('row.' + control.dataset.setting);
      });
      const labelsSelect = panel.querySelector('select[data-setting="navigationButtonsLabels"]');
      if (labelsSelect) {
        const optionKeys = ['never', 'always', 'hover'];
        labelsSelect.querySelectorAll('option').forEach((opt, i) => {
          opt.textContent = t('option.' + optionKeys[i]);
        });
      }
      const cssArea = panel.querySelector('.mt-custom-css');
      if (cssArea) cssArea.placeholder = t('placeholder.customCss');
    };
    applyPanelI18n();

    // 导航排序编辑器：上下移即时保存并生效（setStorage → applyAllFeatures → applyNavOrder）
    const toggleNext = (setting) => {
      const cur = getStorage(setting);
      if (cur === 'on' || cur === 'hide') return 'off';
      if (cur === 'off' || cur === 'show') return 'on';
      return 'on';
    };

    const toggleActiveClass = (setting) => {
      const val = getStorage(setting);
      return val === 'on' || val === 'hide';
    };

    panel.querySelectorAll('.mt-toggle').forEach(toggle => {
      const setting = toggle.dataset.setting;

      if (toggleActiveClass(setting)) {
        toggle.classList.add(getStorage(setting));
      }

      toggle.addEventListener('click', () => {
        const current = getStorage(setting);
        let next;

        if (setting === 'followCount' || setting === 'replyCount' || setting === 'retweetCount' || setting === 'likeCount') {
          next = current === 'hide' ? 'show' : 'hide';
        } else if (setting === 'stickyHeader') {
          next = current === 'on' ? 'off' : 'on';
        } else {
          next = toggleNext(setting);
        }

        setStorage(setting, next);

        toggle.className = 'mt-toggle';
        if (next === 'on' || next === 'hide') {
          toggle.classList.add(next);
        }
      });
    });

    panel.querySelectorAll('.mt-select').forEach(select => {
      const setting = select.dataset.setting;
      select.value = String(getStorage(setting));
      select.addEventListener('change', () => {
        setStorage(setting, select.value);
        if (setting === 'panelLanguage') {
          // 切换语言后重建面板以刷新全部文案
          panel.remove();
          overlay.remove();
          createSettingsPanel();
        }
      });
    });

    const customCssArea = panel.querySelector('.mt-custom-css');
    customCssArea.value = getStorage('customCss') || '';
    customCssArea.addEventListener('input', debounce(() => {
      setStorage('customCss', customCssArea.value);
    }, 400));

    const closePanel = () => {
      panel.remove();
      overlay.remove();
    };

    overlay.addEventListener('click', closePanel);
    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    panel.querySelector('#mt-settings-close').addEventListener('click', closePanel);
  }

  function createFloatingButton() {
    // 用户可配置：关闭时不创建并移除已有按钮（仍可通过油猴菜单打开设置）
    if (settings.showFloatingButton === 'off') {
      document.getElementById('mt-floating-button')?.remove();
      return;
    }
    if (document.getElementById('mt-floating-button')) return;
    const button = document.createElement('div');
    button.id = 'mt-floating-button';
    button.innerHTML = `
      <style>
        #mt-floating-button {
          position: fixed;
          bottom: 80px;
          right: 16px;
          width: 48px;
          height: 48px;
          background: #1d9bf0;
          border-radius: 50%;
          cursor: pointer;
          z-index: 9998;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        #mt-floating-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        #mt-floating-button svg {
          width: 24px;
          height: 24px;
          fill: white;
        }
      </style>
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3ZM8 12C8 10.3431 9.34315 9 11 9H13C14.6569 9 16 10.3431 16 12C16 13.6569 14.6569 15 13 15H11C9.34315 15 8 13.6569 8 12ZM18.291 17.2907C17.0873 16.6758 14.8694 16 12 16C9.13056 16 6.91272 16.6758 5.70897 17.2907C5.15563 17.5412 5 17.9678 5 18.2061C5 19.3023 8.82484 20 12 20C15.1752 20 19 19.3023 19 18.2061C19 17.9678 18.8444 17.5412 18.291 17.2907Z"/>
      </svg>
    `;
    button.title = 'Minimal Twitter Settings';
    button.addEventListener('click', createSettingsPanel);
    document.body.appendChild(button);
  }

  function applyAllFeatures() {
    if (settings.extensionStatus === 'off') {
      Object.keys(styleElements).forEach(id => removeStyles(id));
      return;
    }
    applyStaticFeatures();
  }

  function init() {
    loadAllSettings();

    if (settings.extensionStatus === 'off') return;

    injectMainStyles();
    applyGrokScopedLayouts();
    applyAllFeatures();
    createFloatingButton();
    extractColorsAsRootVars();

    setTimeout(extractColorsAsRootVars, 3000);

    observer = new MutationObserver((mutations) => {
      if (!mutations.length || isMutationSkippable(mutations)) return;
      runDynamicFeatures();
    });

    // 缩小观察范围到 body，减少无关的 DOM 变动回调（仍监听整个 body，因为需要捕捉右侧栏等）
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    document.addEventListener('DOMContentLoaded', () => {
      runDynamicFeatures();
    });

    window.addEventListener('resize', debounce(() => {
      runDynamicFeatures();
    }, 100));

    GM_registerMenuCommand(t('panel.title'), createSettingsPanel);

    isInitialized = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // SPA 路由感知：X 点击左侧导航（如私信/chat 按钮）走 pushState/replaceState，
  // 不会触发 popstate；而 MutationObserver 又会跳过 nav 内部的变动（isMutationSkippable），
  // 导致路由相关样式（私信页布局）与导航栏修复在点击导航后不生效。包装 history API 兜底。
  let lastRoutePath = window.location.pathname;
  function handleRouteChange() {
    if (!isInitialized || settings.extensionStatus === 'off') return;
    if (window.location.pathname === lastRoutePath) return;
    lastRoutePath = window.location.pathname;
    changeNavigationButtonsLabels(settings.navigationButtonsLabels); // 私信页专属布局/标签样式
    runDynamicFeatures();
    // X 渲染新页面有延迟，补两次兜底（各函数均幂等）
    setTimeout(runDynamicFeatures, 400);
    setTimeout(runDynamicFeatures, 1200);
  }
  ['pushState', 'replaceState'].forEach((type) => {
    const orig = history[type];
    if (typeof orig !== 'function') return;
    history[type] = function (...args) {
      const ret = orig.apply(this, args);
      handleRouteChange();
      return ret;
    };
  });

  window.addEventListener('popstate', debounce(() => {
    if (isInitialized && settings.extensionStatus !== 'off') {
      lastRoutePath = window.location.pathname; // 同步记录，避免后续同路径 pushState 被误判为未变化
      setTimeout(() => {
        applyAllFeatures();
        runDynamicFeatures();
      }, 500);
    }
  }, 100));

})();
