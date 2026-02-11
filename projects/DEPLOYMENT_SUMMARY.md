# CloudBase 部署总结

## ✅ 当前状态

- **环境 ID**: `nrc-8ggxdu3m3534afc0`
- **区域**: ap-shanghai（上海）
- **状态**: 已连接并正常运行
- **静态托管**: 已启用
- **CloudRun**: 无服务（可新建）

---

## 🚀 快速开始

### 方法 1：使用部署助手

```bash
# 运行部署助手
node f:\v_bxgxwang\nrc_home\projects\deploy-simple.js
```

### 方法 2：手动部署

#### CloudRun 部署（推荐）

1. 访问: https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/platform-run
2. 点击"新建服务"
3. 配置服务:
   - 服务名称: `nrc-web`
   - 服务类型: 容器型
   - Dockerfile: 使用项目根目录的 `Dockerfile`
   - 端口: 3000
   - CPU: 0.5 核
   - 内存: 1 GB
4. 点击"部署"

#### 静态托管部署（简单）

1. 修改 `next.config.ts`:
   ```typescript
   output: 'export',
   distDir: 'out',
   ```
2. 本地构建:
   ```bash
   cd F:\v_bxgxwang\nrc_home\projects
   pnpm run build
   ```
3. 访问: https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/static-hosting
4. 上传 `out` 目录

---

## 📊 方案对比

| 特性 | CloudRun | 静态托管 |
|------|----------|----------|
| SSR 支持 | ✅ | ❌ |
| API 路由 | ✅ | ❌ |
| 部署复杂度 | 中等 | 简单 |
| 成本 | 按使用量 | 免费（额度内） |
| 适合场景 | 完整应用 | 纯静态站点 |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 📁 项目文件

- `Dockerfile` - CloudRun 生产环境配置
- `Dockerfile.dev` - 开发环境配置
- `deploy-simple.js` - 部署助手脚本
- `CLOUDBASE_DEPLOYMENT_GUIDE.md` - 详细部署指南

---

## 🔗 重要链接

- **CloudBase 控制台**: https://tcb.cloud.tencent.com/
- **CloudRun 管理**: https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/platform-run
- **静态托管管理**: https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/static-hosting
- **环境概览**: https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/overview

---

## 🎯 推荐部署方案

**对于本 Next.js 项目，强烈推荐使用 CloudRun**，原因：
1. ✅ 支持 SSR 和 API 路由
2. ✅ 保持应用完整性
3. ✅ 自动扩缩容
4. ✅ 性能优秀

**仅当满足以下条件时考虑静态托管**：
- 应用纯静态，无服务器功能
- 需要 CDN 全球加速
- 希望免费托管

---

## 📝 环境配置

### 本地开发
```bash
cd F:\v_bxgxwang\nrc_home\projects
pnpm run dev
```

### 构建
```bash
cd F:\v_bxgxwang\nrc_home\projects
pnpm run build
```

### 生产运行
```bash
cd F:\v_bxgxwang\nrc_home\projects
pnpm run start
```

---

## 🔧 故障排除

### 问题: 本地构建失败
**解决方案**:
```bash
# 清理缓存
pnpm store prune
rm -rf node_modules .next
pnpm install
pnpm run build
```

### 问题: Docker 构建失败
**解决方案**:
1. 检查 Dockerfile 语法
2. 确认 Node.js 版本兼容性
3. 查看构建日志定位错误

### 问题: 部署后无法访问
**解决方案**:
1. 检查服务状态（是否在运行中）
2. 确认端口配置正确（3000）
3. 查看服务日志排查错误
4. 检查安全组规则

---

## 📞 技术支持

- **CloudBase 文档**: https://docs.cloudbase.net/
- **Next.js 文档**: https://nextjs.org/docs
- **腾讯云支持**: https://cloud.tencent.com/document/product

---

## ✅ 部署检查清单

- [ ] 环境已连接
- [ ] 选择部署方案
- [ ] Dockerfile 已配置（CloudRun）
- [ ] 本地构建成功
- [ ] 文件已上传/部署
- [ ] 服务正常运行
- [ ] 域名可访问
- [ ] 功能测试通过

---

## 🎉 完成后

部署成功后，您可以：
1. ✅ 通过公网域名访问应用
2. ✅ 配置自定义域名
3. ✅ 设置自动化部署（CI/CD）
4. ✅ 监控应用性能
5. ✅ 查看服务日志和监控

---

**部署愉快！** 🚀
