# 📣 PowerToys4Browser 双脚本宣传物料(可直接复制)

> 覆盖两个脚本:**Minimal Twitter**(界面极简)与 **X Comment Bot Blocker**(评论机器人屏蔽)。
> 字数提醒:X 对中日韩字符按 2 字符计(单条上限 280,链接约占 23 字符),中文推文请控制在 **~130 字以内**。
> 链接速查:
> - 仓库:https://github.com/WhyWhatHow/powertoys4browser
> - 安装 Minimal Twitter:https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/minimal-twitter.user.js
> - 安装 X Comment Bot Blocker:https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/x-comment-bot-blocker.user.js

---

# 一、Minimal Twitter(v1.0.18)

## 一句话简介(按场合选)

正式版:

Minimal Twitter:Typefully 同名 Chrome 插件的轻量油猴翻版,为 Twitter/X 打造极简主题,内置可视化设置面板,时间线宽度、左侧导航显隐全部自定义。

口语版:

把 X 界面上的杂物全关掉,只剩内容和一条干净的图标导航。

技术版:

SPA 友好的 X 极简主题油猴脚本:MutationObserver 驱动样式重放,Grok 路由豁免,设置面板中/英/繁三语,GM storage 持久化。

## 卖点标签(海报/长图用)

🧹 极简主题:时间线限宽 · 去杂讯 · 干净排版
🎛 全能开关:Premium / Creator Studio / Grok 抽屉 / 未读角标…想关就关
🖱 图标导航:左侧栏纯图标化,悬停滑出标签,Profile 自动置底
🌍 三语面板:简体中文 / 繁體中文 / English,改完即时生效
🤖 Grok 安全:所有布局修复自动避开 /i/grok,聊天页零干扰
💉 自定义 CSS:面板里直接注入,想怎么改就怎么改

底部条:

Tampermonkey 油猴脚本 · 致敬 Typefully/minimal-twitter · MIT 开源免费 · v1.0.18

## 推文文案(三版选一)

### 文案 A:痛点向

X 的界面是不是越来越挤了?
左边一排 Premium、Grok、Creator Studio,真正用的就那几个。
Minimal Twitter 油猴脚本:图标化左侧导航,悬停才显示标签;时间线限宽去杂讯;每个角落都有开关。
设置面板三语,装上即用:
raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/minimal-twitter.user.js
#油猴 #Tampermonkey

### 文案 B:功能向

一个脚本管住 X 的整个界面:
· 时间线宽度自己定
· 左侧导航逐项显隐(Premium/Grok/Jobs…)
· 标签永不显示/悬停显示/常显三档
· Grok 抽屉、未读角标、发推按钮全可关
· 内置自定义 CSS 注入
Minimal Twitter,开源免费:
raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/minimal-twitter.user.js

### 文案 C:短平快

给 X 做了个"极简模式":
左侧导航缩成图标,时间线限宽,杂物全关。
Typefully 插件的油猴翻版:
raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/minimal-twitter.user.js

---

# 二、X Comment Bot Blocker(v0.14.4)

## 一句话简介(按场合选)

正式版:

X 评论机器人屏蔽器:选取 bot 评论作模板,一键扫描评论区,用户名/文本相似/评论关键词三维匹配,自动屏蔽垃圾账号。

口语版:

评论区里的约炮引流号,一个模板全扫干净。

技术版:

模板驱动 + 三维匹配的 X 评论 bot 屏蔽油猴脚本,UI 自动化屏蔽不碰内部 API,纯本地运行、数据全量导出。

## 卖点标签(海报/长图用)

🎯 三维匹配:用户名 · 文本相似 · 评论关键词,任一命中即处理
🧬 模板驱动:点一条 bot 评论当"通缉令",变体句式也认得
🛡 防误伤闭环:仅标记试运行 / 白名单 / 阈值可调 / 屏蔽记录一键解封
💾 数据主权:JSON 全量导出 + Gist 同步,数据不锁在浏览器
🔇 静默屏蔽:后台模拟真人点击路径,不打断刷推
⚠️ 诚实声明:启发式规则可能误封正常用户,请先试运行再开自动

底部条:

Tampermonkey 油猴脚本 · 纯本地运行 · 上游 kikuxdev/X-Comment-Bot-Blocker · MIT 开源免费 · v0.14.4

