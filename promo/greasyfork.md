# 🛒 GreasyFork 发布素材包

> GreasyFork 是油猴脚本的主分发渠道:自带搜索流量、安装统计、评分与更新推送。
> 官方要求速记:`@name` / `@description` / `@namespace` 必填; 多语言用 `@name:XX` / `@description:XX`;
> 发布时需遵守版权(描述中写明灵感来源/移植对象即可, 两个脚本均为独立实现, MIT)。
> 完整字段说明: https://greasyfork.org/zh-CN/help/meta-keys

---

## 一、Minimal Twitter

### 标题与描述(提交表单用)

**Script name (名称):** `Minimal Twitter — Clean & Minimal Theme for X/Twitter`

**Description (摘要, 显示在名称下方, 两行以内):**

> Refine and clean up the Twitter/X interface: icon-only left navigation (labels on hover), timeline width control, per-item nav visibility switches (Premium, Creator Studio, Grok, Jobs…), Grok-safe layout fixes, built-in settings panel with 简体中文 / 繁體中文 / English, custom CSS injection. A lightweight userscript port of the Typefully "Minimal Twitter" Chrome extension. MIT licensed, free.

**中文描述(供 @description:zh 使用):**

> 为 X/Twitter 打造极简主题:图标化左侧导航(悬停显示标签)、时间线限宽、Premium/Grok/Creator Studio 等导航项逐项显隐、Grok 页面零干扰、内置中/英/繁三语设置面板、自定义 CSS 注入。Typefully 同名 Chrome 插件的轻量油猴翻版, MIT 开源免费。

### 脚本内元数据现状(已达标)

| 字段 | 值 | 备注 |
| --- | --- | --- |
| `@name` / `@description` | 英文完整版 | ✅ 已含英文 |
| `@namespace` | https://github.com/WhyWhatHow/ | ✅ |
| `@version` | 1.0.18 | ✅ 更新即推送 |
| `@homepage` / `@supportURL` | 仓库地址 | ✅ |
| `@updateURL` / `@downloadURL` | raw.githubusercontent.com | ✅ 提交后自动更新 |

### 标签(发布时勾选/填写)

`twitter` `x.com` `minimal` `theme` `interface`

### 截图规格

- GreasyFork 无强制尺寸,社区惯例用 **640×400 (16:10) 横图**,上传 3-5 张
- 建议清单:
  1. **图标化左侧导航 + 时间线效果**(有真实截图就用真实截图, 比海报转化好)
  2. 设置面板(中文界面)
  3. 海报图兜底(现成的 `../promo/poster-minimal-twitter.png` 改 640×400 可用)

---

## 二、X Comment Bot Blocker

### 标题与描述(提交表单用)

**Script name (名称):** `X Comment Bot Blocker — 评论区机器人屏蔽器`

**Description (摘要):**

> Scan a tweet's replies and auto-block spam/bot accounts: pick one bot template comment (or a suspicious username), the script matches every reply by text similarity, username rules and comment keywords, then blocks matches through X's own UI. Built-in high-frequency spam rule templates, whitelist, dry-run mark-only mode, block log with one-click unblock + export, full JSON data export/import and Gist sync. ⚠ Heuristic rules may false-positive normal users — review hits in dry-run mode first.

**中文描述(供 @description:zh 使用):**

> 选取"机器人模板评论"或可疑用户名,一键扫描当前推文评论区,文本相似/用户名/评论关键词三维匹配,自动屏蔽 bot 与引流号。内置高频垃圾规则模板、白名单、试运行(仅标记)模式、屏蔽记录一键解封与导出、JSON 全量导出与 Gist 同步。⚠ 启发式规则可能误封正常用户,请先试运行。

### 脚本内元数据现状(已达标)

| 字段 | 值 | 备注 |
| --- | --- | --- |
| `@name` / `@name:en` | 中文名 + 英文名 | ✅ |
| `@description` / `@description:en` | 中英文完整版 | ✅ 本次已补全英文 |
| `@namespace` | xcbb | ✅ |
| `@version` | 0.14.4 | ✅ |
| `@homepage` / `@supportURL` | 仓库地址 | ✅ 本次已加 |
| `@updateURL` / `@downloadURL` | raw.githubusercontent.com | ✅ 指向本仓库 |
| 版权备注 | 上游 kikuxdev/X-Comment-Bot-Blocker | ✅ @author 保留 |

### 标签

`twitter` `x.com` `spam` `block` `bot` `comment`

### 截图规格

同 Minimal Twitter:640×400, 3-5 张:
1. 面板主界面(扫描统计 + 日志)
2. 扫描结果(命中高亮/已屏蔽的评论区)
3. ⚙ 数据页(屏蔽记录列表 — 展示"可解封"卖点)
4. 海报图兜底

---

## 三、发布前清单(两个脚本通用)

