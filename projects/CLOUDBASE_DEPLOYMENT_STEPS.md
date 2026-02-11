# CloudBase 部署指南

## 📋 部署前检查清单

- ✅ CloudBase 环境已连接：`nrc-8ggxdu3m3534afc0`
- ✅ 区域：ap-shanghai（上海）
- ✅ 静态托管：已启用
- ✅ Dockerfile：已创建

---

## 🚀 推荐部署方案：CloudRun

### 为什么选择 CloudRun？

由于您的项目包含以下功能，**强烈推荐使用 CloudRun**：

✅ **需要后端逻辑**：
- `/api/music/*` - 音乐扫描、播放、封面
- `/api/chat/*` - AI 聊天
- `/api/favorites/*` - 收藏管理
- `/api/auth/*` - 用户认证

✅ **需要服务器功能**：
- 文件上传和处理
- WebSocket 连接
- 动态路由和中间件
- 环境变量管理

❌ **静态托管不适合**：
- 静态托管不支持 API 路由
- 静态托管无法处理文件上传
- 静态托管不支持 WebSocket

---

## 📝 CloudRun 部署步骤

### 方法 1：通过 CloudBase 控制台（推荐）

#### 步骤 1：访问 CloudRun 控制台

打开以下链接：
```
https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/platform-run
```

#### 步骤 2：创建新服务

1. 点击"新建服务"按钮
2. 配置服务信息：
   - **服务名称**：`nrc-web`（或您喜欢的名称）
   - **服务类型**：容器型
   - **代码来源**：本地上传

#### 步骤 3：配置 Dockerfile

选择项目根目录的 `Dockerfile`：

```dockerfile
# 该文件已在项目中创建
位置：F:\v_bxgxwang\nrc_home\projects\Dockerfile
```

#### 步骤 4：配置资源规格

| 配置项 | 建议值 | 说明 |
|--------|--------|------|
| **CPU** | 0.5 核 | 可根据负载调整 |
| **内存** | 1 GB | 建议至少 1GB |
| **端口** | 3000 | Next.js 默认端口 |
| **最小实例数** | 1 | 确保快速响应 |
| **最大实例数** | 2 | 支持自动扩缩容 |

#### 步骤 5：配置访问类型

- **访问类型**：公网访问
- **域名**：使用自动分配的域名或配置自定义域名

#### 步骤 6：上传项目文件

将以下文件和目录打包上传：

**必需文件**：
- `package.json` - 项目配置
- `package-lock.json` - 锁定依赖版本
- `pnpm-lock.yaml` - pnpm 锁定文件
- `next.config.ts` - Next.js 配置
- `tsconfig.json` - TypeScript 配置
- `tailwind.config.ts` - Tailwind 配置
- `Dockerfile` - Docker 构建文件

**必需目录**：
- `app/` - Next.js 应用目录
- `src/` - 源代码目录
- `public/` - 静态资源
- `components.json` - shadcn/ui 配置
- `components/` - UI 组件（如果有）

**可选目录**：
- `db/` - 数据库配置
- `docs/` - 文档
- `scripts/` - 构建脚本

#### 步骤 7：配置环境变量

在 CloudRun 服务配置中添加以下环境变量：

```env
# Supabase 配置（从 .env.local 复制）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 应用配置
NODE_ENV=production
PORT=3000
```

**获取环境变量**：
```bash
# 查看本地环境变量
type F:\v_bxgxwang\nrc_home\projects\.env.local
```

#### 步骤 8：部署

1. 点击"部署"按钮
2. 等待构建完成（约 3-5 分钟）
3. 查看部署日志确认成功
4. 获取访问地址

#### 步骤 9：测试部署

1. 访问分配的域名
2. 测试主要功能：
   - ✅ 首页加载
   - ✅ 音乐播放器
   - ✅ AI 聊天
   - ✅ 用户登录
   - ✅ 游戏功能

#### 步骤 10：配置自定义域名（可选）

1. 在 CloudRun 服务详情页点击"域名管理"
2. 添加自定义域名
3. 配置 DNS 解析
4. 等待 SSL 证书自动签发

---

### 方法 2：使用 CloudBase CLI 部署（高级）

如果您熟悉命令行操作，可以使用 CloudBase CLI：

