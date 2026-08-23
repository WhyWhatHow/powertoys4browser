# X Comment Bot Blocker

X Comment Bot Blocker (X 评论机器人屏蔽器) is a userscript that scans the reply section of the tweet you are reading for bot/spam accounts and blocks them automatically. A hit on **any** of the following dimensions marks an account:

- **Template comments** — reply text similar to a bot template comment you picked (character-bigram Jaccard + Levenshtein + containment matching, adjustable threshold)
- **Username rules** — suspicious nickname/@handle entries, including `/regex/` entries
- **Comment keywords** — optional; reply text containing a keyword hits (off by default to avoid false positives)

It ships with built-in rule templates (porn/gambling-scam promotion words, low/medium risk tiers), frequent-token mining from confirmed spam accounts, a block log with one-click unblock, whitelist support, dry-run mode, full data export/import and Gist sync.

> ⚠️ **Warning: false positives are possible.** The script relies on heuristic rules (text similarity / username keywords), which can never be 100% accurate — normal users may get blocked by mistake.
>
> - First run: uncheck **Auto** and use mark-only (dry-run) mode to review what would be blocked
> - Avoid overly broad keywords (e.g. "免费", "资源"); prefer high-specificity templates
> - If someone gets blocked by mistake: ⚙ Settings → Data → Recent block log → open their profile to unblock, or add them to the whitelist
> - Use auto-block with care; the authors are not responsible for wrongful blocks

## Installation

To use X Comment Bot Blocker, you need to install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/). After installing the userscript manager, click [`here`](https://raw.githubusercontent.com/WhyWhatHow/powertoys4browser/master/js/x-comment-bot-blocker.user.js) to install the userscript.

- Works on `x.com` and `twitter.com`
- Current version: **v0.14.5**

## Demo

Scan the replies, flag suspicious accounts, then block them — watch it in action:

<video controls width="720">
  <source src="../assets/x-comment-blcoker.mp4" type="video/mp4">
</video>

[⬇ Download MP4](../assets/x-comment-blcoker.mp4)

## Usage

After installing, open any X post page:

1. Click **＋ 选取评论** (pick comment) then click a bot reply to add it as a template, or click **＋ 选取用户** (pick user) to add its author's nickname/handle to the rule list
2. Click **▶ 扫描** (scan): the script scrolls the replies, evaluates each comment against templates / username rules / keywords, and silently blocks matched accounts via X's own block menu (or just highlights them in dry-run mode)
3. Adjust the similarity threshold slider; enable **自动** (auto) only after reviewing dry-run results

The floating panel collapses into a dot (click = quick scan, right-click = reopen). Logs, stats and settings live inside the panel; Tampermonkey menu offers quick scan/settings entries.

## Safety Features

| Feature | Purpose |
| --- | --- |
| Dry-run mode (**仅标记**) | Mark hits without blocking, until you trust the rules |
| Block log | Every block is recorded with reason & time; one-click unblock / whitelist |
| Whitelist | Accounts never scanned/blocked |
| Per-block confirm | Optional confirmation dialog before each block |
| Owner protection | The tweet's author and whitelisted handles are never touched |
| Rate limiting | Configurable delay between blocks to avoid risk control |

## Data

All data (templates, rules, corpus, block log) stays in local userscript storage. Export/import as JSON from ⚙ Settings → Data; an optional remote Gist URL can sync rule updates automatically.

## Changelog

- **v0.14.5** — Full English metadata (`@description:en`): three-way matching, dry-run mode, block log, false-positive warning.
- **v0.14.4** — Vendored into powertoys4browser; prominent false-positive warnings added (header notice, panel banner, startup log); install URLs point to this repo.
- Upstream: [kikuxdev/X-Comment-Bot-Blocker](https://github.com/kikuxdev/X-Comment-Bot-Blocker) (v0.14.3).
