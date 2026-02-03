# 🚀 CloudBase 部署指南

## ✅ 环境状态

您的项目已成功连接到 CloudBase：

| 项目 | 信息 |
|------|------|
| **环境 ID** | `nrc-8ggxdu3m3534afc0` |
| **别名** | `nrc` |
| **区域** | ap-shanghai（上海）|
| **状态** | ✅ 正常运行 |
| **静态托管** | ✅ 已启用 |
| **CloudRun** | ⏳ 待部署 |

---

## 🎯 部署方案选择

### ⭐ 强烈推荐：CloudRun

**为什么选择 CloudRun？**

您的项目包含以下功能，需要后端服务器支持：

✅ **API 路由**：
- `/api/music/*` - 音乐扫描、播放、封面
- `/api/chat/*` - AI 聊天
- `/api/favorites/*` - 收藏管理
- `/api/auth/*` - 用户认证
- `/api/db/*` - 数据库操作

✅ **服务器功能**：
- 文件上传和处理
- WebSocket 连接
- 动态路由和中间件
- 环境变量管理
- 流式响应（AI 聊天）

❌ **静态托管不适合**：
- 不支持 API 路由
- 无法处理文件上传
- 不支持 WebSocket
- 无法运行服务器代码

---

## 📝 CloudRun 部署步骤

### 步骤 1：访问 CloudRun 控制台

👉 **点击以下链接**：

```
https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/platform-run
```

---

### 步骤 2：创建新服务

1. 点击右上角的 **"新建服务"** 按钮
2. 填写服务信息：

   | 配置项 | 值 |
   |--------|-----|
   | **服务名称** | `nrc-web`（或您喜欢的名称）|
   | **服务类型** | 容器型 |
   | **代码来源** | 本地上传 |
   | **Dockerfile** | 选择项目根目录的 `Dockerfile` |

---

### 步骤 3：配置资源规格

| 配置项 | 建议值 | 说明 |
|--------|--------|------|
| **CPU** | 0.5 核 | 可根据负载调整 |
| **内存** | 1 GB | 建议至少 1GB |
| **端口** | 3000 | Next.js 默认端口 |
| **最小实例数** | 1 | 确保快速响应 |
| **最大实例数** | 2 | 支持自动扩缩容 |

---

### 步骤 4：上传项目文件

#### 文件清单

**必需文件**（7 个）：
```
✅ package.json              - 项目配置
✅ package-lock.json         - 依赖版本锁定
✅ pnpm-lock.yaml          - pnpm 锁定文件
✅ next.config.ts           - Next.js 配置
✅ tsconfig.json           - TypeScript 配置
✅ tailwind.config.ts      - Tailwind 配置
✅ Dockerfile              - Docker 构建文件
```

**必需目录**（4 个）：
```
✅ app/                     - Next.js 应用目录
✅ src/                     - 源代码目录
✅ public/                  - 静态资源
✅ components.json          - shadcn/ui 配置
```

**可选目录**：
```
⚪ db/                     - 数据库配置
⚪ docs/                    - 文档
⚪ scripts/                 - 构建脚本
⚪ types/                   - 类型定义
```

#### 打包方法

**方法 1：直接上传**
- 在 CloudBase 控制台选择文件和目录
- 逐个上传到云服务器

**方法 2：压缩上传**
- 压缩项目文件为 ZIP
- 上传 ZIP 文件
- 在服务器上解压

---

### 步骤 5：配置环境变量

在 CloudRun 服务配置中添加以下环境变量：

#### 必需环境变量

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 应用配置
NODE_ENV=production
PORT=3000
```

#### 获取环境变量

查看本地环境变量：

```bash
# Windows
type F:\v_bxgxwang\nrc_home\projects\.env.local

