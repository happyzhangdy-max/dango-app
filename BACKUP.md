# 日语角 v110 备份

## 备份位置
**路径**: `G:\backups\nihongo-corner-v110\`
**备份时间**: 2026-05-14
**版本**: v110 (Git commit 689021b)
**备份内容**: 全部项目文件（index.html, inline.js, data.js, grammar_data.js, quiz_data 等34个文件）

## 回滚方式
1. 复制 `G:\backups\nihongo-corner-v110\*.*` → `G:\workcraft\nihongo-corner\`
2. 或 `git checkout 689021b`（需要先 commit 当前改动）

## 当前状态（备份时）
- 版本 v110 — autoplay 导航增强（首末词toast、箭头禁用态、索引修复）
- 备份后即将进行：XSS修复 + 全局变量收敛 + 文件拆分Phase1
