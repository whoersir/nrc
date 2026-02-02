# ✅ 修复验收清单

## 修复前验证

在应用任何修复前，确认你遇到的问题：

- [ ] 看到 `WebSocket connection to 'ws://...' failed` 错误
- [ ] 看到 `GET ...__nextjs_font/geist-latin.woff2 403 Forbidden` 错误
- [ ] 页面不断自动刷新，无法正常工作
- [ ] 开发服务器已启动，但浏览器显示异常

## 修复步骤

### Step 1: 清理缓存

- [ ] 打开终端，`cd projects`
- [ ] 运行 `clean-dev.bat` (Windows) 或 `./clean-dev.sh` (macOS/Linux)
- [ ] 等待脚本完成 (应该看到 ✅ 符号)

### Step 2: 验证文件已更新

- [ ] `next.config.ts` 包含 `turbopack: { watch: { poll: 1000 } }`
- [ ] `.env.development.local` 包含 `NEXT_DISABLE_WEBSOCKET=true`
- [ ] `package.json` 的 `dev` 命令包含 `--turbo` 参数

```bash
# 快速检查命令
grep -r "poll: 1000" next.config.ts
grep "NEXT_DISABLE_WEBSOCKET" .env.development.local
grep "turbo" package.json | grep dev
```

### Step 3: 启动开发服务器

- [ ] 运行 `pnpm dev`
- [ ] 等待输出：`- Ready in X.XXs`
- [ ] 确认没有 fatal errors

### Step 4: 访问应用

- [ ] 打开浏览器访问 `http://10.75.31.37:5000`
- [ ] 页面应该正常加载

## 修复后验证

### 控制台检查

打开浏览器开发者工具 (F12)，切换到 Console 标签：

**查找错误**：
- [ ] 不应该看到 `WebSocket connection ... failed` 的持续错误
- [ ] 不应该看到 `403 Forbidden` 错误（字体加载）
- [ ] 可能在初始化时看到一条 WebSocket 失败信息，这是正常的

**预期内容**：
```
[HMR] connected
Fast Refresh connected
```

### 外观检查

- [ ] 页面正常显示（无布局混乱）
- [ ] 字体渲染正确（不是系统字体）
- [ ] 所有图标和图片正常显示
- [ ] 右下角应该显示 Next.js 构建信息

### 功能检查

- [ ] 修改任何 `.tsx` 或 `.ts` 文件
- [ ] 保存文件
- [ ] **期待结果**：1-2 秒内页面自动刷新或显示 "Fast Refresh"
- [ ] 页面内容更新为修改后的内容

**验证脚本**：

编辑任何页面文件，比如 `app/profile/page.tsx`：
1. 找到任何文本
2. 修改文本内容
3. 保存文件
4. 观察浏览器是否自动更新

### 性能检查

在浏览器中打开 Performance 标签：

- [ ] 首次加载 < 3 秒
- [ ] 文件保存后刷新 < 2 秒
- [ ] CPU 占用正常（不应该接近 100%）
- [ ] 内存占用 < 2GB (Next.js + Turbopack)

### 稳定性检查

修改多个不同类型的文件，验证每次都能正常刷新：

- [ ] 修改 `.tsx` 文件 → 页面刷新
- [ ] 修改 `.ts` 文件 → 页面刷新
- [ ] 修改 CSS/样式 → 样式更新
- [ ] 修改环境变量 → 需要手动刷新
- [ ] 修改 `next.config.ts` → 需要重启开发服务器

## 故障排查

### 问题 1: 仍然看到 WebSocket 错误

**症状**：
```
WebSocket connection to 'ws://...' failed: 
```

**原因**：浏览器在初始化时会尝试连接一次  
**解决**：这是正常行为。如果错误持续出现，运行诊断工具

```bash
node diagnose.js
```

### 问题 2: 页面仍在不断刷新

**症状**：页面每秒刷新一次  
**原因**：缓存未完全清理或配置未应用

**解决步骤**：
```bash
# 1. 停止开发服务器 (Ctrl+C)
# 2. 完全清理
clean-dev.bat  # 或 ./clean-dev.sh

# 3. 重新安装依赖
pnpm install

# 4. 启动
pnpm dev
```

### 问题 3: 修改文件后页面没有刷新

**症状**：修改代码，页面没反应  
**排查步骤**：
- [ ] 检查文件是否已保存（IDE 标题栏是否有 · 或 *)
- [ ] 检查开发服务器是否在运行（终端是否有活动）
- [ ] 检查浏览器是否在前台
- [ ] 手动刷新浏览器 (F5)

**解决**：
```bash
# 重启开发服务器
# Ctrl+C
pnpm dev
```

### 问题 4: 字体仍然 403

**症状**：
```
GET http://10.75.31.37:5000/__nextjs_font/geist-latin.woff2 403 Forbidden
```

**解决步骤**：
```bash
# 彻底清理
clean-dev.bat  # 或 ./clean-dev.sh

# 重新安装
pnpm install

# 启动
pnpm dev
```

## 自动诊断

如果以上检查有任何失败，运行诊断工具：

```bash
node diagnose.js
```

这会检查：
- ✓ 项目文件结构
- ✓ 缓存状态
- ✓ 环境变量
- ✓ Next.js 配置
- ✓ 系统资源

输出示例：
```
📋 Next.js 开发环境诊断工具
==================================================

1️⃣  检查项目结构...
  ✅ next.config.ts
  ✅ package.json
  ...

2️⃣  检查缓存状态...
  ✅ .next (不存在，正常)
  ...

3️⃣  检查环境变量配置...
  ✅ WebSocket 禁用设置
  ✅ 文件轮询设置

...

==================================================
✨ 一切看起来正常！
```

## 最终验收

修复成功的标志：

- [ ] ✅ 浏览器能正常访问应用
- [ ] ✅ 控制台没有持续的 WebSocket 错误
- [ ] ✅ 字体和资源正常加载（无 403 错误）
- [ ] ✅ 页面不再不断自动刷新
- [ ] ✅ 修改文件时，页面在 1-2 秒内自动刷新
- [ ] ✅ 显示 "Fast Refresh" 或 HMR 连接提示
- [ ] ✅ 开发体验恢复正常

## 签名

如果所有检查都通过，恭喜！🎉

**修复完成日期**: _______________  
**验证人**: _______________  
**备注**: _______________

---

## 下一步

现在你可以：

1. **正常开发**：享受稳定的 HMR 和自动刷新
2. **了解更多**：查看 `HMR_WEBSOCKET_FIX.md` 了解技术细节
3. **分享经验**：告诉团队这个解决方案
4. **保存文档**：保存这些文档以供将来参考

---

**完成时间**: 2025-01-30  
**状态**: ✅ 修复完成  
**下一次检查**: 需要时