# macOS/Linux
cat F:\v_bxgxwang\nrc_home\projects\.env.local
```

---

### 步骤 6：部署服务

1. 点击 **"部署"** 按钮
2. 等待构建完成（约 3-5 分钟）
3. 查看部署日志确认成功

**部署过程**：
- ✅ 构建 Docker 镜像
- ✅ 安装项目依赖
- ✅ 构建 Next.js 应用
- ✅ 启动服务容器
- ✅ 健康检查
- ✅ 分配访问域名

---

### 步骤 7：测试部署

部署成功后，您将获得一个公网访问地址，例如：

```
https://nrc-web-xxxxxx.service.tcloudbaseapp.com
```

#### 功能测试清单

请逐项测试以下功能：

- [ ] ✅ 首页正常加载
- [ ] ✅ 音乐播放器功能正常
  - [ ] 播放音乐
  - [ ] 暂停/继续
  - [ ] 切换歌曲
  - [ ] 音量控制
  - [ ] 添加收藏
- [ ] ✅ AI 聊天功能正常
  - [ ] 发送消息
  - [ ] 接收流式响应
  - [ ] 对话历史
- [ ] ✅ 用户认证功能正常
  - [ ] 注册账号
  - [ ] 登录系统
  - [ ] 登出
- [ ] ✅ 游戏功能正常
  - [ ] 游戏加载
  - [ ] 多人互动

---

### 步骤 8：配置自定义域名（可选）

1. 在 CloudRun 服务详情页点击 **"域名管理"**
2. 点击 **"添加域名"**
3. 填写您的域名：
   ```
   www.yourdomain.com
   ```
4. 配置 DNS 解析：
   ```
   类型: CNAME
   主机记录: www
   记录值: nrc-web-xxxxxx.service.tcloudbaseapp.com
   ```
5. 等待 SSL 证书自动签发

---

## 🔗 重要链接

### CloudBase 控制台

- **CloudRun 管理**: https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/platform-run
- **环境概览**: https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/overview
- **静态托管**: https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/static-hosting
- **云函数管理**: https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/scf
- **数据库管理**: https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/db/doc
- **云存储管理**: https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/storage
- **日志监控**: https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/devops/log

### 文档

- **CloudBase 官方文档**: https://docs.cloudbase.net/
- **Next.js 部署文档**: https://nextjs.org/docs/deployment
- **Docker 文档**: https://docs.docker.com/

---

## 📊 监控和维护

### 查看服务日志

1. 访问 CloudRun 服务详情页
2. 点击 **"日志"** 标签
3. 查看实时日志和历史日志

### 性能监控

1. 访问：https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/devops/log
2. 查看以下指标：
   - 请求量
   - 响应时间
   - 错误率
   - CPU 使用率
   - 内存使用率

### 自动扩缩容

CloudRun 会根据负载自动扩缩容：

- **最小实例数**：始终保持运行
- **最大实例数**：高峰时自动扩展
- **配置建议**：最小 1，最大 2-5

---

## ❗ 常见问题

### 问题 1：部署失败

**可能原因**：
- Dockerfile 配置错误
- 依赖安装失败
- 构建超时

**解决方法**：
1. 检查 Dockerfile 语法
2. 确认 package.json 依赖正确
3. 查看构建日志定位错误
4. 增加超时时间

---

### 问题 2：服务无法访问

**可能原因**：
- 端口配置错误
- 安全组限制
- 服务未启动

**解决方法**：
1. 确认端口为 3000
2. 检查安全组规则
3. 查看服务日志
4. 重启服务

---

### 问题 3：环境变量未生效

**可能原因**：
- 环境变量配置位置错误
- 变量名称拼写错误

**解决方法**：
1. 确认在 CloudRun 服务配置中添加
2. 重启服务使环境变量生效
3. 使用 `process.env.VAR_NAME` 读取
4. 检查变量名称拼写

---

### 问题 4：音乐播放失败

**可能原因**：
- 文件路径配置错误
- 文件不存在或无法访问
- 权限问题

**解决方法**：
1. 检查文件路径配置
2. 确认文件存在
3. 查看浏览器控制台错误
4. 检查文件权限

---

### 问题 5：数据库连接失败

**可能原因**：
- 数据库 URL 或密钥错误
- 数据库服务未启动
- 网络连接问题

**解决方法**：
1. 检查环境变量配置
2. 确认 Supabase 项目状态
3. 测试数据库连接
4. 查看服务日志

---

## ✅ 部署检查清单

完成部署后，请逐项检查：

### 基础检查
- [ ] 服务已成功部署
- [ ] 服务状态为"运行中"
- [ ] 域名可访问
- [ ] 无错误日志

### 功能测试
- [ ] 首页正常加载
- [ ] 音乐播放器功能正常
- [ ] AI 聊天功能正常
- [ ] 用户登录功能正常
- [ ] 游戏功能正常

### 配置检查
- [ ] 环境变量已配置
- [ ] 自定义域名已配置（可选）
- [ ] SSL 证书已签发（可选）

---

## 🎉 部署成功后

部署成功后，您可以：

1. ✅ **通过公网域名访问应用**
   - 使用 CloudBase 分配的域名
   - 或配置自定义域名

2. ✅ **配置自定义域名**
   - 添加您的域名
   - 配置 DNS 解析
   - 自动签发 SSL 证书

3. ✅ **设置自动化部署（CI/CD）**
   - 连接 Git 仓库
   - 配置自动构建
   - 代码推送自动部署

4. ✅ **监控应用性能**
   - 查看访问日志
   - 监控性能指标
   - 设置告警通知

5. ✅ **查看服务日志**
   - 实时日志
   - 历史日志
   - 错误日志

6. ✅ **配置自动扩缩容**
   - 设置最小/最大实例数
   - 根据负载自动扩展
   - 优化成本

7. ✅ **设置告警通知**
   - CPU 使用率告警
   - 内存使用率告警
   - 错误率告警

---

## 💡 优化建议

### 性能优化

1. **启用 CDN 加速**
   - 配置静态资源 CDN
   - 提升访问速度

2. **配置图片优化**
   - 使用 Next.js Image 组件
   - 自动优化图片格式

3. **使用缓存策略**
   - 配置响应头
   - 启用浏览器缓存
   - 使用 CDN 缓存

### 成本优化

1. **合理配置实例数**
   - 根据实际负载调整
   - 避免过度配置

2. **使用预留实例**
   - 长期运行可节省成本
   - 按需付费

3. **监控资源使用**
   - 定期查看使用量
   - 及时调整配置

### 安全优化

1. **启用 HTTPS**
   - 配置 SSL 证书
   - 强制 HTTPS 访问

2. **配置安全组**
   - 限制访问来源
   - 防止恶意访问

3. **设置访问控制**
   - 配置 IP 白名单
   - 限制敏感操作

---

## 📞 技术支持

### CloudBase 文档
- 官方文档：https://docs.cloudbase.net/
- 快速开始：https://docs.cloudbase.net/quickstart
- CloudRun 文档：https://docs.cloudbase.net/cloudrun

### Next.js 文档
- 官方文档：https://nextjs.org/docs
- 部署指南：https://nextjs.org/docs/deployment
- 生产优化：https://nextjs.org/docs/production

### 腾讯云支持
- 工单系统：https://console.cloud.tencent.com/workorder
- 社区论坛：https://cloud.tencent.com/developer
- 在线客服：https://cloud.tencent.com/about/connect

---

## 🎯 下一步行动

1. **立即开始部署**
   - 访问 CloudRun 控制台
   - 按照步骤完成部署
   - 测试应用功能

2. **参考详细文档**
   - 阅读 [CLOUDBASE_DEPLOYMENT_STEPS.md](./CLOUDBASE_DEPLOYMENT_STEPS.md)
   - 了解更多部署细节

3. **配置生产环境**
   - 设置环境变量
   - 配置自定义域名
   - 启用监控告警

4. **优化性能**
   - 启用 CDN
   - 配置缓存策略
   - 优化资源加载

---

**祝您部署顺利！** 🚀

如有问题，请参考文档或联系技术支持。