## 推文文案(三版选一)

### 文案 A:痛点向

刷 X 评论区,十条回复三条是引流号?
"约炮加微信""同城上门""免费领福利",换个马甲又来。
这个油猴脚本:选一条 bot 评论当模板,一键扫全评论区,用户名/相似度/关键词三维匹配,自动屏蔽。
误伤可追溯解封,纯本地开源:
raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/x-comment-bot-blocker.user.js
#油猴 #Tampermonkey

### 文案 B:诚实向(推荐置顶)

做了个 X 评论 bot 屏蔽器,先说局限:相似度匹配≠语义理解,可能误封正常用户。
所以它内置了防误伤闭环:仅标记试运行 → 确认命中质量再开自动屏蔽;屏蔽记录留痕,误伤一键跳主页解封+加白名单。
三维匹配 + 模板驱动:
raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/x-comment-bot-blocker.user.js

### 文案 C:短平快

评论区全是约炮引流号?
选一条 bot 评论当模板,一键把整片评论区的垃圾号扫干净。
试运行防误伤 · 记录可解封 · 纯本地 · 开源
raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/x-comment-bot-blocker.user.js

---

# 三、合体推文串(thread,6 条)

### 1 —— 开场钩子

给 X 做了两个油猴脚本,一个管"看起来清爽",一个管"评论区干净":
🧹 Minimal Twitter:极简主题 + 导航精简
🤖 X Comment Bot Blocker:评论机器人自动屏蔽
都开源免费,一个仓库全搞定:
github.com/WhyWhatHow/powertoys4browser
#油猴 #Tampermonkey

### 2 —— Minimal Twitter:痛点

X 界面塞得太满:Premium、Jobs、Creator Studio……
Minimal Twitter 把左侧导航缩成图标,悬停出标签;时间线限宽;每个 UI 角落都有独立开关。
设置面板中/英/繁三语,改完即时生效。

### 3 —— Minimal Twitter:技术亮点

不是简单 display:none:
· MutationObserver 驱动,SPA 重渲染后自动重放
· Grok 页面路由豁免,聊天布局零干扰
· GM storage 持久化,刷新不掉配置
Typefully 同名插件的精神续作(油猴版)。

### 4 —— Blocker:痛点 + 用法

再说说评论区:引流号换马甲比换头像还勤。
用法就两步:点一条 bot 评论当模板 → 点扫描。用户名/文本相似度/关键词三维匹配,命中即静默屏蔽。
全程本地运行,不上传任何数据。

### 5 —— Blocker:诚实页

必须坦白的局限:
⚠ 相似≠语义,可能误伤正常用户
⚠ 依赖 X 页面结构,改版可能失效
⚠ 自动屏蔽有账号风险
对策:先用"仅标记"试运行;屏蔽记录留痕可一键解封加白;阈值可调。
工具很能打,但请带脑子用。

### 6 —— 收尾

两个脚本,一个仓库:
🧹 Minimal Twitter v1.0.18 — 界面极简
🤖 X Comment Bot Blocker v0.14.4 — 评论区净化
安装地址与文档:
github.com/WhyWhatHow/powertoys4browser
觉得有用的话,一个 ⭐ 就是最大的鼓励。

---

# 四、海报文案区块(生图用,每块独立复制)

## 🖼 图 1:Minimal Twitter 主视觉

主标题:

把 X 还给内容。

副标题:

图标化左侧导航 · 时间线限宽 · 每个 UI 角落都有开关。

角标:

v1.0.18 · 三语面板 · Grok 安全 

## 🖼 图 2:X Comment Bot Blocker 主视觉

主标题:

评论区垃圾号,一键扫干净。

副标题:

选一条 bot 评论当模板 · 用户名/相似度/关键词三维匹配 · 自动屏蔽。

角标:

试运行防误伤 · 屏蔽记录可解封 · 纯本地 

## 🖼 图 3:组合图(双脚本)

标题:

PowerToys4Browser — 你的 X 体检套装。

两列:

🧹 Minimal Twitter:界面做减法
🤖 Bot Blocker:评论区做清洁

底部条:

github.com/WhyWhatHow/powertoys4browser · MIT · Tampermonkey