- [ ] 推送最新代码到 GitHub master(`@updateURL` 拉取生效)
- [ ] 用 raw 链接各自安装一遍,验证可运行
- [ ] GreasyFork 上传,勾选 "接受规则" 类目(脚本类目: `twitter` / `x.com`)
- [ ] 填写附加说明页(可贴 README 链接 + 海报图)
- [ ] 截图 640×400 各 3-5 张(真实界面优先)
- [ ] 发布后在 GreasyFork 页面上补一句中文备注(可选): 感谢安装, 反馈请走 GitHub issues
- [ ] 记录两个脚本的 GreasyFork 页面 URL, 回填到 README 安装段落(提升仓库可信度)
---

## 四、X Comment Bot Blocker — 附加信息(最终版, 直接粘贴)

```
Scan a tweet's reply section and auto-block spam/bot accounts by picking
one bot template comment or a suspicious username.

▸ How it works
- Three-way matching: text similarity / username rules / comment keywords
- Blocks via X's own UI (menu → Block → confirm), no internal APIs
- Built-in high-frequency spam rule templates (one-click load)
- Whitelist, adjustable similarity threshold, per-block confirm
- Rate limiting (configurable block interval)

▸ ⚠ Read before enabling auto-block
Heuristic rules are NOT 100% accurate — normal users' nicknames or comments
can be matched by mistake. Please:
1. Run in "mark-only (dry-run)" mode first and review the hits
2. Avoid overly broad keywords; prefer specific template comments
3. Wrongly blocked someone? ⚙ Settings → Data → block log → open their
   profile to unblock, or add them to the whitelist
4. Auto-blocking may violate X ToS; use at your own risk

▸ Data
Everything stays local (GM storage). Export/import JSON; optional Gist sync.

▸ Recent changes
- v0.14.5  Full English metadata (@description:en)
- v0.14.4  Vendored into PowerToys4Browser; false-positive warnings
- v0.14.3  Public stable gist as default remote data source
- v0.14.0  Block log: record reason/time, one-click unblock + whitelist
- v0.13.0  Keyword matching isolated from username list (fewer false hits)
- v0.12.0  Three-way matching + settings panel

Full changelog: https://github.com/WhyWhatHow/powertoys4browser/blob/master/doc/x-comment-bot-blocker.md

Feedback & issues: https://github.com/WhyWhatHow/powertoys4browser/issues
Source: https://github.com/WhyWhatHow/powertoys4browser
```

---

## 五、X Comment Bot Blocker — 更新日志(完整版, 存档)

> 源:上游 CHANGELOG.md + 本仓库记录。格式遵循 Keep a Changelog 精神, 版本号遵循 SemVer。

### 0.14.5 (2026-08)
- 补全 `@description:en` 英文元数据(三维匹配/试运行/屏蔽记录/误封警告)。

### 0.14.4 (2026-08)
- 收录进 powertoys4browser;新增 4 处误封提醒(元数据、头部 NOTICE 块、面板横幅、启动日志);安装地址指向本仓库;保留上游 kikuxdev 署名。

### 0.14.3 (2026-08-09)
- 内置公开 gist 为默认远程数据源,自动同步开箱即用;私有/secret gist URL 严禁写入脚本(URL 即访问钥匙)。

### 0.14.2 (2026-08-09)
- 屏蔽记录卡片新增独立 [导出] 按钮(blocklog.json);数据页打开时列表实时刷新。

### 0.14.1 (2026-08-09)
- 修复扫描通知条淡出后仍拦截点击(补 pointer-events:none);全高模式下通知下移。

### 0.14.0 (2026-08-09)
- 新增近期屏蔽记录(blocklog):{handle, 昵称, 时间, 命中原因},按 handle 去重、上限 300 条;🏠 跳主页手动解封 / ✓ 一键加白名单 / ✕ 删除 / 清空;随 JSON 导出、Gist 同步、JSON 导入自动携带——误伤处理闭环。

### 0.13.1 (2026-08-09)
- 禁用按钮改类禁用实现:保留点击事件,悬停显示原因,点击 toast 提示。

### 0.13.0 (2026-08-09)
- 修复评论关键词误屏蔽:关键词匹配改为独立列表(内置 63 条低风险词排除 9 个日常常见词),用户名名单只匹配用户名;护眼纸感主题(29 个 CSS 变量)。

### 0.12.14 (2026-08-09)
- 扫描结束二次复核(解决"刷新后才能识别");闲置判定改用页面高度。

### 0.12.x (2026-08-09)
- 0.12.13 扫描进行中通知;0.12.12 异常兜底+去重上限 3 万;0.12.11 修复提前停止/等待全文渲染;0.12.10 菜单快捷扫描保持面板状态;0.12.9 轻量完成通知;0.12.8 修复 grant 缺失;0.12.7 TM 原生菜单+停靠下拉;0.12.6 圆点直扫+进度环+计数徽标;0.12.5/0.12.4 圆点左键/右键交互;0.12.3 静默屏蔽+快捷菜单;0.12.0 三维匹配+五 Tab 设置页+自动同步。
