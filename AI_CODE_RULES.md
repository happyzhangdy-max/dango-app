# AI_CODE_RULES.md — AI 编码守则 v1.2

> 适用于 nihongo-corner（日语角）及所有项目。
> 所有编码 Agent（小码A、兽兽等）必须遵守。

---

## 一、通用规则

### 1.1 语法验证
- 所有 JS 代码在提交前必须过 `node --check <file>` 验证语法
- 涉及 `new Function()` 动态执行的代码必须独立测试该路径
- `const` 不可用于跨脚本全局变量（TDZ 陷阱）→ 用 `var` 或 `window.xxx`

### 1.2 编码与文件操作（Windows）
- 涉及中/日/韩/特殊字符（✦☆⭐等）的文件修改：
  - ❌ 禁止用 `>`, `Out-File`, `Set-Content`, `|` 管道
  - ✅ 用 `[System.IO.File]::WriteAllText(path, content, [Text.Encoding]::UTF8)`（PowerShell）
  - ✅ 或用 Python `open(..., 'w', encoding='utf-8')`
  - ✅ 或 Node.js `fs.writeFileSync(path, content, 'utf8')`
- **大文件（>1MB）UTF-8 操作**：必须用二进制安全方式，禁止 shell 重定向
- 改完后必须通过 Python 或 hexdump 验证 UTF-8 完整性

### 1.3 CSS 规范
- `transition`：必须指定具体属性（`transition: opacity 0.3s` 等），**禁止 `transition: all`**
- `overflow: hidden` 在根元素（html/body）上禁止使用——影响全站所有页面
- 删除 DOM 元素后必须截图检查"周围元素移位效应"
- 所有 `.page` 子页面使用 `position: fixed` 统一布局方案

### 1.4 提交与部署
- 修改 `inline.js` 后必须 bump HTML 中的 cache buster（`?v=X`）
- Agent 提交的 JS 代码必须先验证语法再合并 → 部署
- GH Pages 构建有 1-2 分钟延迟，合并后等部署完成再验证

---

## 二、功能开发规范

### 2.1 数据持久化
- 异步数据必须**在事件发生时刻立即持久化**，不可依赖回调/定时器中的写入
- 定时器回调 + 用户导航 = 经典数据丢失场景

### 2.2 搜索与缓存
- localStorage 缓存 key: `_search_cache`，TTL 30 分钟
- 新搜索输入时清缓存
- 骨架屏必须用独立 DOM 容器，不与本地结果共用容器

### 2.3 DOM 操作
- `getBoundingClientRect()` 不保证元素在视口可见——必须结合 `IntersectionObserver`
- 移除 DOM 后检查相邻元素位置是否异常

### 2.4 随机性
- 禁止用 `Math.random()` 做"预期可重现"的随机操作（如每日学习单词）
- 必须用种子随机数 + 日期标记缓存

### 2.5 跨页面布局
- `html { overflow: hidden }` 会"闷死"不在 `.main` 里的所有页面 → 因此禁止
- 改为给每个 `.page` 独立设置 `max-height: calc(100vh - 52px - 62px); overflow-y: auto`

---

## 三、Python 脚本规范
- 必须类型注解
- Google 风格 docstring
- 函数 ≤ 50 行
- 遵循 DRY 原则

---

## 四、审查与质量门禁

### 4.1 交互路径审查
- 每次发版前，按用户真实路径走一遍所有交互元素
- 用 `browser_use action=batch` 批量执行路径测试

### 4.2 全局改动验证
- 改变全局属性后，必须对所有受影响页面截图确认
- 最少覆盖 3 个不同类型页面（有内容/可滚动/内容少）

### 4.3 编码规范审计（新增 v1.2）
- 每个 PR/提交前检查：是否有 `transition: all`、`overflow: hidden` 在根元素、`const` 全局变量

---

## 五、浏览器兼容
- 主目标：Chrome（最新版）
- 音频：speechSynthesis API
- 存储：localStorage（~5MB 限制）

---

## 六、DeepSeek 模型特别注意事项（v1.2 新增）

> 适用于基于 DeepSeek 系列模型（deepseek-v4-flash 等）的编码 Agent。

### 6.1 输出简洁性
- DeepSeek 模型默认有啰嗦倾向——代码输出需刻意控制注释密度，优先用有意义的变量名替代过长注释
- 代码输出时，尽量省略"显而易见"的解释性注释
- 回复保持简洁：直接给代码 + 关键说明，避免"我来看看"、"好的让我分析一下"等废话

### 6.2 指令精准执行
- 路径、文件名、版本号等必须与用户指定完全一致——DeepSeek 有时会"猜"路径
- 不确定时先查再写，不要假设

### 6.3 复杂度检查
- 生成代码后自检：有没有比必要更复杂的解法？
- 偏好：简单 > 通用 > 抽象 > 炫技

### 6.4 上下文意识
- 大文件场景下注意 token 水位——必要时分段处理而非一次性全读
- session 起步必读 MEMORY.md 和 HEARTBEAT.md，不依赖"记忆"

---

*本文档由团队维护。添加或修改规则需经过兽兽审批。*
