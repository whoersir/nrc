# CloudBase 部署指南

## 📋 前提条件

- ✅ CloudBase 环境已连接：`nrc-8ggxdu3m3534afc0`
- ✅ 静态托管已启用
- ✅ 项目配置已完成

---

## 🚀 方案一：CloudRun 部署（推荐）

### 为什么选择 CloudRun？
- ✅ 支持完整 Next.js 功能（SSR、API 路由等）
- ✅ 自动扩缩容，无需手动管理服务器
- ✅ 支持 WebSocket 和实时功能
- ✅ 适合需要后端逻辑的应用

### 部署步骤

#### 步骤 1：打开 CloudBase 控制台

访问：https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/platform-run

#### 步骤 2：创建新服务

1. 点击"新建服务"
2. 配置服务：
   - **服务名称**：`nrc-web`（或其他您喜欢的名称）
   - **服务类型**：容器型
   - **代码来源**：本地上传
   - **构建目录**：`/`
   - **Dockerfile**：选择项目根目录的 `Dockerfile`
   - **端口**：`3000`

#### 步骤 3：配置资源规格

- **CPU**：0.5 核（可根据需要调整）
- **内存**：1 GB
- **最小实例数**：1（确保快速响应）
- **最大实例数**：2

#### 步骤 4：配置访问类型

- **访问类型**：公网访问
- **域名**：使用自动分配的域名或配置自定义域名

#### 步骤 5：部署

1. 点击"部署"
2. 等待构建和部署完成（大约 3-5 分钟）
3. 部署成功后会显示访问地址

---

## 🌐 方案二：静态托管部署（简单快速）

### 为什么选择静态托管？
- ✅ 部署简单，只需上传静态文件
- ✅ 使用 CDN 加速，全球访问快速
- ✅ 免费（在免费额度内）
- ⚠️ 不支持 SSR 和动态功能
- ⚠️ 需要先本地构建

### 部署步骤

#### 步骤 1：本地构建

```bash
# 进入项目目录
cd F:\v_bxgxwang\nrc_home\projects

# 清理旧的构建
rm -rf .next out

# 构建项目
pnpm run build

# 导出静态文件
pnpm run export
```

#### 步骤 2：打开静态托管控制台

访问：https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/static-hosting

#### 步骤 3：上传文件

1. 点击"上传文件"
2. 选择构建输出目录（通常是 `out` 目录）
3. 等待上传完成

#### 步骤 4：访问应用

访问地址：https://nrc-8ggxdu3m3534afc0-1392812070.tcloudbaseapp.com

---

## 🎯 推荐方案对比

| 特性 | CloudRun | 静态托管 |
|------|----------|----------|
| **SSR 支持** | ✅ | ❌ |
| **API 路由** | ✅ | ❌ |
| **部署复杂度** | 中等 | 简单 |
| **性能** | 高（动态） | 高（静态） |
| **成本** | 按使用量计费 | 免费（在额度内） |
| **适合场景** | 完整应用 | 纯静态站点 |

---

## 📝 环境配置

### 当前环境信息
- **环境 ID**：`nrc-8ggxdu3m3534afc0`
- **区域**：ap-shanghai（上海）
- **状态**：正常
- **静态托管域名**：`nrc-8ggxdu3m3534afc0-1392812070.tcloudbaseapp.com`

### 环境变量

如果需要配置环境变量，请在 `.env.local` 中添加：

```env
# CloudBase 配置
NEXT_PUBLIC_CLOUDBASE_ENV_ID=nrc-8ggxdu3m3534afc0

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 其他配置
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

---

## 🔧 故障排除

### 构建失败

1. **清理缓存**
   ```bash
   pnpm store prune
   rm -rf node_modules .next
   pnpm install
   ```

2. **检查 Node.js 版本**
   ```bash
   node --version  # 应该是 18.x 或更高
   ```

3. **使用 npm 代替 pnpm**
   ```bash
   npm install
   npm run build
   ```

### 部署失败

1. **检查 Dockerfile 语法**
   ```bash
   docker build -t nrc-web .
   ```

2. **查看 CloudRun 日志**
   - 在 CloudBase 控制台 → CloudRun → 服务详情 → 日志

3. **检查端口配置**
   - 确保应用监听 3000 端口
   - Dockerfile 中 `EXPOSE 3000`

### 访问失败

1. **检查访问类型**
   - 确保启用了"公网访问"

2. **检查安全组规则**
   - 在腾讯云控制台配置安全组，允许 80/443 端口

3. **查看 DNS 解析**
   ```bash
   nslookup nrc-8ggxdu3m3534afc0-1392812070.tcloudbaseapp.com
   ```

---

## 📞 支持与文档

- **CloudBase 控制台**：https://tcb.cloud.tencent.com/
- **CloudBase 文档**：https://docs.cloudbase.net/
- **Next.js 文档**：https://nextjs.org/docs
- **Tencent Cloud 文档**：https://cloud.tencent.com/document/product/876

---

## ✅ 部署检查清单

- [ ] CloudBase 环境已连接
- [ ] 选择部署方案（CloudRun 或静态托管）
- [ ] 本地构建成功
- [ ] Dockerfile 已配置（仅 CloudRun）
- [ ] 环境变量已设置
- [ ] 文件已上传/部署
- [ ] 域名可正常访问
- [ ] 功能测试通过

---

## 🎉 完成后

部署成功后，您可以：
1. 访问您的应用
2. 配置自定义域名
3. 设置自动化部署（CI/CD）
4. 监控应用性能和日志

如有问题，请查看故障排除部分或联系技术支持。
