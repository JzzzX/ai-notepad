# AI Notepad - 项目交接文档

## 项目概述

类 Granola 的 AI 会议记录工具 Demo，面向中国市场。
- **仓库**: https://github.com/JzzzX/ai-notepad
- **技术栈**: Next.js 16 + React 19 + Tailwind CSS 4 + Tiptap + Zustand + Prisma + SQLite
- **ASR 选型**: 阿里云智能语音交互（待接入），当前用浏览器 Web Speech API 作为 Demo
- **LLM 选型**: MiniMax（待接入），当前有 Demo 模拟响应

---

## 完成进度

### 已完成

| # | 功能模块 | 状态 | 关键文件 | 说明 |
|---|---------|------|---------|------|
| 1 | 项目初始化 | ✅ | `package.json`, `.env.example` | Next.js 16 + 全部依赖 |
| 2 | 三栏式主页面布局 | ✅ | `app/page.tsx` | 转写面板 / 笔记编辑器 / Chat 面板 + 会议历史侧边栏 |
| 3 | 实时音频转写 | ✅ | `components/AudioRecorder.tsx`, `TranscriptPanel.tsx` | 浏览器 Web Speech API，中文识别 |
| 4 | **Botless 双通道采集** | ✅ | `components/AudioRecorder.tsx` | **Granola 核心特性**：getUserMedia(麦克风) + getDisplayMedia(系统音频)，无 Bot 进入会议 |
| 5 | 说话人分离 | ✅ | `components/TranscriptPanel.tsx`, `SpeakerManager.tsx` | 麦克风→"我"(蓝色) / 系统音频→"对方"(绿色)，可绑定真实姓名 |
| 6 | 双通道音量监测 | ✅ | `components/AudioRecorder.tsx` | AudioContext + AnalyserNode 实时分析两路音频，顶栏音量条 |
| 7 | 富文本笔记编辑器 | ✅ | `components/NoteEditor.tsx` | Tiptap 编辑器，标题/列表/加粗等，边听边记 |
| 8 | AI 融合笔记 | ✅ | `components/EnhancedNotes.tsx`, `app/api/enhance/route.ts` | 转写+手写要点→结构化纪要（当前 Demo 模式，MiniMax API 已预埋） |
| 9 | 会议 Chat | ✅ | `components/ChatPanel.tsx`, `app/api/chat/route.ts` | 基于会议内容问答，流式输出（当前 Demo 模式） |
| 10 | 模版系统 | ✅ | `lib/templates.ts`, `components/ChatPanel.tsx` | 7 个本土化模版，"/" 命令触发选择器 |
| 11 | 数据持久化 | ✅ | `lib/db.ts`, `prisma/schema.prisma`, `app/api/meetings/` | Prisma + SQLite，自动保存/手动保存/加载/删除 |
| 12 | 会议历史 | ✅ | `components/MeetingHistory.tsx` | 侧边栏展示，点击恢复，删除 |

### 待完成

| # | 功能模块 | 优先级 | 说明 |
|---|---------|--------|------|
| A | **阿里云 ASR 接入** | 🔴 高 | 替换浏览器 Web Speech API，实现真正的中文实时转写 + 说话人分离。需要：WebSocket 中转服务、PCM 编码、阿里云 SDK 集成 |
| B | **MiniMax LLM 接入** | 🔴 高 | 联通 MiniMax API，替换 Demo 模拟响应。API 路由已预埋（`/api/enhance`, `/api/chat`），只需填入 API Key |
| C | **UI 打磨** | 🟡 中 | 响应式布局、深色模式、动画过渡、移动端适配 |
| D | **模版可编辑/自定义** | 🟡 中 | 用户自定义 prompt 模版，保存到数据库 |
| E | **导出增强** | 🟢 低 | 导出为 Notion/飞书/企业微信格式 |
| F | **多会议 Chat** | 🟢 低 | 跨会议提问（Granola 的 "全局 Chat" 功能） |

---

## 项目文件结构

