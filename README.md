# Agent 实操课 · 第 1 课：给 AI 写一份不啰嗦、真能拦住事故的规则仓库

> **Dream Bridge Lab / 梦梁造物 — Agent Practical Course · Lesson 01 Starter Kit**
>
> Zero dependencies · Cross-platform (Windows / macOS / Linux, Node >= 18) · MIT Licensed

一份面向小白的开箱即用对照模板，演示如何把 **343 行臃肿的 `CLAUDE.md`** 拆成 **44 行清爽常驻规则 + 按需加载 Skill + 零依赖硬门禁 Hook**，单次启动直接省下 **87.1% Token**，并用程序而不是“求求你别碰 `.env`”来兜底安全。

A beginner-friendly, runnable before/after starter kit showing how to turn a **343-line bloated `CLAUDE.md`** into a **44-line always-on rules file + on-demand Skills + deterministic zero-dependency Hook**, cutting per-session boot tokens by **87.1%**.

---

## 一张表看懂 4 层架构 / The 4-Layer Architecture

| 层级 / Layer | 核心文件 / Artifact | 大白话类比 / Plain-Language Analogy | 何时加载 / When Loaded | 核心原则 / Golden Rule |
| :--- | :--- | :--- | :--- | :--- |
| **1. 常驻规则** | `CLAUDE.md` / `AGENTS.md` | **口袋常驻（<100 行）** — 随身小卡片，每轮对话都在口袋里 | 每次启动必读 (Always-on) | 只写技术栈、常用命令、红线和 Skill 指针，**不超过 100 行** |
| **2. 按需技能** | `.claude/skills/*/SKILL.md` | **抽屉按需翻** — 平时关着，做 CR 或修 Bug 才拉开 | 命中任务才读 (On-demand, 0 boot tokens) | 把代码审查、排障 SOP、发布流程放进抽屉 |
| **3. 门禁钩子** | `hooks/*.mjs` + `settings.json` | **门禁硬拦截** — 刷卡过闸机，不靠嘴劝 | 工具调用前强制执行 (Deterministic) | `.env` / 密钥等红线用 `exit 2` 硬拦截，绝不靠“请不要” |
| **4. 子智能体** | Subagent | **助手隔离干重活** — 脏活累活单独开间房干完只交摘要 | 需要大范围扫描/跑长日志时 | 隔离噪音，不污染主对话上下文 |

---

## 30 秒本地体验 / 30-Second Quickstart

前置条件 / Prerequisite: **Node.js >= 18**（零 `npm install`，无需 `jq`，Windows / macOS / Linux 通用）。

### 1. 克隆或进入本目录 / Clone & enter the repo

```bash
git clone <this-repo-url>
cd starter-repo
```

### 2. 运行规则体检脚本 / Run the rules auditor

```bash
# 体检改造前（反例）/ Audit the bloated anti-pattern
node scripts/audit-rules.mjs before-bloated

# 体检改造后（推荐模板）/ Audit the clean 4-layer setup
node scripts/audit-rules.mjs after-clean

# 一键对比改造前后省了多少 Token / Compare before vs. after directly
node scripts/audit-rules.mjs before-bloated after-clean
```

### 3. 实测门禁 Hook 拦截 `.env` / Test the safety hook locally

**macOS / Linux / Git Bash:**
```bash
# 拦截 .env（预期输出 [HOOK BLOCKED]，退出码 2）
echo '{"tool_input":{"file_path":".env"}}' | node after-clean/hooks/block-sensitive-files.mjs; echo "exit=$?"

# 放行普通源码（预期静默通过，退出码 0）
echo '{"tool_input":{"file_path":"src/app.ts"}}' | node after-clean/hooks/block-sensitive-files.mjs; echo "exit=$?"
```

