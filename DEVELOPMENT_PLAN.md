# AI Notepad 开发计划（接手版）

更新时间：2026-02-27

## 阶段 0：仓库清理与基线稳定（已完成）
- [x] 删除交接/调研类无关文件（`HANDOVER.md`、Granola 调研文档、临时渲染目录）
- [x] 修复 lint 报错并恢复 `npm run lint` 通过
- [x] 验证 `npm run build` 可通过
- [x] 修复 `POST /api/meetings` 保存逻辑，确保 `segments/chatMessages` 每次保存都同步落盘

## 阶段 1：阿里云 ASR 接入（进行中）
- [x] 增加 ASR 配置抽象：`lib/asr.ts`（模式、配置检测、状态输出）
- [x] 增加状态接口：`GET /api/asr/status`
- [x] 增加会话接口：`POST /api/asr/session`（返回 token / wsUrl / appKey）
- [x] 前端显示 ASR 当前状态（`AudioRecorder`）
- [x] 端侧 PCM 编码与分片发送（16k/16bit 单声道）
- [x] 阿里云 WebSocket 实时转写（麦克风 + 系统音频双通道）
- [x] 系统音频占位文本替换为真实云端转写文本（aliyun 模式下）
- [ ] 可选：改为服务端中转 WebSocket（当前为浏览器直连阿里云网关）

## 阶段 2：MiniMax 真正联通与鲁棒性
- [ ] 增加 API 超时/重试与错误分类（鉴权、限流、上游异常）
- [ ] 流式输出容错（SSE 边界、异常中断恢复）
- [ ] Prompt 模板参数化（会议类型/角色/输出风格）

## 阶段 3：产品化完善
- [ ] 模板自定义与数据库持久化
- [ ] 移动端与窄屏布局优化
- [ ] 导出能力增强（Markdown/Docx/飞书/企业微信）
- [ ] 跨会议 Chat（全局知识检索）

## 本周执行顺序
1. 完成阿里云实时 ASR 中转最小可用链路（仅麦克风）。
2. 接入系统音频通道并校准说话人映射。
3. 在真实会议样本上做延迟/准确率/稳定性回归。
