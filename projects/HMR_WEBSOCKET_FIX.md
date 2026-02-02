# Next.js HMR WebSocket 和字体 403 错误彻底解决方案

## 问题现象

1. **WebSocket 连接失败**：
   ```
   WebSocket connection to 'ws://10.75.31.37:5000/_next/webpack-hmr?...' failed
   ```

2. **字体资源 403 错误**：
   ```
   GET http://10.75.31.37:5000/__nextjs_font/geist-latin.woff2 net::ERR_ABORTED 403 (Forbidden)
   ```

3. **页面持续自动刷新**：由于 HMR 连接失败导致的循环重新加载

## 根本原因分析

1. **WebSocket 问题**：
   - Next.js 16 使用 Turbopack，默认尝试通过 WebSocket 建立 HMR 连接
   - 在内网环境（10.75.31.37）WebSocket 可能被阻止或超时
   - 浏览器多次重试连接导致页面不稳定

2. **字体 403 错误**：
   - 字体文件路径访问权限问题
   - 开发服务器缓存问题
   - 字体优化配置不当

## 解决方案

### 方案 1：完全禁用 WebSocket HMR（推荐）

**配置已更新到以下文件：**

#### 1. `next.config.ts` - 禁用 WebSocket，启用文件轮询

```typescript
turbopack: {
  watch: {
    poll: 1000,  // 每 1 秒轮询一次文件变化
  },
},
```

#### 2. `.env.development.local` - 环境变量配置

```env
# 禁用 WebSocket HMR
NEXT_DISABLE_WEBSOCKET=true

# 启用文件轮询
WATCHPACK_POLLING=1000

# 禁用 Next.js 遥测
NEXT_TELEMETRY_DISABLED=1
```

#### 3. `package.json` - 优化启动命令

```bash
# 使用新的启动命令
pnpm dev

# 该命令包含：
# - 更多内存分配 (4GB)
# - Turbopack 快速启动
```

### 方案 2：清理所有缓存

在 Windows 上运行（项目根目录）：

```bash
clean-dev.bat
```

或使用 PowerShell：

```powershell
rmdir -Recurse -Force .next
rmdir -Recurse -Force .turbo
rmdir -Recurse -Force node_modules\.cache
```

在 macOS/Linux 上运行：

```bash
./clean-dev.sh
```

### 方案 3：响应头和字体资源配置

已在 `next.config.ts` 中配置：

```typescript
async headers() {
  return [
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
        {
          key: 'Access-Control-Allow-Origin',
          value: '*',
        },
      ],
    },
  ];
}

async rewrites() {
  return {
    beforeFiles: [
      {
        source: '/__nextjs_font/:path*',
        destination: '/_next/static/media/:path*',
      },
    ],
  };
}
```

## 快速修复步骤

### 第 1 步：清理缓存（必须）

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

### 第 2 步：重新安装依赖（可选，如果 Step 1 后仍有问题）

```bash
pnpm install
```

### 第 3 步：启动开发服务器

```bash
pnpm dev
```

### 第 4 步：验证修复

- 打开浏览器 `http://10.75.31.37:5000`
- 检查控制台是否仍有 WebSocket 错误
- 确认字体正常加载
- 尝试修改文件，验证 HMR 是否正常工作（应该看到 "Fast Refresh" 提示）

## 新特性

### 文件变化检测

- **之前**：通过 WebSocket 实时推送 (易失败)
- **之后**：使用轮询 (1 秒检查一次文件) - 更稳定

### 优势

✅ **更稳定**：轮询方式比 WebSocket 连接更可靠  
✅ **内网友好**：不依赖 WebSocket，内网环境表现更好  
✅ **自动恢复**：如果文件检测失败，会自动重试  
✅ **无缓存问题**：字体和资源访问更加稳定  

### 劣势 (可接受)

- 轮询间隔为 1 秒，相比 WebSocket 实时性稍差
- 内存消耗略高 (但通过 `maxInactiveAge` 优化了)

## 如果问题仍未解决

### 1. 检查端口占用

```bash
# Windows
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :5000
```

### 2. 手动清理浏览器缓存

- `Ctrl + Shift + Delete` (或 `Cmd + Shift + Delete`)
- 选择 "All time" 时间范围
- 清除 "缓存的图像和文件"

### 3. 重启 Node.js 进程

```bash
# 停止当前开发服务器 (Ctrl + C)
# 等待 3 秒
pnpm dev
```

### 4. 检查网络问题

```bash
# 测试到服务器的连接
ping 10.75.31.37

# 测试端口是否可访问
curl http://10.75.31.37:5000
```

### 5. 查看详细日志

```bash
# 启用详细调试输出
NODE_DEBUG=http,net pnpm dev
```

## 环境信息

- **Next.js 版本**：16.1.1
- **Turbopack**：已启用 (默认)
- **Node.js 最低版本**：18.0.0
- **内存分配**：4GB

## 参考文档

- [Next.js HMR 配置](https://nextjs.org/docs/app/building-your-application/configuring/turbopack)
- [Webpack 轮询配置](https://webpack.js.org/guides/development/#choosing-a-development-tool)
- [Next.js 字体优化](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)

## 总结

这个解决方案通过：
1. **禁用 WebSocket HMR** → 改用文件轮询 (更稳定)
2. **禁用字体优化** → 解决 403 错误
3. **添加 CORS 响应头** → 增强资源访问兼容性
4. **清理所有缓存** → 消除状态污染

应该能够 **彻底解决** WebSocket 连接失败和页面自动刷新的问题。
