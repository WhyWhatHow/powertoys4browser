// ==UserScript==
// @name          X 评论机器人屏蔽器
// @name:en       X Comment Bot Blocker
// @namespace     xcbb
// @version       0.14.4
// @description   选取"机器人模板评论"或"不合理用户名(昵称/@handle)",一键扫描当前推文评论区,文本相似/用户名/评论关键词任一命中即自动屏蔽对应账号。内置约炮引流类高频规则模板(一键加载)、高频特征词挖掘、屏蔽记录(误伤可追溯/可导出)、数据全量导出与 Gist 同步,支持相似度阈值、白名单、试运行(仅标记)模式。⚠ 注意: 启发式规则可能误封正常用户,首次使用建议先用"仅标记(试运行)"模式观察命中结果。
// @description:en Pick a bot template comment (or an abusive username), scan the current tweet's replies, and automatically block matching spam/bot accounts — three-way matching: text similarity, username rules, and comment keywords. Built-in high-frequency rule templates, whitelist, dry-run (mark-only) mode, block log with one-click unblock, full data export and Gist sync. ⚠ Heuristic rules may false-positive normal users: try dry-run mode first.
// @author        kikuxdev
// @homepage      https://github.com/WhyWhatHow/powertoys4browser
// @supportURL    https://github.com/WhyWhatHow/powertoys4browser/issues
// @match         https://x.com/*
// @match         https://twitter.com/*
// @icon          https://www.google.com/s2/favicons?domain=x.com
// @grant         GM_setValue
// @grant         GM_getValue
// @grant         GM_setClipboard
// @grant         GM_addElement
// @grant         GM_xmlhttpRequest
// @grant         GM_addStyle
// @grant         GM_registerMenuCommand
// @run-at        document-idle
// @license       MIT
// @updateURL     https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/x-comment-bot-blocker.user.js
// @downloadURL   https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/x-comment-bot-blocker.user.js
// ==/UserScript==

/* ======================= ⚠️ 使用须知 / NOTICE =======================
 *
 * 误封提醒: 本脚本基于文本相似度、用户名/关键词等「启发式规则」自动屏蔽账号,
 *           无法保证 100% 准确 —— 正常用户的昵称或评论也可能被误判而遭到误封!
 *
 *   1. 首次使用请先取消勾选"自动", 用"仅标记(试运行)"模式观察一轮命中结果;
 *   2. 避免添加过于宽泛的关键词(如"免费""资源"), 优先使用高特异性模板;
 *   3. 若发生误封: ⚙设置 → 数据 → 近期屏蔽记录 中可一键解封并加入白名单;
 *   4. 因误封造成的任何影响由使用者自行承担, 请谨慎开启自动屏蔽。
 *
 * ==================================================================== */

