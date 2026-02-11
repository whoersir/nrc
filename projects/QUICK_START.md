# 🚀 开发环境快速启动指南

## ⚡ 快速修复（5 分钟）

### 如果遇到以下问题：
- ❌ WebSocket 连接失败
- ❌ `net::ERR_ABORTED 403` 字体加载错误
- ❌ 页面不断刷新

### 解决方案：

#### 步骤 1：清理缓存（必须）

**Windows:**
```bash
cd projects
clean-dev.bat
```

**macOS/Linux:**
```bash
cd projects
./clean-dev.sh
```

#### 步骤 2：启动开发服务器

```bash
pnpm dev
```

#### 步骤 3：验证

打开浏览器访问 `http://10.75.31.37:5000`

- ✅ 检查浏览器控制台是否有 WebSocket 错误
- ✅ 字体是否正常显示
- ✅ 修改文件时是否正常刷新

---

## 📊 诊断工具

如需详细诊断，运行：

```bash
node diagnose.js
```

该工具会检查：
- ✓ 项目文件结构
- ✓ 缓存状态
- ✓ 环境变量配置
- ✓ Next.js 配置
- ✓ 系统资源

---

## 🔧 重要文件说明

| 文件 | 说明 |
|------|------|
| `next.config.ts` | ✅ 已更新 - 启用文件轮询，禁用 WebSocket |
| `.env.development.local` | ✅ 已创建 - 环境变量配置 |
| `clean-dev.bat` | ✅ 已创建 - Windows 清理脚本 |
| `clean-dev.sh` | ✅ 已创建 - Linux/macOS 清理脚本 |
| `diagnose.js` | ✅ 已创建 - 诊断工具 |
| `HMR_WEBSOCKET_FIX.md` | ✅ 已创建 - 详细说明文档 |

---

## 🔄 工作原理

### 原有方式（已禁用）
```
文件修改 → WebSocket 推送 → 浏览器更新
                ↑
          (在内网环境容易失败)
```

### 新的方式（已启用）✅
```
文件修改 → 轮询检测 (1s 一次) → 文件变化 → 浏览器更新
                ↑
          (更稳定，不依赖 WebSocket)
```

---

## 🐛 常见问题

### Q1: 启动后仍看到 WebSocket 错误？

A: 这是正常的，因为浏览器会尝试连接一次。只要没有 **持续** 的错误就没问题。

### Q2: 修改文件后页面没有刷新？

A: 检查以下几点：
1. 是否保存了文件
2. 是否在 `projects` 目录下运行了 `pnpm dev`
3. 尝试手动刷新浏览器 (`F5`)

### Q3: 仍然看到 403 字体错误？

A: 运行以下命令：
```bash
# 完全清理
clean-dev.bat  # Windows
# 或
./clean-dev.sh  # macOS/Linux

# 重新安装
pnpm install

# 启动
pnpm dev
```

### Q4: 内存占用过高？

A: 这是正常的（Next.js 16 + Turbopack）。如需优化：
```bash
# 关闭其他应用，释放内存
# 或修改 package.json 中的启动命令参数
```

---

## 📝 环境配置

### 已应用的优化：

✅ **Turbopack 轮询** - 每 1 秒检查文件一次  
✅ **WebSocket 禁用** - 避免连接失败  
✅ **字体优化禁用** - 解决 403 错误  
✅ **CORS 响应头** - 增强资源访问兼容性  
✅ **内存优化** - 分配 4GB 内存  

---

## 📞 需要帮助？

1. 查看详细文档：`HMR_WEBSOCKET_FIX.md`
2. 运行诊断工具：`node diagnose.js`
3. 检查浏览器控制台是否有错误信息

---

## ✨ 预期效果

修复后，你应该看到：

```
✓ 开发服务器启动成功
✓ 没有持续的 WebSocket 错误
✓ 字体和样式正常加载
✓ 修改文件时页面自动刷新（通过轮询）
✓ 不再出现页面不断自动刷新的问题
```

---

**最后更新**: 2025-01-30  
**Next.js 版本**: 16.1.1  
**Turbopack**: 已启用