```bash
# 1. 安装 CloudBase CLI
npm install -g @cloudbase/cli

# 2. 登录
cloudbase login

# 3. 初始化配置
cd F:\v_bxgxwang\nrc_home\projects
cloudbase init

# 4. 配置 cloudbaserc.json
{
  "envId": "nrc-8ggxdu3m3534afc0",
  "version": "2.0",
  "$schema": "https://framework-1258016615.tcloudbaseapp.com/schema/latest.json",
  "framework": {
    "name": "nextjs",
    "plugins": {}
  }
}

# 5. 部署
cloudbase deploy
```

---

## 🔧 部署后配置

### 1. 配置数据库

如果使用 CloudBase 数据库：

1. 访问：https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/db/doc
2. 创建数据库集合（参考 SUPABASE_CREATE_TABLES.sql）
3. 配置安全规则

### 2. 配置云存储（如果需要）

1. 访问：https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/storage
2. 创建存储桶
3. 配置访问权限

### 3. 配置认证

如果使用 CloudBase 认证：

1. 访问：https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/identity/login-manage
2. 启用登录方式（邮箱、手机、微信等）
3. 配置登录回调

---

## 📊 监控和维护

### 查看服务日志

1. 访问 CloudRun 服务详情
2. 点击"日志"标签
3. 查看实时日志和历史日志

### 性能监控

1. 访问：https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/devops/log
2. 查看请求量、响应时间、错误率等指标

### 自动扩缩容

CloudRun 会根据负载自动扩缩容：

- **最小实例数**：始终保持运行
- **最大实例数**：高峰时自动扩展
- **配置建议**：最小 1，最大 2-5

---

## ❗ 常见问题

### 问题 1：部署失败

**原因**：Dockerfile 配置错误或依赖安装失败

**解决**：
1. 检查 Dockerfile 语法
2. 确认 package.json 依赖正确
3. 查看构建日志定位错误

### 问题 2：服务无法访问

**原因**：端口配置错误或安全组限制

**解决**：
1. 确认端口为 3000
2. 检查安全组规则
3. 查看服务日志

### 问题 3：环境变量未生效

**原因**：环境变量配置位置错误

**解决**：
1. 确认在 CloudRun 服务配置中添加
2. 重启服务使环境变量生效
3. 使用 `process.env.VAR_NAME` 读取

### 问题 4：音乐播放失败

**原因**：文件路径或权限问题

**解决**：
1. 检查文件路径配置
2. 确认文件可访问
3. 查看浏览器控制台错误

### 问题 5：数据库连接失败

**原因**：数据库 URL 或密钥错误

**解决**：
1. 检查环境变量配置
2. 确认 Supabase 项目状态
3. 测试数据库连接

---

## 📞 技术支持

### CloudBase 文档
- 官方文档：https://docs.cloudbase.net/
- 快速开始：https://docs.cloudbase.net/quickstart

### Next.js 文档
- 官方文档：https://nextjs.org/docs
- 部署指南：https://nextjs.org/docs/deployment

### 腾讯云支持
- 工单系统：https://console.cloud.tencent.com/workorder
- 社区论坛：https://cloud.tencent.com/developer

---

## ✅ 部署检查清单

完成部署后，请逐项检查：

- [ ] 服务已成功部署
- [ ] 域名可访问
- [ ] 首页正常加载
- [ ] 音乐播放器功能正常
- [ ] AI 聊天功能正常
- [ ] 用户登录功能正常
- [ ] 游戏功能正常
- [ ] 环境变量已配置
- [ ] 日志无错误
- [ ] 性能监控正常

---

## 🎉 部署成功后

部署成功后，您可以：

1. ✅ 通过公网域名访问应用
2. ✅ 配置自定义域名
3. ✅ 设置自动化部署（CI/CD）
4. ✅ 监控应用性能
5. ✅ 查看服务日志和监控
6. ✅ 配置自动扩缩容
7. ✅ 设置告警通知

---

## 💡 优化建议

### 性能优化
- 启用 CDN 加速
- 配置图片优化
- 使用缓存策略

### 成本优化
- 合理配置实例数
- 使用预留实例
- 监控资源使用

### 安全优化
- 启用 HTTPS
- 配置安全组
- 设置访问控制

---

**祝您部署顺利！** 🚀
