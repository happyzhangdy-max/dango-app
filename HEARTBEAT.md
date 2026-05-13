# HEARTBEAT.md — 兽兽待办 & 状态

> 心跳自检用。每次醒来先读这个。

## 当前轮次任务

- [x] **游戏结束统计信息**：爬塔+拳击新增错词追踪、显示、自动加入生词本
  - [x] boxing.js: wrongWords 追踪（onWrong + onTimeout），gameOver/victoryScreen 展示并保存到 jp_book
  - [x] tower-climb.js: gameOver 保存错词到 jp_book，显示 "已加入生词本 ✅"
  - [x] 使用直接 localStorage 操作（避免 toggleBook toggle 副作用）
  - [x] HTML 标签平衡检查通过
  - [x] 已部署 v=83（commit 4a9ddfc，Run #10 已上线）
  - [x] 线上验证通过：GameBoxing / Game 均正常加载

## 待办

- [ ] **交互路径审查**：下次发版前执行
- [ ] **自改善循环**：下次 Heartbeat 执行 READ→ASK→UPDATE→LOG

## 其他

- 最近活跃 Agent：兽兽
