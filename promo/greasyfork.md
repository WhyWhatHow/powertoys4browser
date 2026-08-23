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