**Windows PowerShell:**
```powershell
# 拦截 .env（预期输出 [HOOK BLOCKED]，exit=2）
'{"tool_input":{"file_path":".env"}}' | node after-clean/hooks/block-sensitive-files.mjs; "exit=$LASTEXITCODE"

# 拦截 Windows 路径下的 .env.local（自动标准化反斜杠，exit=2）
'{"tool_input":{"file_path":"C:\\project\\.env.local"}}' | node after-clean/hooks/block-sensitive-files.mjs; "exit=$LASTEXITCODE"

# 放行普通源码（预期静默通过，exit=0）
'{"tool_input":{"file_path":"src/app.ts"}}' | node after-clean/hooks/block-sensitive-files.mjs; "exit=$LASTEXITCODE"
```

---

## 实测对比数据 / Real Before vs. After Benchmark

以下数据由 `node scripts/audit-rules.mjs before-bloated after-clean` 实跑产出（Token 估算采用透明启发式：中文约 `1.5` token/字，英文/ASCII 约 `1/4` token/字符）：

| 指标 / Metric | `before-bloated/`（改造前） | `after-clean/`（改造后） | 变化 / Savings |
| :--- | :---: | :---: | :---: |
| **启动必读文件** | `before-bloated/CLAUDE.md` | `after-clean/CLAUDE.md` | — |
| **启动行数 (Lines)** | `343` 行 | `44` 行 | **-299 行 (-87.2%)** |
| **启动字符数 (Chars)** | `22,136` | `2,857` | **-19,279 (-87.1%)** |
| **单次启动估算 Token** | `~5,534` tokens/session | `~715` tokens/session | **-4,819 tokens (-87.1%)** |
| **按需 Skill 卸载量** | `0` | `2` 个（`~621` tokens，启动 `0` 消耗） | 仅做对应任务时加载 |
| **跨工具通用版 (`AGENTS.md`)** | 无 | `43` 行 / `~701` tokens | 适配 Codex / Cursor / Gemini CLI |
| **安全门禁 Hook** | 无（全靠文字求饶） | `block-sensitive-files.mjs` | `exit 2` 确定性硬拦截 |
| **体检结果 / Verdict** | `BLOATED` | `PASS` | — |

---

## 复制到你自己的项目 / Copy Into Your Own Project

只需把 `after-clean/` 里的文件复制到你的项目根目录，并按需替换技术栈和命令即可：

1. **Claude Code 用户**：保留 `CLAUDE.md`、`.claude/skills/`、`hooks/block-sensitive-files.mjs`，并将 `.claude/settings.example.json` 复制为 `.claude/settings.json`。
2. **Codex / Cursor / Gemini CLI 用户**：保留 `AGENTS.md`（与 `CLAUDE.md` 同口径的跨工具标准版）和 `.claude/skills/`。
3. **体检你自己的仓库**：
   ```bash
   node scripts/audit-rules.mjs /path/to/your-project
   ```

---

## 仓库结构 / Repository Structure

```text
starter-repo/
├── LICENSE                                      # MIT License (Dream Bridge Lab)
├── README.md                                    # 本说明文档
├── scripts/
│   └── audit-rules.mjs                          # 零依赖规则体检 & Token 对比脚本
├── before-bloated/
│   └── CLAUDE.md                                # 343 行反例：把所有 SOP 与规范塞进一个文件
└── after-clean/
    ├── CLAUDE.md                                # 44 行常驻规则（Claude Code）
    ├── AGENTS.md                                # 43 行跨工具通用规则（Codex/Cursor/Gemini CLI）
    ├── hooks/
    │   └── block-sensitive-files.mjs            # 零依赖跨平台门禁脚本（拦截 .env/密钥，exit 2）
    └── .claude/
        ├── settings.example.json                # Hook 挂载配置示例
        └── skills/
            ├── code-review/SKILL.md             # 按需加载：代码审查清单
            └── bug-fix/SKILL.md                 # 按需加载：先复现再修复 3 步 SOP
```

---

## License

MIT © 2026 Dream Bridge Lab / 梦梁造物. See [LICENSE](./LICENSE).