```
ai_notepad/
├── app/
│   ├── page.tsx                    # 主页面（四栏：历史/转写/笔记/Chat）
│   ├── layout.tsx                  # 全局布局（中文 lang, 元数据）
│   ├── globals.css                 # 全局样式（Tiptap、滚动条）
│   └── api/
│       ├── enhance/route.ts        # POST - AI 融合笔记（MiniMax）
│       ├── chat/route.ts           # POST - 会议 Chat 流式输出
│       └── meetings/
│           ├── route.ts            # GET 列表 / POST 创建保存
│           └── [id]/route.ts       # GET 详情 / PUT 更新 / DELETE 删除
├── components/
│   ├── AudioRecorder.tsx           # 双通道录音（麦克风+系统音频+音量监测）
│   ├── TranscriptPanel.tsx         # 实时转写面板（蓝色=我/绿色=对方）
│   ├── NoteEditor.tsx              # Tiptap 富文本编辑器
│   ├── ChatPanel.tsx               # Chat + "/" 模版命令
│   ├── EnhancedNotes.tsx           # AI 结构化笔记展示
│   ├── SpeakerManager.tsx          # 说话人身份绑定
│   └── MeetingHistory.tsx          # 历史会议侧边栏
├── lib/
│   ├── types.ts                    # 共享类型定义
│   ├── store.ts                    # Zustand 全局状态（含持久化 Actions）
│   ├── templates.ts                # 7 个本土化模版定义
│   ├── llm.ts                      # LLM API 调用封装
│   ├── db.ts                       # Prisma 客户端单例
│   └── speech-recognition.d.ts     # Web Speech API 类型声明
├── prisma/
│   ├── schema.prisma               # 数据模型（Meeting/Segment/ChatMessage）
│   └── migrations/                 # 数据库迁移
├── .env.example                    # 环境变量模板
├── README.md                       # 项目中文文档
└── HANDOVER.md                     # 本交接文档
```

---

## 关键设计决策

1. **Botless 双通道采集**: `getUserMedia()`(麦克风) + `getDisplayMedia()`(系统音频)，用 AudioContext + AnalyserNode 独立分析两路音量，实现无 Bot 的说话人区分
2. **Demo 降级策略**: 所有 API 路由（enhance/chat）在无 API Key 时返回模拟内容，保证无密钥也能完整体验
3. **自动保存**: 录音结束时自动保存，录音中每 30 秒增量保存，避免数据丢失
4. **Prisma v6**: 因 v7 要求 driver adapter 增加了复杂度，demo 阶段用 v6 的 `prisma-client-js` 更简洁
5. **模版系统**: 7 个本土化场景模版（销售复盘/用户访谈/站会/1on1/脑暴/教练/翻译），Chat 中 "/" 触发

---

## 接手后如何启动

```bash
git clone https://github.com/JzzzX/ai-notepad.git
cd ai-notepad
npm install
cp .env.example .env.local   # 填入 API 密钥（可选，不填则 Demo 模式）
npx prisma migrate dev        # 初始化数据库
npm run dev                   # http://localhost:3000
```

---

## Git 提交历史

```
6f3d62b feat: 实现数据持久化（Prisma + SQLite）
2d8a331 feat: 实现 Botless 双通道音频采集（麦克风 + 系统音频）
e610769 feat: 实现 AI Notepad 核心功能原型
4e419ea docs: 将 README 改为中文，介绍项目定位与技术栈
8aaf440 chore: add Granola research docs, tiptap/zustand deps, and env config
c9d0278 Initial commit from Create Next App
```

---

## 接手优先事项

**最高优先级**: 接入真实 API（任务 A + B）
1. 在阿里云开通「智能语音交互」服务，获取 AppKey
2. 实现 WebSocket 中转路由（`app/api/asr/route.ts`），将双通道 PCM 音频流发送到阿里云 ASR
3. 在 MiniMax 开放平台获取 API Key，填入 `.env.local`
4. AI 融合和 Chat 功能会立即生效（API 路由已完整预埋）