(function () {
  'use strict';

  /* ================= 配置与持久化 ================= */
  const DEFAULTS = {
    threshold: 0.75,      // 相似度阈值 0~1, 越高越严格
    autoBlock: true,      // 匹配后自动屏蔽; 关闭 = 仅标记(试运行)
    confirmEach: false,   // 每个屏蔽前弹窗确认
    containMatch: true,   // 允许"包含匹配"(短模板被长评论完整包含)
    commentKeywords: false, // 评论文本含名单关键词即命中(默认关, 防中风险词误伤)
    blockDelayMs: 1200,   // 屏蔽间隔, 防风控
    scrollDelayMs: 1000,  // 滚动/展开间隔
    maxRounds: 80,        // 最大扫描轮数
    idleStopRounds: 3,    // 连续 N 轮无新内容则停止
    whitelist: '',         // 每行一个用户名, 不处理
    panelCollapsed: false, // 面板收起状态记忆(刷新后保持)
    autoSync: true,        // 启动时自动拉取远程数据源(仅内容变化时合并)
    silentBlock: true,     // 静默屏蔽: 隐藏 X 菜单/确认弹层, 扫描不打断阅读
    dockPos: 'center',     // 圆点停靠位置: top | center | bottom
    remoteUrl: 'https://gist.githubusercontent.com/kikuxdev/715fb25206eb0291007144aaa4183288/raw/spam-blocks.json' // 远程数据源(公开 gist 稳定 URL, 不随内容编辑变化; 私有数据源请自行覆盖)
  };
  let settings = Object.assign({}, DEFAULTS, GM_getValue('xcbb_settings', {}));
  // 模板: [{ n: 归一化文本, o: 原文预览 }]
  let templates = GM_getValue('xcbb_templates', []);
  // 不合理用户名名单: [{ d: 昵称/文本, h: @handle }] — 兼容旧版纯字符串条目
  let badnames = (GM_getValue('xcbb_badnames', []) || []).map((e) =>
    typeof e === 'string' ? { d: e, h: null } : e);

  const saveSettings = () => GM_setValue('xcbb_settings', settings);
  const saveTemplates = () => GM_setValue('xcbb_templates', templates);
  const saveBadnames = () => GM_setValue('xcbb_badnames', badnames);
  // 评论关键词(独立于用户名名单, 仅用于评论文本匹配): 字符串数组
  let commentKws = GM_getValue('xcbb_comment_kws', []);
  const saveCommentKws = () => GM_setValue('xcbb_comment_kws', commentKws);
  // 屏蔽记录(误伤追溯/手动解封入口): [{ h: handle, n: 昵称, t: 时间戳, r: 命中原因 }], 按 handle 去重, 上限 300
  let blocklog = GM_getValue('xcbb_blocklog', []);
  const saveBlocklog = () => {
    if (blocklog.length > 300) blocklog = blocklog.slice(-300);
    GM_setValue('xcbb_blocklog', blocklog);
  };
  const logBlock = (h, n, r) => {
    blocklog = blocklog.filter((b) => b.h !== h); // 同一账号只保留最新记录
    blocklog.push({ h, n: n || '', t: Date.now(), r: r || '' });
    saveBlocklog();
    if (currentTab === 'data') renderBlocklog(); // 数据页打开时实时刷新, 避免扫描后列表不更新
  };
  // 已确认垃圾账号语料(用于挖掘高频特征词): [{ d: 昵称, h: handle }]
  let corpus = GM_getValue('xcbb_corpus', []);
  const saveCorpus = () => {
    if (corpus.length > 500) corpus = corpus.slice(-500);
    GM_setValue('xcbb_corpus', corpus);
  };

  /* ================= 通用工具 ================= */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function waitFor(fn, timeoutMs = 3000, intervalMs = 150) {
    return new Promise((resolve) => {
      const start = Date.now();
      const t = setInterval(() => {
        let v = null;
        try { v = fn(); } catch (e) { v = null; }
        if (v) { clearInterval(t); resolve(v); }
        else if (Date.now() - start >= timeoutMs) { clearInterval(t); resolve(null); }
      }, intervalMs);
    });
  }

  let unread = 0; // 日志折叠时的未读条数
  function log(msg) {
    const el = $('#xcbb-log');
    if (!el) return;
    const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
    const div = document.createElement('div');
    div.textContent = line;
    el.appendChild(div);
    while (el.childNodes.length > 300) el.removeChild(el.firstChild);
    el.scrollTop = el.scrollHeight;
    if (el.classList.contains('hidden')) {
      unread++;
      const badge = $('#xcbb-log-badge');
      if (badge) { badge.textContent = unread; badge.classList.remove('hidden'); }
    }
  }

  /* ================= 文本归一化与相似度 ================= */
  // 去掉 URL/@提及/#标签/emoji/标点/零宽字符, 统一小写
  function normalize(text) {
    return String(text)
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/@[\w_]+/g, ' ')
      .replace(/[#＃][\w_]+/g, ' ')
      .replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, '')
      .replace(/[\p{Extended_Pictographic}]/gu, ' ')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // 字符 bigram 集合(对中日韩文与英文都有效)
  function bigramSet(s) {
    const t = s.replace(/\s+/g, '');
    const set = new Set();
    for (let i = 0; i < t.length - 1; i++) set.add(t.slice(i, i + 2));
    return set;
  }

  function jaccard(a, b) {
    if (!a.size || !b.size) return 0;
    let inter = 0;
    for (const x of a) if (b.has(x)) inter++;
    return inter / (a.size + b.size - inter);
  }

  function levenshteinRatio(a, b) {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    if (maxLen > 200) return 0; // 长文本交给 bigram Jaccard
    if (a.length > b.length) [a, b] = [b, a];
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return 1 - prev[b.length] / maxLen;
  }

  // 综合相似度: 取 Jaccard / Levenshtein / 包含匹配 三者最高分
  function similarity(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;
    let score = Math.max(jaccard(bigramSet(a), bigramSet(b)), levenshteinRatio(a, b));
    if (settings.containMatch) {
      const short = a.length <= b.length ? a : b;
      const long = a.length <= b.length ? b : a;
      if (short.length >= 4 && long.includes(short)) {
        score = Math.max(score, short.length / long.length);
      }
    }
    return score;
  }

  /* ================= DOM 解析(X 当前结构) ================= */
  // 返回 { handle: @用户名, name: 昵称(显示名) } — 均来自评论头部 DOM
  function getAuthorInfo(article) {
    const nameDiv = $('div[data-testid="User-Name"]', article);
    const link = nameDiv && $('a[href^="/"][role="link"]', nameDiv);
    let handle = null, name = null;
    if (link) {
      const m = link.getAttribute('href').match(/^\/([^/?#]+)/);
      if (m) handle = m[1];
      name = (link.textContent || '').trim();
    }
    if (!name && nameDiv) {
      name = (nameDiv.textContent || '').replace(/@[\w_]+/g, '').trim();
    }
    if (!handle && nameDiv) {
      const m = nameDiv.textContent.match(/@([\w_]+)/);
      if (m) handle = m[1];
    }
    if (!handle) {
      const anyLink = $('a[href^="/"][role="link"]', article);
      if (anyLink) {
        const m = anyLink.getAttribute('href').match(/^\/([^/?#]+)/);
        if (m) handle = m[1];
      }
    }
    return { handle, name };
  }

  // 取评论全文: 先展开 X 截断的 "Show more" 再读取(超长评论处理)
  async function getTweetTextFull(article) {
    const el = $('[data-testid="tweetText"]', article);
    if (!el) return '';
    if (!el.dataset.xcbbExpanded) {
      el.dataset.xcbbExpanded = '1'; // 每条只展开一次
      const more = el.querySelector('[data-testid="tweet-text-show-more-link"]') ||
        [...el.querySelectorAll('[role="button"]')].find((b) =>
          /^(show more|显示更多)$/i.test((b.textContent || '').trim()));
      if (more) {
        const beforeLen = el.innerText.length;
        more.click();
        await waitFor(() => el.innerText.length !== beforeLen, 800, 80); // 等全文渲染(最多800ms), 避免读到截断文本
      }
    }
    return el.innerText;
  }

  function getTweetText(article) {
    const el = $('[data-testid="tweetText"]', article);
    return el ? el.innerText : '';
  }

  // 评论的唯一 ID(用于跨扫描去重)
  function getTweetId(article) {
    const link = article.querySelector('a[href*="/status/"]');
    if (!link) return null;
    const m = link.getAttribute('href').match(/\/status\/(\d+)/);
    return m ? m[1] : null;
  }

  // 引用推文(嵌套在文章内)不参与扫描
  function isQuote(article) {
    const anc = article.closest('article');
    return !!anc && anc !== article;
  }

  // 当前推文详情页 URL 中的作者, 保护其不被误屏蔽
  function getUrlOwner() {
    const m = location.pathname.match(/^\/([^/]+)\/status\/\d+/);
    return m ? m[1].toLowerCase() : null;
  }

  /* ================= 屏蔽(X UI 自动化) =================
   * 选择器参考 X_impression_hide(2025 年仍有效) + 多重 fallback */
  function findBlockMenuItem() {
    const items = $$('[role="menu"] [role="menuitem"]');
    // 1) 屏蔽图标 path 特征(block 图标 d 以 "M12 3.75c" 开头)
    let hit = items.find((el) => el.querySelector('path[d^="M12 3.75c"]'));
    if (hit) return hit;
    // 2) data-testid
    hit = items.find((el) => el.getAttribute('data-testid') === 'block' ||
      el.querySelector('[data-testid="block"]'));
    if (hit) return hit;
    // 3) 菜单文本(en/zh)
    return items.find((el) => /^(block|屏蔽|封禁)\b/i.test((el.textContent || '').trim()));
  }

  function findUnblockMenuItem() {
    return $$('[role="menu"] [role="menuitem"]').find((el) =>
      /^(unblock|解除屏蔽)\b/i.test((el.textContent || '').trim()));
  }

  function findConfirmButton() {
    // 优先用特定 testid; 回退时取确认弹窗按钮组中的“最后一个”(确认按钮在右侧, 第一个可能是 Cancel)
    const byTestId = $('[data-testid="confirmationSheetConfirm"]');
    if (byTestId) return byTestId;
    const groupBtns = $$('[role="alertdialog"] [role="group"] [role="button"]');
    return groupBtns.length ? groupBtns[groupBtns.length - 1] : null;
  }

  function pressEscape() {
    const root = document.getElementById('react-root') || document.body;
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  }

  // 通过 UI 屏蔽文章作者; 返回 'ok' | 'already' | 'nomenu' | 'fail' | 'unverified'
  async function blockViaUi(article) {
    const silent = settings.silentBlock;
    if (silent) document.documentElement.classList.add('xcbb-silent'); // 隐藏弹层, 减少阅读干扰
    try {
      const moreBtn =
        $('[aria-haspopup="menu"][role="button"]', article) ||
        $('[data-testid="caret"]', article) ||
        $('[aria-label="More"], [aria-label="更多"]', article);
      if (!moreBtn) return 'nomenu';
      moreBtn.click();
      const menu = await waitFor(() => $('[role="menu"]'), 2500);
      if (!menu) return 'fail';
      if (findUnblockMenuItem()) { pressEscape(); return 'already'; }
      const blockItem = findBlockMenuItem();
      if (!blockItem) { pressEscape(); return 'fail'; }
      blockItem.click();
      const confirmBtn = await waitFor(findConfirmButton, 2500);
      if (!confirmBtn) { pressEscape(); return 'fail'; }
      confirmBtn.click();
      // 验证(分两级): ①推文被移除=确定成功; ②确认弹窗已关闭=请求已受理
      // (X 有时延迟移除推文需刷新才消失, 弹窗关闭即可视为成功; 弹窗仍在=未生效)
      const removed = await waitFor(() => !article.isConnected, 1500);
      if (removed) return 'ok';
      await sleep(300);
      if (!document.querySelector('[data-testid="confirmationSheetConfirm"]')) return 'ok';
      return 'unverified';
    } finally {
      if (silent) document.documentElement.classList.remove('xcbb-silent');
    }
  }

  /* ================= 扫描 ================= */
  const seen = new Set();        // 本轮已处理的文章节点(单次扫描内去重)
  const processed = new Set();   // 会话级去重: 已评估过的评论 (handle/tweetId), 跨扫描保留, 刷新页面重置
  const pending = [];            // 待复核: 首轮疑似数据不完整的未命中评论(有界, 扫描结束二次评估)
  let scanUri = null;            // 扫描开始时的 URI, 用于检测 SPA 页面切换
  const blockedHandles = new Set(); // 已屏蔽/已在黑名单的用户
  let whitelist = new Set();
  let urlOwner = null;
  let statScanned = 0, statMatched = 0, statBlocked = 0;
  // 累计统计(跨扫描/跨页面持久化, 与 X 屏蔽列表可对照)
  let totals = Object.assign({ scanned: 0, matched: 0, blocked: 0, lastSync: '', lastHash: '' }, GM_getValue('xcbb_stats', {}));
  const saveTotals = () => GM_setValue('xcbb_stats', totals);
  let running = false;
  let stopFlag = false;

  function getContainers() {
    let tls = $$('[aria-label^="Timeline:"]');
    if (!tls.length) {
      const pc = $('[data-testid="primaryColumn"]');
      if (pc) tls = [pc];
    }
    return tls;
  }

  // 点击“Show more replies / Show more / 显示更多回复…”加载更多评论
  function clickLoadMore(container) {
    for (const btn of $$('[role="button"]', container)) {
      const t = (btn.textContent || '').trim();
      if (/^(show more replies|show more|显示更多回复|显示更多|查看更多回复|查看更多)$/i.test(t)) {
        btn.click();
      }
    }
  }

  function parseWhitelist() {
    return new Set(
      String(settings.whitelist || '')
        .split(/[\n,，\s]+/)
        .map((s) => s.replace(/^@/, '').toLowerCase())
        .filter(Boolean)
    );
  }

  // 用户名名单匹配: 普通条目 = 包含匹配(不区分大小写); /正则/ 形式 = 正则匹配(原样大小写 + 小写各测一次)
  function nameMatches(field, entry) {
    const f = String(field || '');
    const fl = f.toLowerCase();
    if (entry.length > 2 && entry[0] === '/') {
      const last = entry.lastIndexOf('/');
      if (last > 0) {
        try {
          const re = new RegExp(entry.slice(1, last), entry.slice(last + 1));
          return re.test(f) || re.test(fl);
        } catch (e) { return false; }
      }
    }
    return fl.includes(entry.toLowerCase());
  }

  /* ================= 语料与高频特征词挖掘 ================= */
  const FREQ_STOP = new Set(['我们', '你们', '他们', '这个', '那个', '什么', '怎么', '自己',
    '可以', '不是', '就是', '还有', '一个', '真的', '现在', '今天', '没有', '大家']);

  function recordCorpus(name, handle) {
    if (!handle) return;
    const h = handle.toLowerCase();
    if (corpus.some((c) => c.h === h)) return;
    corpus.push({ d: name || '', h });
    saveCorpus();
    renderFreq();
  }

  // 单账号候选特征: 英文词(≥3字符) / 数字串(≥2位) / 中日韩字符 bigram
  function extractTokens(name, handle) {
    const tokens = new Set();
    const text = `${name || ''} ${handle || ''}`.toLowerCase();
    for (const m of text.matchAll(/[a-z]{3,}|\d{2,}/g)) tokens.add(m[0]);
    const cjk = text.replace(/[^\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g, '');
    for (let i = 0; i < cjk.length - 1; i++) {
      const b = cjk.slice(i, i + 2);
      if (!FREQ_STOP.has(b)) tokens.add(b);
    }
    return tokens;
  }

  // 统计出现在 ≥2 个账号中的特征, 按频率降序(由调用方决定取多少条)
  function computeFreq() {
    const freq = new Map();
    for (const c of corpus) {
      const seen = new Set();
      for (const t of extractTokens(c.d, c.h)) {
        if (seen.has(t)) continue;
        seen.add(t);
        freq.set(t, (freq.get(t) || 0) + 1);
      }
    }
    return [...freq.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length);
  }

  /* ================= 内置模板规则 =================
   * 依据已确认的垃圾账号归纳(约炮引流类 + 常见 CN 引流/诈骗类)
   * 低风险: 专有词, 基本只有垃圾号使用
   * 中风险: 广告/引流号也可能使用, 建议配合试运行模式 */
  const BUILTIN_LOW = [
    // 约炮/色情引流
    '约炮', '约p', '约pao', '约萢', '约泡', '约啪', '炮友', '炮you', '啪友',
    '找炮', '找啪', '约妹', '约美', '约爱', '约艾', '一夜情', '约爽', '秒约', '速约',
    '破处', '开处', '处子', '几把', '操逼', '操b', '艹b', '草逼', '草b', '操比', '操屄',
    '母狗', '女奴', '嫩妹', '裸聊', '露聊', '脱衣', '脱光', '处女', '选妃', '性奴', '女仆',
    '舔b', '公狗', '学生妹',
    '性伴侣', '性伙伴', '性友', '援交', '招嫖', '打炮', '骚逼', '骚b', '骚货',
    '免费操', '免费约', '免费炮', '找主人', '线下无偿', '精准配对',
    // 赌博/刷单诈骗
    '赌博', '网赌', '刷单', '送彩金'
  ];
  const BUILTIN_MED = [
    // 约炮引流变体(有歧义)
    '主页', '同城', '附近', '快速通道', '萝莉', '洛丽', '嫩模', '上门服务', '约一下',
    '约见', '进群', '资源', '御姐', '牵线',
    // 微信/引流
    '加微信', '加薇', '薇信', '扫码', '私我', '微商', '免费领', '领红包',
    // 刷单/博彩类
    '兼职', '日赚', '躺赚', '博彩',
    // handle 正则(X DOM 一律小写, 带 i 标志; 5位以上数字, 减少误伤)
    '/^(?!.*(?:19|20)\\d{2}$)[a-z]{6,}\\d{5,}$/i',
    '/^(?!.*(?:19|20)\\d{2}$)[a-z]+_[a-z]+\\d{5,}$/i'
  ];
  // 内置低风险词中不参与评论匹配的常见词(日常/反诈讨论也会出现; 仍可用于用户名匹配)
  const COMMENT_KW_EXCLUDE = new Set(['一夜情', '处女', '处子', '脱衣', '女仆', '选妃', '赌博', '网赌', '刷单']);
  // 评论关键词匹配源: 自定义列表 + 内置低风险词(排除常见词); 与用户名名单完全独立
  function commentKwList() {
    return [...commentKws, ...BUILTIN_LOW.filter((w) => !COMMENT_KW_EXCLUDE.has(w))];
  }

  function loadBuiltin() {
    let addedLow = 0, addedMed = 0, skipped = 0;
    const addOne = (d, med) => {
      if (badnames.some((en) => en.d.toLowerCase() === d.toLowerCase())) { skipped++; return; }
      badnames.push({ d, h: null });
      if (med) addedMed++; else addedLow++;
    };
    BUILTIN_LOW.forEach((d) => addOne(d, false));
    BUILTIN_MED.forEach((d) => addOne(d, true));
    saveBadnames();
    renderBadnames();
    log(`✔ 内置模板: 新增 ${addedLow + addedMed} 条 (低风险 ${addedLow} / 中风险 ${addedMed}), 跳过已存在 ${skipped} 条`);
    if (!addedLow && !addedMed) log('ℹ 内置规则都已存在于名单');
  }

  async function processArticle(article, force) {
    if (isQuote(article)) return;
    const author = getAuthorInfo(article);
    const handle = author.handle;
    if (!handle) return;
    const h = handle.toLowerCase();
    // 会话级去重: 每条评论默认只评估一次; force(二次复核)时绕过
    const tweetId = getTweetId(article);
    const dedupeKey = `${h}/${tweetId || ''}`;
    if (tweetId && processed.has(dedupeKey) && !force) return;
    if (tweetId) processed.add(dedupeKey);

    if (whitelist.has(h) || h === urlOwner) return;

    // 用户名维度独立判定: 不受评论长度与模板限制
    const nameHit = badnames.some((en) =>
      nameMatches(author.handle, en.d) || (author.name && nameMatches(author.name, en.d)));

    // 文本维度: 评论过短或未配模板时不参与
    const text = await getTweetTextFull(article);
    const norm = normalize(text);
    let textHit = false, best = 0, bestIdx = -1;
    if (norm.length >= 4 && templates.length) {
      templates.forEach((t, i) => {
        const s = similarity(norm, t.n);
        if (s > best) { best = s; bestIdx = i; }
      });
      textHit = bestIdx >= 0 && best >= settings.threshold;
    }

    // 评论关键词维度: 评论文本含关键词即命中(可选, 默认关)
    // 仅使用: 自定义评论关键词 + 内置低风险词(排除日常常见词)。
    // 用户名名单里的普通词(如 高中/免费)不参与评论匹配, 防误伤正常讨论。
    let kwHit = null;
    if (settings.commentKeywords && norm.length >= 2) {
      for (const kw of commentKwList()) {
        if (nameMatches(norm, kw)) { kwHit = kw; break; }
      }
    }
    if (!textHit && !nameHit && !kwHit) {
      // 疑似数据不完整(缺昵称/文本过短)的未命中评论 → 留待扫描结束二次复核, 解决"刷新后才能识别"
      if (tweetId && !force && pending.length < 500 && (!author.name || norm.length < 40)) {
        pending.push({ article, h });
      }
      return;
    }

    const hitInfo = [
      textHit ? `相似度 ${best.toFixed(2)} 模板#${bestIdx + 1}` : null,
      nameHit ? `用户名名单命中` : null,
      kwHit ? `评论含关键词: ${kwHit}` : null
    ].filter(Boolean).join(' | ');

    statMatched++;
    const preview = text.length > 50 ? text.slice(0, 50) + '…' : text;
    const who = author.name
      ? `${author.name.length > 24 ? author.name.slice(0, 24) + '…' : author.name} (@${handle})`
      : `@${handle}`;

    if (settings.autoBlock && !blockedHandles.has(h)) {
      if (settings.confirmEach &&
        !confirm(`屏蔽 ${who}?\n评论: ${preview}\n命中: ${hitInfo}`)) {
        log(`⏭ 跳过 ${who}(确认取消)`);
        return;
      }
      const r = await blockViaUi(article);
      if (r === 'ok') {
        blockedHandles.add(h);
        statBlocked++;
        recordCorpus(author.name, handle); // 实际屏蔽的账号计入语料
        logBlock(h, author.name, hitInfo); // 写入屏蔽记录(数据页可追溯/手动解封)
        log(`⛔ 已屏蔽 ${who} | ${hitInfo} | "${preview}"`);
      } else if (r === 'already') {
        blockedHandles.add(h);
        log(`ℹ ${who} 已在黑名单, 跳过`);
      } else {
        log(`⚠ 屏蔽未确认 ${who} (${r === 'unverified' ? '推文未移除, 可能被风控或未生效' : r})`);
      }
      await sleep(settings.blockDelayMs); // 屏蔽间隔, 防风控
    } else {
      highlight(article);
      log(`🔍 命中: ${who} | ${hitInfo} | "${preview}"`);
    }
  }

  function highlight(article) {
    article.classList.add('xcbb-flagged');
  }

  async function runScan() {
    if (running) return;
    if (!templates.length && !badnames.length) {
      log('⚠ 请先添加至少一条模板评论或用户名');
      return;
    }
    running = true;
    stopFlag = false;
    statScanned = statMatched = statBlocked = 0;
    seen.clear();
    blockedHandles.clear();
    urlOwner = getUrlOwner();
    whitelist = parseWhitelist();
    // 会话去重记录设上限, 防止超长会话无限增长(超过3万条重置)
    if (processed.size > 30000) {
      processed.clear();
      log('ℹ 会话去重记录超上限已重置');
    }
    scanUri = location.href; // 记录扫描归属页面
    panel.classList.add('xcbb-scanning'); // 圆点进入扫描进度态
    panel.style.setProperty('--xcbb-progress', '0%');
    updateUI();
    log(`▶ 开始扫描 | 阈值 ${settings.threshold.toFixed(2)} | ${settings.autoBlock ? '自动屏蔽' : '仅标记(试运行)'} | 模板 ${templates.length} 条 / 用户名 ${badnames.length} 条${settings.commentKeywords ? ` | 评论关键词 ${commentKwList().length} 条(内置+自定义)` : ''}${processed.size ? ` | 已评估 ${processed.size} 条, 本次仅处理新增(刷新页面可重置)` : ''}`);
    notify('⏳ 扫描进行中', '正在扫描评论区, 请稍候…', 'info', 3000); // 开始即弹进行中通知(~3s)

    try {
    let idle = 0, lastHeight = document.body.scrollHeight;
    for (let round = 0; round < settings.maxRounds && running && !stopFlag; round++) {
      if (scanUri !== location.href) { // SPA 页面切换 → 立即停止, 不碰新页面的评论
        log('⏹ 检测到页面切换, 扫描已停止(只处理当前页面)');
        break;
      }
      const before = processed.size; // 本轮新增的唯一评论数(虚拟滚动重建的旧节点不会重复计入)
      for (const c of getContainers()) {
        clickLoadMore(c);
        for (const article of $$('article[data-testid="tweet"]', c)) {
          if (seen.has(article)) continue;
          seen.add(article);
          statScanned++;
          await processArticle(article);
          if (stopFlag || scanUri !== location.href) break;
        }
        if (stopFlag) break;
      }
      // 滚动到底部触发懒加载
      const last = $$('article[data-testid="tweet"]').pop();
      if (last) last.scrollIntoView({ block: 'end' });
      else window.scrollBy(0, window.innerHeight * 0.8);
      await sleep(settings.scrollDelayMs);
      if (scanUri !== location.href) {
        log('⏹ 检测到页面切换, 扫描已停止(只处理当前页面)');
        break;
      }
      const roundNew = processed.size - before;
      const pageGrew = document.body.scrollHeight !== lastHeight;
      lastHeight = document.body.scrollHeight;
      // 页面仍在变高(懒加载/展开进行中)不累计闲置; 页面不再变化且无新增才算闲置 → 修复底部自动加载被误判停止
      if (roundNew === 0 && !pageGrew) idle++; else idle = 0;
      updateUI();
      panel.style.setProperty('--xcbb-progress', Math.round(((round + 1) / settings.maxRounds) * 100) + '%');
      if (idle >= settings.idleStopRounds) {
        log('⏹ 连续多轮无新评论, 自动停止');
        break;
      }
    }
    // 二次复核: 首轮疑似数据不完整的未命中评论, 用最新 DOM 数据重新评估(等价于刷新后的重扫)
    if (!stopFlag && pending.length) {
      const n = pending.length;
      const before = statMatched;
      for (const p of pending) await processArticle(p.article, true);
      pending.length = 0;
      const newHits = statMatched - before;
      if (newHits > 0) log(`🔁 二次复核 ${n} 条, 新命中 ${newHits} 条`);
      updateUI();
    }
    } catch (e) {
      log(`⚠ 扫描异常已兜底: ${(e && e.message) || e}`);
      console.error('[xcbb] 扫描异常', e);
    } finally {
      // 无论正常/异常/停止, 都保证状态与资源清理: 不会残留 running/进度态/节点引用
      running = false;
      seen.clear(); // 释放本轮持有的文章节点引用
      totals.scanned += statScanned;
      totals.matched += statMatched;
      totals.blocked += statBlocked;
      saveTotals();
      panel.classList.remove('xcbb-scanning');
      panel.style.removeProperty('--xcbb-progress');
      updateUI();
      log(`✔ 扫描结束: 评论 ${statScanned} | 相似 ${statMatched} | 屏蔽 ${statBlocked}`);
      showScanResult();
    }
  }

  /* ================= 面板 UI ================= */
  GM_addStyle(`
    /* 浅色纸感护眼主题: 米白纸底 + 低饱和绿主色 + 柔和红/琥珀; 颜色统一走 CSS 变量, 调色只改此处 */
    :root{
      --xcbb-bg0:#f7f5ef; --xcbb-bg1:#efece3;          /* 面板底(米白纸感) */
      --xcbb-card:#ece9df; --xcbb-card-hover:#e2ded2;  /* 卡片/条目 */
      --xcbb-input:#fbfaf5; --xcbb-input-border:#d8d3c6; /* 输入框/日志底 */
      --xcbb-border:#ddd8cc; --xcbb-border-strong:#cfc9ba; --xcbb-border-hover:#b8b2a2;
      --xcbb-text:#3a3f3a; --xcbb-text-strong:#262b26;  /* 主文字 */
      --xcbb-dim:#6f766d; --xcbb-faint:#979e94; --xcbb-placeholder:#8d9489;
      --xcbb-accent:#4e8a6d; --xcbb-accent-hover:#43785d; /* 主操作色(低饱和绿) */
      --xcbb-danger:#b85252; --xcbb-danger-deep:#9c4343;  /* 危险/封禁 */
      --xcbb-warn:#a3741f;                               /* 警告/疑似 */
      --xcbb-ok-bg:#e4efe6; --xcbb-ok-border:#b8d5c0; --xcbb-ok-text:#2f6b44;
      --xcbb-info-bg:#e7eef4; --xcbb-info-border:#bccddb; --xcbb-info-text:#33608a;
      --xcbb-overlay:rgba(28,33,28,.45);
      --xcbb-shadow:0 8px 30px rgba(90,86,70,.28);
      --xcbb-scrollbar:#d8d3c6; --xcbb-scrollbar-hover:#c2bba8;
    }
    #xcbb-panel{position:fixed;top:12px;right:12px;z-index:999999;width:360px;
      background:linear-gradient(180deg,var(--xcbb-bg0),var(--xcbb-bg1));color:var(--xcbb-text);border:1px solid var(--xcbb-border);border-radius:14px;
      font:12.5px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;
      box-shadow:var(--xcbb-shadow);
      transition:width .25s ease,height .25s ease,border-radius .25s ease;}
    #xcbb-header{display:flex;align-items:center;gap:6px;padding:6px 10px;cursor:move;
      user-select:none;border-bottom:1px solid var(--xcbb-border);font-weight:600;}
    #xcbb-body{padding:8px 10px;max-height:70vh;overflow:auto;}
    #xcbb-panel button{background:var(--xcbb-accent);color:#fff;border:none;border-radius:8px;
      padding:3px 10px;font-size:11.5px;cursor:pointer;line-height:1.6;
      transition:filter .15s ease,background .15s ease;}
    #xcbb-panel button:hover{filter:brightness(.94);} /* 浅色主题悬停加深(白字对比不降反升) */
    #xcbb-panel button:disabled{opacity:.4;cursor:not-allowed;}
    /* 类禁用(保留点击事件→可提示不可用原因): 扫描中 ▶ / 待机时 ⏹ */
    #xcbb-panel button.xcbb-disabled{opacity:.4;cursor:not-allowed;}
    #xcbb-panel button.xcbb-disabled:hover{filter:none;}
    #xcbb-panel button.ghost{background:transparent;border:1px solid var(--xcbb-border-strong);color:var(--xcbb-dim);}
    #xcbb-panel button.ghost:hover{background:var(--xcbb-card-hover);border-color:var(--xcbb-border-hover);filter:none;}
    #xcbb-panel button.danger{background:var(--xcbb-danger);}
    #xcbb-panel button.tiny{padding:0 6px;font-size:10.5px;border-radius:6px;}
    #xcbb-panel input[type=checkbox]{accent-color:var(--xcbb-accent);}
    /* 收起为圆点(停靠屏幕右侧, 位置可在右键菜单中选 上/中/下) */
    #xcbb-panel.xcbb-collapsed{width:44px;height:44px;border-radius:9999px;overflow:hidden;cursor:pointer;right:0;}
    #xcbb-panel.xcbb-collapsed.xcbb-dock-top{top:12px;transform:none;}
    #xcbb-panel.xcbb-collapsed.xcbb-dock-center{top:50%;transform:translateY(-50%);}
    #xcbb-panel.xcbb-collapsed.xcbb-dock-bottom{top:auto;bottom:12px;transform:none;}
    #xcbb-panel.xcbb-collapsed #xcbb-body,
    #xcbb-panel.xcbb-collapsed #xcbb-header{display:none;}
    #xcbb-collapsed-icon{display:none;position:absolute;inset:0;align-items:center;
      justify-content:center;font-size:20px;line-height:1;pointer-events:none;}
    #xcbb-panel.xcbb-collapsed #xcbb-collapsed-icon{display:flex;}
    /* 圆点右键快捷菜单 */
    /* 右上角轻量通知(非模态, 不锁屏, 自动消失, 点击可关闭) */
    #xcbb-notify{position:fixed;right:12px;z-index:1000002;min-width:220px;max-width:320px;
      border-radius:12px;padding:10px 14px;box-shadow:0 8px 24px rgba(0,0,0,.25);
      opacity:0;transform:translateY(-8px);cursor:pointer;pointer-events:none; /* 隐藏后不拦截任何点击 */
      transition:opacity .25s ease,transform .25s ease;}
    #xcbb-notify.show{opacity:1;transform:translateY(0);pointer-events:auto;}
    #xcbb-notify.success{background:var(--xcbb-ok-bg);border:1px solid var(--xcbb-ok-border);color:var(--xcbb-ok-text);}
    #xcbb-notify.info{background:var(--xcbb-info-bg);border:1px solid var(--xcbb-info-border);color:var(--xcbb-info-text);}
    #xcbb-notify .xcbb-notify-title{font-size:12.5px;font-weight:600;}
    #xcbb-notify .xcbb-notify-body{font-size:11.5px;margin-top:2px;opacity:.9;}
    /* 圆点扫描进度: 环形填充 + 呼吸动画 + 计数徽标 */
    #xcbb-panel.xcbb-collapsed.xcbb-scanning{background:conic-gradient(var(--xcbb-warn) var(--xcbb-progress,0%), var(--xcbb-scrollbar) 0);
      animation:xcbb-glow 1.6s ease-in-out infinite;}
    @keyframes xcbb-glow{
      0%,100%{box-shadow:var(--xcbb-shadow), 0 0 0 0 rgba(163,116,31,.45);}
      50%{box-shadow:var(--xcbb-shadow), 0 0 0 9px rgba(163,116,31,0);}
    }
    #xcbb-pill-count{position:absolute;bottom:1px;right:1px;background:var(--xcbb-danger);color:#fff;
      font-size:8px;line-height:10px;padding:0 3px;border-radius:9999px;min-width:12px;text-align:center;}
    #xcbb-tpl-list,#xcbb-name-list,#xcbb-blocklog-list{margin:6px 0;max-height:150px;overflow:auto;
      display:flex;flex-direction:column;gap:4px;}
    .xcbb-item{display:flex;align-items:center;gap:6px;background:var(--xcbb-card);
      border:1px solid var(--xcbb-border);border-radius:8px;padding:4px 8px;font-size:12px;
      transition:border-color .15s ease,background .15s ease;}
    .xcbb-item:hover{border-color:var(--xcbb-border-hover);background:var(--xcbb-card-hover);}
    .xcbb-item .idx{flex:none;color:var(--xcbb-faint);font-size:11px;
      font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}
    .xcbb-item .txt{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .xcbb-item .sub{flex:none;max-width:45%;white-space:nowrap;overflow:hidden;
      text-overflow:ellipsis;color:var(--xcbb-dim);font-size:11px;}
    .xcbb-item button{flex:none;width:20px;height:20px;line-height:1;border-radius:50%;
      background:transparent !important;border:none !important;color:var(--xcbb-faint) !important;
      padding:0 !important;font-size:11px;transition:color .15s ease,background .15s ease;}
    .xcbb-item button:hover{color:var(--xcbb-danger) !important;background:var(--xcbb-card-hover) !important;}
    .xcbb-empty{color:var(--xcbb-faint);font-size:12px;padding:4px 2px;}
    #xcbb-freq-list{display:flex;flex-direction:column;gap:2px;margin:2px 0 6px;}
    .xcbb-freq-row{display:flex;align-items:center;gap:8px;padding:3px 6px;border-radius:6px;
      cursor:pointer;transition:background .15s ease;}
    .xcbb-freq-row:hover{background:var(--xcbb-card-hover);}
    .xcbb-freq-row.added{background:var(--xcbb-ok-bg);box-shadow:inset 0 0 0 1px var(--xcbb-accent);}
    .xcbb-freq-token{flex:none;width:96px;font-size:11px;color:var(--xcbb-text);
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .xcbb-freq-bar{flex:1;min-width:0;height:8px;background:var(--xcbb-input-border);border-radius:4px;overflow:hidden;}
    .xcbb-freq-bar-fill{display:block;height:100%;background:linear-gradient(90deg,var(--xcbb-accent),var(--xcbb-accent-hover));
      border-radius:4px;}
    .xcbb-freq-cnt{flex:none;width:36px;text-align:right;font-size:10px;color:var(--xcbb-dim);
      font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}
    #xcbb-modal{position:fixed;inset:0;z-index:1000000;background:var(--xcbb-overlay);display:flex;
      align-items:center;justify-content:center;}
    #xcbb-modal .box{width:600px;max-width:92vw;max-height:80vh;background:var(--xcbb-bg0);border:1px solid var(--xcbb-border);
      border-radius:12px;padding:14px;display:flex;flex-direction:column;}
    #xcbb-modal textarea{width:100%;min-height:300px;flex:1;box-sizing:border-box;background:var(--xcbb-input);
      border:1px solid var(--xcbb-input-border);color:var(--xcbb-text);border-radius:8px;padding:8px;
      font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;resize:vertical;}
    #xcbb-manual,#xcbb-white,#xcbb-remote-url,#xcbb-comment-kws,.xcbb-num-input{width:100%;box-sizing:border-box;background:var(--xcbb-input);
      border:1px solid var(--xcbb-input-border);color:var(--xcbb-text);border-radius:8px;padding:4px 8px;
      font-size:12px;resize:vertical;font-family:inherit;}
    .xcbb-num-input{width:90px;flex:none;border-radius:6px;padding:2px 6px;font-size:11px;}
    #xcbb-log{margin-top:2px;background:var(--xcbb-input);border:1px solid var(--xcbb-input-border);border-radius:8px;
      padding:5px 7px;height:200px;max-height:45vh;overflow:auto;font:11px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
      color:var(--xcbb-dim);white-space:pre-wrap;word-break:break-all;}
    #xcbb-log::-webkit-scrollbar{width:8px;}
    #xcbb-log::-webkit-scrollbar-thumb{background:var(--xcbb-scrollbar);border-radius:4px;}
    #xcbb-log::-webkit-scrollbar-thumb:hover{background:var(--xcbb-scrollbar-hover);}
    #xcbb-log::-webkit-scrollbar-track{background:transparent;}
    #xcbb-hint{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:999999;
      background:var(--xcbb-danger);color:#fff;padding:8px 18px;border-radius:9999px;font-size:13px;
      font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,.4);}
    article.xcbb-flagged{box-shadow:inset 0 0 0 2px var(--xcbb-danger) !important;border-radius:16px;}
    /* 迷你工具类(Tailwind CDN 不可用时的降级; Tailwind 加载后同值覆盖) */
    .hidden{display:none !important;}
    .flex{display:flex;} .flex-col{flex-direction:column;} .flex-1{flex:1 1 0%;} .flex-wrap{flex-wrap:wrap;}
    .items-center{align-items:center;} .justify-between{justify-content:space-between;}
    .gap-1{gap:4px;} .gap-2{gap:8px;} .gap-3{gap:12px;}
    .p-3{padding:12px;} .px-3{padding-left:12px;padding-right:12px;} .py-2{padding-top:8px;padding-bottom:8px;}
    .mt-1{margin-top:4px;} .mt-2{margin-top:8px;} .mb-1{margin-bottom:4px;} .ml-auto{margin-left:auto;}
    .w-full{width:100%;} .w-9{width:36px;}
    .text-xs{font-size:12px;line-height:16px;} .text-\[11px\]{font-size:11px;}
    .uppercase{text-transform:uppercase;} .font-semibold{font-weight:600;} .font-normal{font-weight:400;}
    .space-y-2>*+*{margin-top:8px;} .space-y-4>*+*{margin-top:16px;}
    .xcbb-edit-input{flex:1;min-width:0;background:var(--xcbb-input);border:1px solid var(--xcbb-input-border);border-radius:6px;
      padding:2px 6px;color:var(--xcbb-text);font-size:12px;font-family:inherit;}
    .xcbb-badge{background:var(--xcbb-danger);color:#fff;border-radius:9999px;font-size:9px;
      line-height:12px;padding:0 4px;min-width:14px;text-align:center;}
    /* 日志标题行 = 整行可点击开关 */
    #xcbb-log-head{border-radius:6px;cursor:pointer;transition:background .15s ease;}
    #xcbb-log-head:hover{background:var(--xcbb-card-hover);}
    .xcbb-dim{color:var(--xcbb-dim);}
    /* 静默屏蔽: 脚本执行屏蔽的窗口期内隐藏 X 的菜单与确认弹层(点击照常, 视觉无感) */
    html.xcbb-silent [role="menu"],
    html.xcbb-silent [role="alertdialog"]{visibility:hidden !important;}
    .xcbb-card{background:var(--xcbb-card);border:1px solid var(--xcbb-border);border-radius:10px;padding:8px 10px;}
    .xcbb-section-title{font-size:11px;font-weight:600;color:var(--xcbb-text);letter-spacing:.02em;}
    .xcbb-count-badge{background:var(--xcbb-scrollbar);color:var(--xcbb-dim);border-radius:9999px;font-size:10px;
      line-height:14px;padding:0 6px;min-width:18px;text-align:center;}
    /* 设置页 Tab */
    #xcbb-panel .xcbb-tab{flex:1;display:flex;align-items:center;justify-content:center;gap:4px;
      background:transparent;border:1px solid transparent;border-radius:8px 8px 0 0;
      color:var(--xcbb-faint);font-size:11px;padding:5px 0;cursor:pointer;position:relative;
      transition:color .15s ease,background .15s ease;}
    #xcbb-panel .xcbb-tab::after{content:'';position:absolute;left:22%;right:22%;bottom:-1px;
      height:2px;background:transparent;border-radius:2px;}
    #xcbb-panel .xcbb-tab:hover{color:var(--xcbb-text);background:var(--xcbb-input);filter:none;}
    #xcbb-panel .xcbb-tab.active{color:var(--xcbb-accent);background:var(--xcbb-input);}
    #xcbb-panel .xcbb-tab.active::after{background:var(--xcbb-accent);}
    #xcbb-panel textarea::placeholder,#xcbb-panel input::placeholder{color:var(--xcbb-placeholder);}
    .leading-relaxed{line-height:1.625;} .pt-1\.5{padding-top:6px;}
    .border-t{border-top:1px solid var(--xcbb-border);}
    .min-h-0{min-height:0;} .overflow-auto{overflow:auto;} .flex-none{flex:none;} .items-stretch{align-items:stretch;}
    .py-0\.5{padding-top:2px;padding-bottom:2px;} .-mx-1{margin-left:-4px;margin-right:-4px;} .select-none{user-select:none;}
    .text-center{text-align:center;} .mt-3{margin-top:12px;}
    /* 全高模式(常驻控制台): 展开后占满视口高度; 只有内容区滚动, 头部固定 */
    #xcbb-panel.xcbb-full{height:calc(100vh - 12px);display:flex;flex-direction:column;}
    #xcbb-panel.xcbb-full #xcbb-header{flex:none;}
    #xcbb-panel.xcbb-full #xcbb-body{flex:1;min-height:0;max-height:none;overflow:hidden;
      display:flex;flex-direction:column;}
    #xcbb-panel.xcbb-full #xcbb-main{flex:1;min-height:0;display:flex;flex-direction:column;}
    #xcbb-panel.xcbb-full #xcbb-settings{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;}
    #xcbb-panel.xcbb-full #xcbb-log{flex:1;min-height:0;height:auto;max-height:none;}
    /* Tab 内列表占满剩余高度: 操作行与输入框固定, 列表中部滚动 */
    #xcbb-panel.xcbb-full #xcbb-panel-tpl,
    #xcbb-panel.xcbb-full #xcbb-panel-names{display:flex;flex-direction:column;}
    #xcbb-panel.xcbb-full #xcbb-panel-tpl > .xcbb-card,
    #xcbb-panel.xcbb-full #xcbb-panel-names > .xcbb-card{flex:1;min-height:0;
      display:flex;flex-direction:column;}
    #xcbb-panel.xcbb-full #xcbb-tpl-list,
    #xcbb-panel.xcbb-full #xcbb-name-list{flex:1;min-height:0;max-height:none;overflow:auto;}
    /* 特征词 Tab: 条形图列表同样占满 */
    #xcbb-panel.xcbb-full #xcbb-panel-freq{display:flex;flex-direction:column;}
    #xcbb-panel.xcbb-full #xcbb-panel-freq > .xcbb-card{flex:1;min-height:0;
      display:flex;flex-direction:column;}
    #xcbb-panel.xcbb-full #xcbb-freq-list{flex:1;min-height:0;overflow:auto;}
    .gap-0\.5{gap:2px;} .gap-1\.5{gap:6px;}
    .px-2\.5{padding-left:10px;padding-right:10px;} .py-1\.5{padding-top:6px;padding-bottom:6px;}
    .mb-1\.5{margin-bottom:6px;} .space-y-1\.5>*+*{margin-top:6px;}
    .text-\[10px\]{font-size:10px;} .text-\[12px\]{font-size:12px;}
    .w-7{width:28px;} .tracking-wider{letter-spacing:.05em;} .cursor-pointer{cursor:pointer;}
  `);

  /* ---- Tailwind Play CDN(preflight 关闭避免重置 X 页面样式; GM_addElement 绕过页面 CSP) ---- */
  try {
    GM_addElement('script', { textContent: 'tailwind.config = { corePlugins: { preflight: false } };' });
    GM_addElement('script', { src: 'https://cdn.tailwindcss.com' });
  } catch (e) {
    console.warn('[xcbb] Tailwind CDN 注入失败, 使用内置降级样式', e);
  }

  const panel = document.createElement('div');
  panel.id = 'xcbb-panel';
  panel.innerHTML = `
    <div id="xcbb-header" class="flex items-center gap-1.5 px-2.5 py-1.5 cursor-move select-none font-semibold">
      <span id="xcbb-brand">🤖</span>
      <span id="xcbb-title" class="text-[12px]">X Bot 屏蔽器</span>
      <span id="xcbb-ver" class="text-[10px] font-normal xcbb-dim"></span>
      <span class="flex-1"></span>
      <button id="xcbb-settings-btn" class="ghost tiny" title="设置与数据管理">⚙</button>
      <button id="xcbb-min" class="ghost tiny" title="收起为圆点">🗕</button>
    </div>
    <div id="xcbb-collapsed-icon">🤖<span id="xcbb-pill-count" class="hidden"></span></div>
    <div id="xcbb-body">
      <!-- 主界面: 简单操作 -->
      <div id="xcbb-main" class="p-2 space-y-1.5">
        <div class="flex items-center gap-1.5">
          <button id="xcbb-run">▶ 扫描</button>
          <button id="xcbb-stop" class="danger">⏹</button>
          <span id="xcbb-status" class="text-[11px] xcbb-dim"></span>
          <span class="flex-1"></span>
          <label class="flex items-center gap-0.5 text-[11px] text-[#262b26]" title="自动屏蔽(关=仅标记)">
            <input id="xcbb-autoblock" type="checkbox">自动
          </label>
        </div>
        <div class="flex items-center justify-between text-[10px] xcbb-dim">
          <span>扫描 <b id="xcbb-scan" class="text-[#262b26]">0</b></span>
          <span>疑似 <b id="xcbb-match" class="text-[#a3741f]">0</b></span>
          <span title="本次新屏蔽的独立账号(同账号多条评论只计一次)">封禁 <b id="xcbb-block" class="text-[#b85252]">0</b></span>
          <span title="历史累计封禁(跨扫描/跨页面, 与 X 设置里的屏蔽列表可对照)">累计 <b id="xcbb-total" class="text-[#b85252]">0</b></span>
        </div>
        <div class="text-[10px] leading-relaxed" style="color:var(--xcbb-warn)" title="启发式规则无法保证 100% 准确">⚠ 规则匹配可能误封正常用户 — 建议先用“仅标记”试跑; 误封可在 设置→数据→屏蔽记录 一键解封</div>
        <div class="flex items-center gap-1.5">
          <button id="xcbb-pick" class="ghost flex-1">＋ 选取评论</button>
          <button id="xcbb-pick-name" class="ghost flex-1">＋ 选取用户</button>
        </div>
        <div class="flex items-center gap-2 text-[11px]">
          阈值
          <input id="xcbb-thr" type="range" min="0.5" max="0.99" step="0.01" class="flex-1">
          <span id="xcbb-thr-val" class="w-7 text-right xcbb-dim"></span>
        </div>
        <div id="xcbb-log-head" class="flex items-center gap-1 py-0.5 px-1 -mx-1 select-none" title="点击展开/收起日志">
          <span class="text-[10px] uppercase tracking-wider xcbb-dim">日志</span>
          <span id="xcbb-log-badge" class="xcbb-badge hidden"></span>
          <span class="flex-1"></span>
          <span id="xcbb-log-chevron" class="text-[10px] xcbb-dim">▸</span>
          <button id="xcbb-log-export" class="ghost tiny" title="导出日志, 发给作者生成补充规则">导出</button>
          <button id="xcbb-log-clear" class="ghost tiny" title="清空日志">清空</button>
        </div>
        <div id="xcbb-log"></div>
      </div>
      <!-- 设置页: 完整管理 -->
      <div id="xcbb-settings" class="p-2 hidden">
        <div class="flex items-center gap-1.5 mb-1.5 flex-none">
          <button id="xcbb-back" class="ghost tiny">← 返回</button>
          <span class="text-[11px] font-semibold xcbb-dim">设置</span>
          <span class="flex-1"></span>
          <button id="xcbb-export" class="ghost tiny" title="导出全部(模板评论/语料/名单)">导出全部</button>
        </div>
        <div class="flex items-stretch gap-0.5 mb-1.5 flex-none" id="xcbb-tabbar">
          <button class="xcbb-tab active" data-tab="tpl">模板<span id="xcbb-tpl-count" class="xcbb-count-badge">0</span></button>
          <button class="xcbb-tab" data-tab="names">名单<span id="xcbb-name-count" class="xcbb-count-badge">0</span></button>
          <button class="xcbb-tab" data-tab="freq">特征词</button>
          <button class="xcbb-tab" data-tab="data">数据</button>
          <button class="xcbb-tab" data-tab="opt">选项</button>
        </div>
        <div id="xcbb-panel-tpl" class="flex-1 min-h-0 overflow-auto">
          <section class="xcbb-card">
            <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <h3 class="xcbb-section-title">模板评论</h3>
              <span class="flex-1"></span>
              <button id="xcbb-export-tpl" class="ghost tiny" title="仅导出模板评论">导出模板</button>
              <button id="xcbb-clean-tpl" class="ghost tiny" title="删除纯数字/短乱码/短英文等无效模板">清理无效</button>
              <button id="xcbb-clear-tpl" class="ghost tiny" title="清空全部模板">清空</button>
            </div>
            <div id="xcbb-tpl-list"></div>
            <textarea id="xcbb-manual" rows="1" class="mt-1" placeholder="粘贴一条模板评论, 回车添加"></textarea>
          </section>
        </div>
        <div id="xcbb-panel-names" class="flex-1 min-h-0 overflow-auto hidden">
          <section class="xcbb-card">
            <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <h3 class="xcbb-section-title">用户名名单</h3>
              <span class="flex-1"></span>
              <button id="xcbb-builtin" class="ghost tiny" title="一键加载内置规则(约炮引流类)">内置</button>
              <button id="xcbb-import-toggle" class="ghost tiny">导入</button>
              <button id="xcbb-clear-names" class="ghost tiny" title="清空全部名单">清空</button>
            </div>
            <textarea id="xcbb-import-area" rows="3" class="hidden mb-1" placeholder="粘贴要导入的规则, 每行一条(#开头为注释), 然后点 [执行导入]"></textarea>
            <div id="xcbb-name-list"></div>
            <textarea id="xcbb-manual-name" rows="1" class="mt-1" placeholder="昵称/用户名/正则, 如: 免费领福利 或 _88421, 回车添加"></textarea>
          </section>
        </div>
        <div id="xcbb-panel-freq" class="flex-1 min-h-0 overflow-auto hidden">
          <section class="xcbb-card">
            <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <h3 class="xcbb-section-title">高频特征词</h3>
              <span id="xcbb-freq-info" class="text-[10px] xcbb-dim"></span>
              <span class="flex-1"></span>
              <button id="xcbb-freq-all" class="ghost tiny">全部加入</button>
              <button id="xcbb-freq-clear" class="ghost tiny">清语料</button>
            </div>
            <div id="xcbb-freq-list"></div>
            <textarea id="xcbb-manual-freq" rows="1" class="mt-1" placeholder="手动添加特征词(不经过挖掘, 回车加入名单)"></textarea>
          </section>
        </div>
        <div id="xcbb-panel-data" class="flex-1 min-h-0 overflow-auto hidden">
          <section class="xcbb-card mb-1.5">
            <h3 class="xcbb-section-title mb-1">数据概览</h3>
            <div class="flex justify-between text-center">
              <div><div class="text-[14px] font-semibold text-[#262b26]" id="xcbb-ov-tpl">0</div><div class="text-[9px] xcbb-dim">模板</div></div>
              <div><div class="text-[14px] font-semibold text-[#262b26]" id="xcbb-ov-names">0</div><div class="text-[9px] xcbb-dim">名单</div></div>
              <div><div class="text-[14px] font-semibold text-[#262b26]" id="xcbb-ov-corpus">0</div><div class="text-[9px] xcbb-dim">语料</div></div>
              <div><div class="text-[14px] font-semibold text-[#b85252]" id="xcbb-ov-blocked">0</div><div class="text-[9px] xcbb-dim">累计封禁</div></div>
            </div>
            <div class="text-[10px] xcbb-dim mt-1.5">上次远程同步: <span id="xcbb-ov-sync" class="text-[#3a3f3a]">从未</span></div>
          </section>
          <section class="xcbb-card">
            <h3 class="xcbb-section-title mb-1.5">数据文件(JSON 分离)</h3>
            <p class="text-[11px] xcbb-dim mb-1.5 leading-relaxed">完整数据可独立存为本地文件, 与脚本代码分离; 导入为合并去重, 不覆盖已有条目。</p>
            <div class="flex gap-1.5">
              <button id="xcbb-json-download" class="ghost tiny">下载 JSON</button>
              <button id="xcbb-json-import" class="ghost tiny">导入 JSON 文件</button>
              <input id="xcbb-json-file" type="file" accept=".json,application/json" class="hidden">
            </div>
            <div class="mt-2 pt-1.5 border-t">
              <div class="text-[10px] xcbb-dim mb-1">远程同步 · 填入 Gist raw URL(secret gist 更新后 URL 会变)</div>
              <input id="xcbb-remote-url" placeholder="https://gist.githubusercontent.com/.../raw/...">
              <div class="mt-1 flex items-center gap-1.5">
                <button id="xcbb-remote-pull" class="ghost tiny">📡 拉取并合并</button>
                <label class="flex items-center gap-1 text-[10px] text-[#3a3f3a]" title="页面加载时自动拉取一次, 仅内容变化时合并">
                  <input id="xcbb-autosync" type="checkbox"> 启动自动同步
                </label>
              </div>
            </div>
          </section>
          <section class="xcbb-card">
            <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <h3 class="xcbb-section-title">近期屏蔽记录</h3>
              <span class="flex-1"></span>
              <button id="xcbb-blocklog-export" class="ghost tiny" title="导出屏蔽记录为 JSON 文件">导出</button>
              <button id="xcbb-blocklog-clear" class="ghost tiny" title="清空全部屏蔽记录(不影响已屏蔽的账号)">清空</button>
            </div>
            <p class="text-[11px] xcbb-dim mb-1.5 leading-relaxed">脚本屏蔽的账号留痕于此(上限300条): 🏠 打开对方主页手动解除屏蔽, ✓ 加入白名单防止下次再锁, 导出为 JSON 备份。</p>
            <div id="xcbb-blocklog-list"></div>
          </section>
        </div>
        <div id="xcbb-panel-opt" class="flex-1 min-h-0 overflow-auto hidden">
          <section class="xcbb-card">
            <h3 class="xcbb-section-title mb-1.5">屏蔽行为</h3>
            <label class="flex items-center gap-1.5 text-[11px] mt-1 text-[#3a3f3a]">
              <input id="xcbb-confirm" type="checkbox"> 屏蔽前逐个确认
            </label>
            <label class="flex items-center gap-1.5 text-[11px] mt-1 text-[#3a3f3a]">
              <input id="xcbb-contain" type="checkbox"> 包含匹配(短模板被长评论完整包含)
            </label>
            <label class="flex items-center gap-1.5 text-[11px] mt-1 text-[#3a3f3a]" title="评论文本含关键词即命中(如约炮/裸聊); 匹配源为内置低风险词+下方自定义列表, 与用户名名单独立, 名单里的普通词不会误伤正常评论">
              <input id="xcbb-commentkw" type="checkbox"> 评论关键词匹配
            </label>
            <div class="text-[10px] xcbb-dim mt-1">评论关键词(每行一条, 与名单独立; 内置低风险词始终生效)</div>
            <textarea id="xcbb-comment-kws" rows="3" class="mt-0.5" placeholder="每行一条, 如: 约炮 / /正则/"></textarea>
            <label class="flex items-center gap-1.5 text-[11px] mt-1 text-[#3a3f3a]" title="屏蔽时隐藏 X 的菜单/确认弹层, 扫描不打断阅读">
              <input id="xcbb-silent" type="checkbox"> 静默屏蔽(不显示确认弹窗)
            </label>
            <div class="flex items-center justify-between mt-2" title="每次屏蔽之间的间隔, 防风控, 建议≥1000ms">
              <span class="text-[11px] text-[#3a3f3a]">屏蔽间隔</span>
              <div class="flex items-center gap-1">
                <input id="xcbb-opt-blockdelay" type="number" min="200" max="10000" step="100" class="xcbb-num-input">
                <span class="text-[10px] xcbb-dim">ms</span>
              </div>
            </div>
            <h3 class="xcbb-section-title mt-3 mb-1.5">扫描参数</h3>
            <div class="flex items-center justify-between mt-1.5" title="每轮滚动/展开加载之间的等待时间">
              <span class="text-[11px] text-[#3a3f3a]">滚动间隔</span>
              <div class="flex items-center gap-1">
                <input id="xcbb-opt-scrolldelay" type="number" min="200" max="10000" step="100" class="xcbb-num-input">
                <span class="text-[10px] xcbb-dim">ms</span>
              </div>
            </div>
            <div class="flex items-center justify-between mt-1.5" title="单次扫描最大轮数上限">
              <span class="text-[11px] text-[#3a3f3a]">最大轮数</span>
              <input id="xcbb-opt-maxrounds" type="number" min="1" max="500" step="1" class="xcbb-num-input">
            </div>
            <div class="flex items-center justify-between mt-1.5" title="连续N轮无新评论即自动停止">
              <span class="text-[11px] text-[#3a3f3a]">闲置停止</span>
              <div class="flex items-center gap-1">
                <input id="xcbb-opt-idlerounds" type="number" min="1" max="20" step="1" class="xcbb-num-input">
                <span class="text-[10px] xcbb-dim">轮</span>
              </div>
            </div>
            <div class="flex items-center justify-between mt-1.5" title="收起圆点的停靠位置">
              <span class="text-[11px] text-[#3a3f3a]">圆点停靠</span>
              <select id="xcbb-dock" class="xcbb-num-input">
                <option value="top">上</option>
                <option value="center">中</option>
                <option value="bottom">下</option>
              </select>
            </div>
            <h3 class="xcbb-section-title mt-3 mb-1.5">白名单</h3>
            <div class="text-[10px] xcbb-dim mb-1">每行一个用户名, 不扫描/不屏蔽</div>
            <textarea id="xcbb-white" rows="3" placeholder="如: 我关注的人"></textarea>
          </section>
        </div>
      </div>
    </div>`;
  document.body.appendChild(panel);

  const el = (id) => panel.querySelector('#' + id);
  const logEl = el('xcbb-log');

  /* ---- 模板列表(支持编辑/删除) ---- */
  let editingTpl = -1, editingName = -1;
  function renderTemplates() {
    const list = el('xcbb-tpl-list');
    list.innerHTML = '';
    if (!templates.length) {
      list.innerHTML = '<div class="xcbb-empty">暂无模板 — 主界面点 [+ 选取评论], 或下方粘贴文本</div>';
    } else {
      templates.forEach((t, i) => {
        const item = document.createElement('div');
        item.className = 'xcbb-item';
        item.title = t.o; // 悬停查看完整内容
        if (editingTpl === i) {
          const input = document.createElement('input');
          input.className = 'xcbb-edit-input';
          input.value = t.o;
          const save = document.createElement('button');
          save.textContent = '✓';
          save.title = '保存修改';
          save.addEventListener('click', () => {
            const v = input.value.trim();
            if (v.length < 2) { log('⚠ 内容过短'); return; }
            t.n = normalize(v);
            t.o = v.length > 60 ? v.slice(0, 60) + '…' : v;
            saveTemplates();
            editingTpl = -1;
            renderTemplates();
            log('✔ 模板已修改');
          });
          const cancel = document.createElement('button');
          cancel.textContent = '✕';
          cancel.title = '取消';
          cancel.addEventListener('click', () => { editingTpl = -1; renderTemplates(); });
          item.appendChild(input);
          item.appendChild(save);
          item.appendChild(cancel);
          input.focus();
        } else {
          const idx = document.createElement('span');
          idx.className = 'idx';
          idx.textContent = `#${i + 1}`;
          const txt = document.createElement('span');
          txt.className = 'txt';
          txt.textContent = t.o;
          const edit = document.createElement('button');
          edit.textContent = '✎';
          edit.title = '编辑该模板';
          edit.addEventListener('click', () => { editingTpl = i; renderTemplates(); });
          const del = document.createElement('button');
          del.textContent = '✕';
          del.title = '删除该模板';
          del.addEventListener('click', () => {
            templates.splice(i, 1);
            saveTemplates();
            renderTemplates();
          });
          item.appendChild(idx);
          item.appendChild(txt);
          item.appendChild(edit);
          item.appendChild(del);
        }
        list.appendChild(item);
      });
    }
    el('xcbb-tpl-count').textContent = templates.length;
    updateOverview();
  }

  function addTemplate(text) {
    const n = normalize(text);
    if (!n) { log('⚠ 该评论无有效文本'); return; }
    if (n.length < 4) { log('⚠ 文本过短, 请选择更长一些的评论'); return; }
    if (templates.some((t) => t.n === n)) { log('ℹ 模板已存在'); return; }
    templates.push({ n, o: text.length > 60 ? text.slice(0, 60) + '…' : text });
    saveTemplates();
    renderTemplates();
    log(`✔ 已添加模板: "${text.length > 40 ? text.slice(0, 40) + '…' : text}"`);
  }

  // 清理无效模板: 纯数字(时间戳/编号) / 不含中文且长度<6(验证码/短英文词); 返回清理数量
  function cleanInvalidTemplates() {
    const before = templates.length;
    templates = templates.filter((t) => {
      if (/^[\d\s]+$/.test(t.n)) return false;
      if (t.n.length < 6 && !/[\u4e00-\u9fff]/.test(t.n)) return false;
      return true;
    });
    if (templates.length === before) { log('ℹ 没有需要清理的无效模板'); return 0; }
    saveTemplates();
    renderTemplates();
    log(`🧹 已清理 ${before - templates.length} 条无效模板(纯数字/短乱码/短英文), 剩 ${templates.length} 条`);
    return before - templates.length;
  }

  /* ---- 用户名名单(支持编辑/删除) ---- */
  function renderBadnames() {
    const list = el('xcbb-name-list');
    list.innerHTML = '';
    if (!badnames.length) {
      list.innerHTML = '<div class="xcbb-empty">暂无名单 — 主界面点 [+ 选取用户], 或点 [内置] 加载</div>';
    } else {
      badnames.forEach((en, i) => {
        const item = document.createElement('div');
        item.className = 'xcbb-item';
        item.title = en.h ? `${en.d} (@${en.h})` : en.d;
        if (editingName === i) {
          const input = document.createElement('input');
          input.className = 'xcbb-edit-input';
          input.value = en.d;
          const save = document.createElement('button');
          save.textContent = '✓';
          save.title = '保存修改';
          save.addEventListener('click', () => {
            const v = input.value.trim();
            if (v.length > 2 && v[0] === '/') {
              const last = v.lastIndexOf('/');
              if (last > 0) {
                try { new RegExp(v.slice(1, last), v.slice(last + 1)); }
                catch (e) { log(`⚠ 无效正则: ${v}`); return; }
              }
            }
            en.d = v || en.d;
            saveBadnames();
            editingName = -1;
            renderBadnames();
            log('✔ 条目已修改');
          });
          const cancel = document.createElement('button');
          cancel.textContent = '✕';
          cancel.title = '取消';
          cancel.addEventListener('click', () => { editingName = -1; renderBadnames(); });
          item.appendChild(input);
          item.appendChild(save);
          item.appendChild(cancel);
          input.focus();
        } else {
          const idx = document.createElement('span');
          idx.className = 'idx';
          idx.textContent = `#${i + 1}`;
          const txt = document.createElement('span');
          txt.className = 'txt';
          txt.textContent = en.d;
          item.appendChild(idx);
          item.appendChild(txt);
          if (en.h) {
            const sub = document.createElement('span');
            sub.className = 'sub';
            sub.textContent = '@' + en.h;
            item.appendChild(sub);
          }
          const edit = document.createElement('button');
          edit.textContent = '✎';
          edit.title = '编辑该条目';
          edit.addEventListener('click', () => { editingName = i; renderBadnames(); });
          const del = document.createElement('button');
          del.textContent = '✕';
          del.title = '删除该条目';
          del.addEventListener('click', () => {
            badnames.splice(i, 1);
            saveBadnames();
            renderBadnames();
          });
          item.appendChild(edit);
          item.appendChild(del);
        }
        list.appendChild(item);
      });
    }
    el('xcbb-name-count').textContent = badnames.length;
    updateOverview();
  }

  function addBadname(name, handle, quiet) {
    const d = String(name || '').replace(/^@/, '').trim();
    const h = handle ? String(handle).replace(/^@/, '').trim() : null;
    if (!d) { log('⚠ 无法获取该评论作者的昵称'); return; }
    // 正则条目提前校验
    if (d.length > 2 && d[0] === '/') {
      const last = d.lastIndexOf('/');
      if (last > 0) {
        try { new RegExp(d.slice(1, last), d.slice(last + 1)); }
        catch (e) { log(`⚠ 无效正则: ${d}`); return; }
      }
    }
    if (badnames.some((en) => en.d.toLowerCase() === d.toLowerCase())) {
      if (!quiet) log(`ℹ "${d}" 已在名单中`);
      return;
    }
    badnames.push({ d, h });
    saveBadnames();
    renderBadnames();
    if (h) recordCorpus(d, h); // 选取的账号计入语料
    if (!quiet) log(`✔ 已添加: ${d}${h ? ` (@${h})` : ''}`);
  }

  /* ---- 屏蔽记录(误伤追溯 / 手动解封入口) ---- */
  function renderBlocklog() {
    const list = el('xcbb-blocklog-list');
    list.innerHTML = '';
    if (!blocklog.length) {
      list.innerHTML = '<div class="xcbb-empty">暂无记录 — 脚本屏蔽账号后会记录在这里</div>';
      return;
    }
    const items = [...blocklog].reverse(); // 最新在前
    for (const b of items) {
      const row = document.createElement('div');
      row.className = 'xcbb-item';
      row.title = b.r ? `命中: ${b.r}` : '屏蔽记录';
      const txt = document.createElement('span');
      txt.className = 'txt';
      const t = new Date(b.t);
      const time = `${t.getMonth() + 1}/${t.getDate()} ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
      txt.textContent = `${b.n ? b.n + ' ' : ''}@${b.h} · ${time}`;
      const home = document.createElement('button');
      home.textContent = '🏠';
      home.title = '打开对方主页(在此手动解除屏蔽)';
      home.addEventListener('click', () => { window.open('https://x.com/' + b.h, '_blank'); });
      const wl = document.createElement('button');
      wl.textContent = '✓';
      wl.title = '加入白名单(后续扫描不再处理该账号)';
      wl.addEventListener('click', () => {
        const cur = new Set(parseWhitelist());
        if (cur.has(b.h)) { log(`ℹ @${b.h} 已在白名单`); return; }
        cur.add(b.h);
        settings.whitelist = [...cur].join('\n');
        saveSettings();
        updateUI();
        log(`✔ @${b.h} 已加入白名单`);
      });
      const del = document.createElement('button');
      del.textContent = '✕';
      del.title = '从记录中删除';
      del.addEventListener('click', () => {
        blocklog = blocklog.filter((x) => x.h !== b.h);
        saveBlocklog();
        renderBlocklog();
      });
      row.appendChild(txt);
      row.appendChild(home);
      row.appendChild(wl);
      row.appendChild(del);
      list.appendChild(row);
    }
  }

  /* ---- 导入 / 导出(与作者/AI 协作) ---- */
  function exportData() {
    const lines = [];
    lines.push(`# X 评论机器人屏蔽器 数据导出 ${new Date().toLocaleString()}`);
    lines.push(`# 模板评论 ${templates.length} 条:`);
    for (const t of templates) lines.push(t.o);
    lines.push(`# 评论关键词 ${commentKws.length} 条:`);
    for (const kw of commentKws) lines.push(kw);
    lines.push(`# 语料(已确认垃圾账号) ${corpus.length} 条: 昵称 | @handle`);
    for (const c of corpus) lines.push(`${c.d || '(无昵称)'} | @${c.h}`);
    lines.push(`# 当前名单 ${badnames.length} 条:`);
    for (const en of badnames) lines.push(en.h ? `${en.d} | @${en.h}` : en.d);
    return lines.join('\n');
  }

  function exportTemplates() {
    const lines = [];
    lines.push(`# X 评论机器人屏蔽器 模板评论 ${templates.length} 条 ${new Date().toLocaleString()}`);
    for (const t of templates) lines.push(t.o);
    return lines.join('\n');
  }

  /* ---- JSON 数据文件(与脚本分离的完整数据) ---- */
  function exportJson() {
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      templates: templates.map((t) => t.o),
      badnames: badnames.map((en) => (en.h ? { d: en.d, h: en.h } : { d: en.d })),
      commentKws: commentKws,
      blocklog: blocklog.map((b) => ({ h: b.h, n: b.n, t: b.t, r: b.r })),
      corpus: corpus.map((c) => ({ d: c.d, h: c.h }))
    }, null, 2);
  }

  // 仅导出屏蔽记录(独立 JSON, 便于查看/备份)
  function downloadBlocklog() {
    const blob = new Blob([JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      blocklog: blocklog.map((b) => ({ h: b.h, n: b.n, t: b.t, r: b.r }))
    }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'blocklog.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    log(`✔ 已下载 blocklog.json (${blocklog.length} 条屏蔽记录)`);
  }

  function downloadJson() {
    const blob = new Blob([exportJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'spam-rules.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000); // 延迟回收 Blob URL, 避免下载被同步撤销取消
    log('✔ 已下载 spam-rules.json (模板/名单/语料全量)');
  }

  // 合并 JSON 数据(去重, 不覆盖) — 供本地文件导入与远程拉取共用
  function mergeJsonData(data) {
    let nTpl = 0, nBad = 0, nCor = 0, nKw = 0, nBlk = 0;
    if (Array.isArray(data.templates)) {
      for (const o of data.templates) {
        const n = normalize(String(o));
        if (n.length >= 4 && !templates.some((t) => t.n === n)) {
          templates.push({ n, o: String(o).length > 60 ? String(o).slice(0, 60) + '…' : String(o) });
          nTpl++;
        }
      }
    }
    if (Array.isArray(data.badnames)) {
      for (const en of data.badnames) {
        const d = String((en && (en.d || en)) || '').replace(/^@/, '').trim();
        const h = en && en.h ? String(en.h).replace(/^@/, '').trim().toLowerCase() : null;
        if (d && !badnames.some((x) => x.d.toLowerCase() === d.toLowerCase())) {
          badnames.push({ d, h });
          nBad++;
          if (h) recordCorpus(d, h);
        }
      }
    }
    if (Array.isArray(data.commentKws)) {
      for (const kw of data.commentKws) {
        const k = String(kw || '').trim();
        if (k && !commentKws.includes(k)) { commentKws.push(k); nKw++; }
      }
    }
    if (Array.isArray(data.blocklog)) {
      // 按 handle 合并去重, 保留最新时间戳; 时间升序与 logBlock 追加顺序一致
      const have = new Map(blocklog.map((b) => [b.h, b]));
      for (const b of data.blocklog) {
        const h = String((b && b.h) || '').toLowerCase();
        if (!h) continue;
        const nb = { h, n: String((b && b.n) || ''), t: Number((b && b.t) || 0) || Date.now(), r: String((b && b.r) || '') };
        const old = have.get(h);
        if (!old || nb.t > old.t) { have.set(h, nb); nBlk++; }
      }
      blocklog = [...have.values()].sort((a, b) => a.t - b.t);
      if (blocklog.length > 300) blocklog = blocklog.slice(-300);
      saveBlocklog();
    }
    if (Array.isArray(data.corpus)) {
      for (const c of data.corpus) {
        const d = String((c && c.d) || '');
        const h = String((c && c.h) || '').toLowerCase();
        if (h && !corpus.some((x) => x.h === h)) {
          corpus.push({ d, h });
          nCor++;
        }
      }
    }
    saveTemplates();
    saveBadnames();
    saveCommentKws();
    saveCorpus();
    renderTemplates();
    renderBadnames();
    renderFreq();
    updateOverview();
    return { nTpl, nBad, nCor, nKw, nBlk };
  }

  function importJsonFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || typeof data !== 'object') throw new Error('文件不是 JSON 对象');
        const r = mergeJsonData(data);
        log(`✔ JSON 导入成功: 模板 +${r.nTpl} / 名单 +${r.nBad} / 关键词 +${r.nKw} / 屏蔽记录 +${r.nBlk} / 语料 +${r.nCor} (合并去重)`);
      } catch (e) {
        log(`⚠ JSON 解析失败: ${e.message}`);
      }
    };
    reader.readAsText(file);
  }

  // 内容哈希(远程同步变化检测: 内容没变就不重复合并)
  function hashStr(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return 'h' + (h >>> 0).toString(36);
  }

  // 远程拉取(Gist raw URL): mode='auto' 仅内容变化时合并; 'manual' 始终合并
  function fetchRemoteJson(mode) {
    const url = (el('xcbb-remote-url').value || settings.remoteUrl || '').trim();
    if (!url) { if (mode === 'manual') log('⚠ 请先填写数据源 URL'); return; }
    settings.remoteUrl = url;
    saveSettings();
    if (mode === 'manual') log('📡 正在拉取数据源…');
    GM_xmlhttpRequest({
      method: 'GET',
      url,
      timeout: 15000,
      onload: (res) => {
        try {
          if (res.status >= 400) throw new Error(`HTTP ${res.status}`);
          const raw = res.responseText;
          const data = JSON.parse(raw);
          if (!data || typeof data !== 'object') throw new Error('不是 JSON 对象');
          if (mode === 'auto') {
            if (hashStr(raw) === totals.lastHash) { log('ℹ 远程数据无更新, 跳过合并'); return; }
          }
          const r = mergeJsonData(data);
          totals.lastSync = new Date().toLocaleString();
          totals.lastHash = hashStr(raw);
          saveTotals();
          updateOverview();
          log(`✔ 远程同步${mode === 'auto' ? '(自动, 检测到更新)' : ''}: 模板 +${r.nTpl} / 名单 +${r.nBad} / 关键词 +${r.nKw} / 屏蔽记录 +${r.nBlk} / 语料 +${r.nCor} (合并去重)`);
        } catch (e) {
          if (mode === 'manual') log(`⚠ 远程拉取失败: ${e.message}`);
        }
      },
      onerror: () => { if (mode === 'manual') log('⚠ 网络错误, 拉取失败'); },
      ontimeout: () => { if (mode === 'manual') log('⚠ 请求超时(15s)'); }
    });
  }
  const pullRemoteJson = () => fetchRemoteJson('manual');

  function showExportModal(text, title) {
    $('#xcbb-modal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'xcbb-modal';
    const box = document.createElement('div');
    box.className = 'box';
    const titleEl = document.createElement('div');
    titleEl.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;font-weight:600';
    titleEl.textContent = title || '数据导出 — 全选复制后发给作者生成关键词规则';
    const close = document.createElement('button');
    close.textContent = '关闭';
    close.style.marginLeft = 'auto';
    const ta = document.createElement('textarea');
    ta.readOnly = true;
    ta.value = text || exportData();
    const copy = document.createElement('button');
    copy.textContent = '📋 复制';
    copy.style.marginTop = '8px';
    copy.addEventListener('click', () => {
      try {
        GM_setClipboard(ta.value);
        log('✔ 已复制到剪贴板');
      } catch (e) {
        ta.select();
        document.execCommand('copy');
        log('✔ 已复制(兼容模式)');
      }
    });
    close.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    titleEl.appendChild(close);
    box.appendChild(titleEl);
    box.appendChild(ta);
    box.appendChild(copy);
    modal.appendChild(box);
    document.body.appendChild(modal);
    ta.focus();
    ta.select();
  }

  /* ---- 高频特征词(词频条形图) ---- */
  function renderFreq() {
    const list = el('xcbb-freq-list');
    list.innerHTML = '';
    const all = computeFreq();
    el('xcbb-freq-info').textContent = `语料 ${corpus.length} 账号 · 特征词 ${all.length} 个`;
    if (!all.length) {
      list.innerHTML = '<div class="xcbb-empty">暂无 — 多选取/屏蔽几个垃圾账号后自动生成建议</div>';
      return;
    }
    const max = all[0][1];
    for (const [token, count] of all.slice(0, 25)) {
      const row = document.createElement('div');
      row.className = 'xcbb-freq-row';
      row.title = `点击加入名单 (出现在 ${count} 个账号中)`;
      const name = document.createElement('span');
      name.className = 'xcbb-freq-token';
      name.textContent = token;
      const barWrap = document.createElement('span');
      barWrap.className = 'xcbb-freq-bar';
      const bar = document.createElement('span');
      bar.className = 'xcbb-freq-bar-fill';
      bar.style.width = Math.max(6, (count / max) * 100) + '%';
      barWrap.appendChild(bar);
      const cnt = document.createElement('span');
      cnt.className = 'xcbb-freq-cnt';
      cnt.textContent = `×${count}`;
      row.appendChild(name);
      row.appendChild(barWrap);
      row.appendChild(cnt);
      row.addEventListener('click', () => {
        addBadname(token);
        row.classList.add('added');
        setTimeout(() => row.classList.remove('added'), 800);
      });
      list.appendChild(row);
    }
  }

  /* ---- 选取模式(评论模板 / 用户名) ---- */
  let pickMode = null; // null | 'template' | 'username'
  function setPickMode(target) {
    pickMode = (pickMode === target) ? null : target;
    ['template', 'username'].forEach((t) => {
      const btn = el(t === 'template' ? 'xcbb-pick' : 'xcbb-pick-name');
      const on = pickMode === t;
      btn.classList.toggle('danger', on);
      btn.textContent = on ? '⏹ 退出选取' : (t === 'template' ? '+ 选取评论' : '+ 选取用户');
    });
    let hint = $('#xcbb-hint');
    if (pickMode) {
      if (!hint) {
        hint = document.createElement('div');
        hint.id = 'xcbb-hint';
        document.body.appendChild(hint);
      }
      hint.textContent = pickMode === 'template'
        ? '点击任意一条评论将其设为模板(再次点击按钮退出)'
        : '点击任意一条评论, 取其昵称(显示名)加入名单(再次点击按钮退出)';
    } else if (hint) hint.remove();
  }
  document.addEventListener('click', (e) => {
    if (!pickMode) return;
    const article = e.target.closest('article[data-testid="tweet"]');
    if (!article) return;
    e.preventDefault();
    e.stopPropagation();
    if (pickMode === 'template') {
      getTweetTextFull(article).then((t) => addTemplate(t));
      return;
    }
    const author = getAuthorInfo(article);
    addBadname(author.name || author.handle, author.handle);
  }, true);

  /* ---- 事件绑定 ---- */
  el('xcbb-pick').addEventListener('click', () => setPickMode('template'));
  el('xcbb-pick-name').addEventListener('click', () => setPickMode('username'));
  el('xcbb-clear-names').addEventListener('click', () => {
    if (!badnames.length) return;
    if (confirm('清空全部用户名名单?')) { badnames = []; saveBadnames(); renderBadnames(); }
  });
  el('xcbb-clear-tpl').addEventListener('click', () => {
    if (!templates.length) return;
    if (confirm('清空全部模板评论?')) { templates = []; saveTemplates(); renderTemplates(); }
  });
  el('xcbb-manual').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const v = el('xcbb-manual').value.trim();
      if (v) { addTemplate(v); el('xcbb-manual').value = ''; }
    }
  });
  el('xcbb-manual-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const v = el('xcbb-manual-name').value.trim();
      if (v) { addBadname(v); el('xcbb-manual-name').value = ''; }
    }
  });
  el('xcbb-manual-freq').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const v = el('xcbb-manual-freq').value.trim();
      if (v) { addBadname(v); el('xcbb-manual-freq').value = ''; }
    }
  });
  el('xcbb-freq-all').addEventListener('click', () => {
    const items = computeFreq();
    if (!items.length) return;
    let added = 0;
    for (const [token] of items) {
      if (!badnames.some((en) => en.d.toLowerCase() === token.toLowerCase())) {
        badnames.push({ d: token, h: null });
        added++;
      }
    }
    if (added) { saveBadnames(); renderBadnames(); log(`✔ 已批量加入 ${added} 个高频特征词`); }
    else log('ℹ 高频特征词都已存在于名单中');
  });
  el('xcbb-freq-clear').addEventListener('click', () => {
    if (!corpus.length) return;
    if (confirm('清空已确认账号语料? (不影响名单本身)')) { corpus = []; saveCorpus(); renderFreq(); }
  });
  el('xcbb-builtin').addEventListener('click', loadBuiltin);
  el('xcbb-export').addEventListener('click', () => showExportModal(exportData(), '导出全部(模板评论/语料/名单) — 复制后发给作者生成规则'));
  el('xcbb-export-tpl').addEventListener('click', () => showExportModal(exportTemplates(), '模板评论导出 — 复制保存/分享'));
  el('xcbb-clean-tpl').addEventListener('click', cleanInvalidTemplates);
  el('xcbb-json-download').addEventListener('click', downloadJson);
  el('xcbb-json-import').addEventListener('click', () => el('xcbb-json-file').click());
  el('xcbb-json-file').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) importJsonFile(f);
    e.target.value = '';
  });
  el('xcbb-remote-pull').addEventListener('click', pullRemoteJson);
  el('xcbb-blocklog-export').addEventListener('click', downloadBlocklog);
  el('xcbb-blocklog-clear').addEventListener('click', () => {
    if (!blocklog.length) return;
    if (confirm('清空全部屏蔽记录? (不影响已屏蔽的账号)')) {
      blocklog = [];
      saveBlocklog();
      renderBlocklog();
      log('✔ 屏蔽记录已清空');
    }
  });
  el('xcbb-autosync').addEventListener('change', (e) => {
    settings.autoSync = e.target.checked;
    saveSettings();
  });
  el('xcbb-import-toggle').addEventListener('click', () => {
    const area = el('xcbb-import-area');
    if (area.classList.contains('hidden')) {
      area.classList.remove('hidden');
      el('xcbb-import-toggle').textContent = '执行导入';
      return;
    }
    const v = area.value.trim();
    if (!v) { log('ℹ 粘贴内容为空'); return; }
    let n = 0;
    for (const line of v.split(/\n+/)) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const m = t.match(/^(.+?)\s*\|\s*@?([\w_]+)$/);
      if (m) { addBadname(m[1].trim(), m[2], true); n++; }
      else { addBadname(t, null, true); n++; }
    }
    log(`✔ 导入完成, 共处理 ${n} 行`);
    area.classList.add('hidden');
    area.value = '';
    el('xcbb-import-toggle').textContent = '导入';
  });
  el('xcbb-thr').addEventListener('input', (e) => {
    settings.threshold = parseFloat(e.target.value);
    saveSettings();
    updateUI();
  });
  el('xcbb-autoblock').addEventListener('change', (e) => {
    settings.autoBlock = e.target.checked;
    saveSettings();
  });
  el('xcbb-confirm').addEventListener('change', (e) => {
    settings.confirmEach = e.target.checked;
    saveSettings();
  });
  el('xcbb-contain').addEventListener('change', (e) => {
    settings.containMatch = e.target.checked;
    saveSettings();
  });
  el('xcbb-commentkw').addEventListener('change', (e) => {
    settings.commentKeywords = e.target.checked;
    saveSettings();
  });
  el('xcbb-silent').addEventListener('change', (e) => {
    settings.silentBlock = e.target.checked;
    saveSettings();
  });
  el('xcbb-white').addEventListener('change', (e) => {
    settings.whitelist = e.target.value;
    saveSettings();
  });
  el('xcbb-comment-kws').addEventListener('change', (e) => {
    commentKws = String(e.target.value || '').split(/[\n,，\s]+/).map((s) => s.trim()).filter(Boolean);
    saveCommentKws();
    if (!commentKws.length) log('ℹ 评论关键词列表已清空(内置低风险词仍生效)');
  });
  const bindNum = (id, key, min, max) => {
    el(id).addEventListener('change', (e) => {
      const v = parseInt(e.target.value, 10);
      if (!Number.isFinite(v) || v < min || v > max) { updateUI(); return; }
      settings[key] = v;
      saveSettings();
    });
  };
  bindNum('xcbb-opt-blockdelay', 'blockDelayMs', 200, 10000);
  bindNum('xcbb-opt-scrolldelay', 'scrollDelayMs', 200, 10000);
  bindNum('xcbb-opt-maxrounds', 'maxRounds', 1, 500);
  bindNum('xcbb-opt-idlerounds', 'idleStopRounds', 1, 20);
  el('xcbb-dock').addEventListener('change', (e) => {
    settings.dockPos = e.target.value;
    saveSettings();
    applyDock();
  });
  el('xcbb-run').addEventListener('click', tryStartScan);
  el('xcbb-stop').addEventListener('click', () => {
    if (!running) { toast('当前没有进行中的扫描'); return; } // 不可用时点击→提示原因
    stopFlag = true;
    log('⏹ 正在停止…');
  });
  function restorePanel() {
    panel.classList.remove('xcbb-collapsed');
    panel.style.left = '';
    panel.style.top = '';
    panel.style.right = '';
    panel.style.transform = '';
    panel.title = ''; // 清除圆点操作提示
    settings.panelCollapsed = false; // 记忆展开状态
    saveSettings();
  }

  /* ---- 圆点停靠位置 ---- */
  function applyDock() {
    panel.classList.toggle('xcbb-dock-top', settings.dockPos === 'top');
    panel.classList.toggle('xcbb-dock-center', settings.dockPos === 'center');
    panel.classList.toggle('xcbb-dock-bottom', settings.dockPos === 'bottom');
  }
  // 右上角轻量通知: 单元素+内部节点一次性创建, 之后仅更新文本(零DOM分配复用)
  function notify(title, body, type, duration) {
    let n = $('#xcbb-notify');
    if (!n) {
      n = document.createElement('div');
      n.id = 'xcbb-notify';
      n._title = document.createElement('div');
      n._title.className = 'xcbb-notify-title';
      n._body = document.createElement('div');
      n._body.className = 'xcbb-notify-body';
      n.appendChild(n._title);
      n.appendChild(n._body);
      document.body.appendChild(n);
    }
    n.className = 'show ' + (type || 'success');
    n._title.textContent = title;
    n._body.textContent = body;
    // 右上角定位: 面板/圆点在顶部时通知放到其下方, 避免遮挡
    const r = panel.getBoundingClientRect();
    const inFull = panel.classList.contains('xcbb-full');
    let top = 8;
    if (!inFull && r.top < 120 && r.bottom < window.innerHeight - 40) {
      top = r.bottom + 8; // 面板在顶部时通知放到面板下方
    } else if (inFull) {
      top = 48; // 全高模式放到标题栏下方, 不遮挡 ⚙/🗕
    }
    n.style.top = Math.max(8, top) + 'px';
    clearTimeout(n._timer);
    n._timer = setTimeout(() => n.classList.remove('show'), duration || 5000);
    n.onclick = () => n.classList.remove('show');
  }
  function toast(msg) {
    notify(msg, '', 'info', 2200);
  }
  // 统一扫描入口: 运行中给出进行中通知(右上角, ~3s), 避免重复扫描
  function tryStartScan() {
    if (running) {
      notify('⏳ 扫描进行中', '请稍候, 无需重复操作', 'info', 3000);
      return;
    }
    runScan();
  }

  // 扫描完成通知(非模态, 右上角浅绿, ~3s)
  function showScanResult() {
    notify('✅ 扫描完成', `封禁 ${statBlocked} 个账号 · 扫描 ${statScanned} · 疑似 ${statMatched}`, 'success', 3000);
  }
  el('xcbb-min').addEventListener('click', () => {
    // 收起前清掉拖拽偏移, 让圆点停靠屏幕右侧垂直居中
    panel.style.left = '';
    panel.style.top = '';
    panel.style.right = '';
    panel.classList.remove('xcbb-full'); // 退出全高模式
    logEl.classList.add('hidden');
    el('xcbb-log-chevron').textContent = '▸';
    panel.classList.add('xcbb-collapsed');
    applyDock();
    panel.title = '左键: 开始扫描 | 右键: 主界面'; // 圆点操作提示
    settings.panelCollapsed = true; // 记忆收起状态
    saveSettings();
  });
  panel.addEventListener('click', (e) => {
    // 选取模式下点击其他任何按钮 → 自动退出选取(选取内容在点击时已保存)
    const btn = e.target.closest('button');
    if (pickMode && btn && btn.id !== 'xcbb-pick' && btn.id !== 'xcbb-pick-name') {
      setPickMode(null);
      log('✔ 已自动退出选取模式');
    }
    // 停靠圆点: 左键 = 直接开始扫描(不展开面板; 圆点显示进度, 完成后通知)
    if (panel.classList.contains('xcbb-collapsed') && !e.target.closest('#xcbb-min')) {
      tryStartScan();
    }
  });
  // 停靠圆点: 右键 = 恢复主界面(初始矩形页: 快速选择/日志/选取按钮)
  panel.addEventListener('contextmenu', (e) => {
    if (panel.classList.contains('xcbb-collapsed')) {
      e.preventDefault();
      restorePanel();
      showSettings(false);
    }
  });
  el('xcbb-log-clear').addEventListener('click', () => { logEl.innerHTML = ''; });
  el('xcbb-log-head').addEventListener('click', (e) => {
    if (e.target.closest('#xcbb-log-clear') || e.target.closest('#xcbb-log-export')) return; // 清空/导出按钮不触发切换
    const isFull = panel.classList.contains('xcbb-full');
    if (isFull) {
      panel.classList.remove('xcbb-full');
      logEl.classList.add('hidden');
      el('xcbb-log-chevron').textContent = '▸';
    } else {
      panel.classList.add('xcbb-full');
      logEl.classList.remove('hidden');
      logEl.scrollTop = logEl.scrollHeight; // 展开时定位到最新
      el('xcbb-log-chevron').textContent = '▾';
    }
    unread = 0;
    el('xcbb-log-badge').classList.add('hidden');
  });
  el('xcbb-settings-btn').addEventListener('click', () => showSettings(true));
  el('xcbb-back').addEventListener('click', () => showSettings(false));

  /* ---- 拖拽 ---- */
  (() => {
    const header = el('xcbb-header');
    let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
    header.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      const r = panel.getBoundingClientRect();
      ox = r.left; oy = r.top;
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      panel.style.left = (ox + e.clientX - sx) + 'px';
      panel.style.top = (oy + e.clientY - sy) + 'px';
      panel.style.right = 'auto';
    });
    document.addEventListener('mouseup', () => { dragging = false; });
  })();

  /* ---- 主界面 / 设置页切换 ---- */
  function showSettings(on) {
    if (on) {
      panel.classList.add('xcbb-full'); // 设置页默认全高
    } else {
      panel.classList.remove('xcbb-full');
      logEl.classList.add('hidden'); // 返回主界面时日志回到默认折叠态
      el('xcbb-log-chevron').textContent = '▸';
      unread = 0;
      el('xcbb-log-badge').classList.add('hidden');
    }
    el('xcbb-settings').classList.toggle('hidden', !on);
    el('xcbb-main').classList.toggle('hidden', on);
    if (on) switchTab(currentTab);
  }

  /* ---- 设置页 Tab 切换 ---- */
  let currentTab = 'tpl';
  function switchTab(tab) {
    currentTab = tab;
    for (const btn of document.querySelectorAll('#xcbb-tabbar .xcbb-tab')) {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    }
    for (const t of ['tpl', 'names', 'freq', 'data', 'opt']) {
      el('xcbb-panel-' + t).classList.toggle('hidden', t !== tab);
    }
    if (tab === 'tpl') renderTemplates();
    else if (tab === 'names') renderBadnames();
    else if (tab === 'freq') renderFreq();
    else if (tab === 'data') renderBlocklog();
  }
  for (const b of document.querySelectorAll('#xcbb-tabbar .xcbb-tab')) {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  }

  /* ---- 日志导出(发给作者生成补充规则) ---- */
  function exportLog() {
    const lines = [];
    lines.push(`# X 评论机器人屏蔽器 日志导出 ${new Date().toLocaleString()}`);
    for (const div of logEl.children) lines.push(div.textContent);
    return lines.join('\n');
  }
  el('xcbb-log-export').addEventListener('click', () => {
    showExportModal(exportLog(), '日志导出 — 复制后发给作者, 作者据此生成补充规则 JSON');
  });

  /* ---- 数据概览 ---- */
  function updateOverview() {
    el('xcbb-ov-tpl').textContent = templates.length;
    el('xcbb-ov-names').textContent = badnames.length;
    el('xcbb-ov-corpus').textContent = corpus.length;
    el('xcbb-ov-blocked').textContent = totals.blocked;
    el('xcbb-ov-sync').textContent = totals.lastSync || '从未';
  }

  /* ---- 状态刷新 ---- */
  function updateUI() {
    el('xcbb-thr').value = settings.threshold;
    el('xcbb-thr-val').textContent = settings.threshold.toFixed(2);
    el('xcbb-autoblock').checked = settings.autoBlock;
    el('xcbb-confirm').checked = settings.confirmEach;
    el('xcbb-contain').checked = settings.containMatch;
    el('xcbb-commentkw').checked = settings.commentKeywords;
    el('xcbb-silent').checked = settings.silentBlock;
    el('xcbb-white').value = settings.whitelist;
    el('xcbb-comment-kws').value = commentKws.join('\n');
    el('xcbb-remote-url').value = settings.remoteUrl || '';
    el('xcbb-autosync').checked = settings.autoSync;
    el('xcbb-scan').textContent = statScanned;
    el('xcbb-match').textContent = statMatched;
    el('xcbb-block').textContent = statBlocked;
    el('xcbb-total').textContent = totals.blocked;
    el('xcbb-opt-blockdelay').value = settings.blockDelayMs;
    el('xcbb-opt-scrolldelay').value = settings.scrollDelayMs;
    el('xcbb-opt-maxrounds').value = settings.maxRounds;
    el('xcbb-opt-idlerounds').value = settings.idleStopRounds;
    el('xcbb-dock').value = settings.dockPos;
    updateOverview();
    // 禁用改用类实现(保留点击→提示不可用原因); title 悬停提示
    el('xcbb-run').classList.toggle('xcbb-disabled', running);
    el('xcbb-run').title = running ? '扫描进行中, 请稍候' : '开始扫描评论区';
    el('xcbb-stop').classList.toggle('xcbb-disabled', !running);
    el('xcbb-stop').title = !running ? '当前没有进行中的扫描' : '停止当前扫描';
    const st = el('xcbb-status');
    st.textContent = running ? '扫描中…' : '待机';
    st.style.color = running ? '#a3741f' : '';
    // 圆点扫描计数徽标(仅收起且扫描中显示)
    const pc = el('xcbb-pill-count');
    if (pc) {
      pc.textContent = statScanned;
      pc.classList.toggle('hidden', !(running && panel.classList.contains('xcbb-collapsed')));
    }
  }

  const VER = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) || '0.14.4';
  el('xcbb-ver').textContent = 'v' + VER;
  // 日志默认折叠(平时只看统计; 有新内容时显示未读角标)
  logEl.classList.add('hidden');
  el('xcbb-log-chevron').textContent = '▸';
  // 状态记忆: 上次收起则默认收起为圆点
  if (settings.panelCollapsed) {
    panel.classList.add('xcbb-collapsed');
    applyDock();
  }
  // 启动自动同步(延迟 3s 避开页面加载高峰; 仅内容变化时合并)
  if (settings.autoSync && settings.remoteUrl) {
    setTimeout(() => fetchRemoteJson('auto'), 3000);
  }
  // Tampermonkey 菜单命令(点 TM 图标 → 脚本名 → 菜单; 精简为两项, 其余功能在面板内)
  try {
    GM_registerMenuCommand('⚡ 快速扫描', () => {
      // 保持当前面板状态: 收起时=圆点直扫(进度环+通知), 展开时=面板统计; 不强制展开矩形面板
      tryStartScan();
    });
    GM_registerMenuCommand('⚙ 进入设置', () => { restorePanel(); showSettings(true); });
  } catch (e) { /* 非 Tampermonkey 环境时忽略 */ }
  renderTemplates();
  renderBadnames();
  renderFreq();
  updateUI();
  log('✔ 脚本已加载。可选取 bot 评论作为模板, 或点 [+ 选取用户] 抓取其昵称; 两者命中其一即屏蔽。');
  if (!badnames.length) log('💡 名单为空 — 可在 ⚙设置→数据 拉取 Gist 同步, 或点 [内置] 加载基线规则');
  log('⚠ 启发式规则可能误封正常用户 — 建议先用“仅标记”(取消勾选自动屏蔽)试跑一遍; 若误封, 可在 ⚙设置→数据→近期屏蔽记录 中解封并加白。');
})();
