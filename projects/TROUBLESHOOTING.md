# CloudRun 部署问题排查指南

## 🔍 当前问题

**错误信息**: `Service version not found`  
**错误代码**: `404 Not Found`  
**服务状态**: 服务已创建，但版本构建未完成

---

## 📊 问题分析

### 错误原因

服务已成功创建，但是**在线版本（OnlineVersionInfos）为空**，说明：

1. ✅ 服务配置正确
2. ✅ 环境变量已设置
3. ✅ Dockerfile 存在
4. ⏳ Docker 镜像构建中
5. ⏳ 版本尚未上线

### 预计时间

CloudRun 容器部署需要以下步骤：

| 步骤 | 预计时间 | 说明 |
|------|---------|------|
| 上传代码 | 30-60 秒 | 上传项目文件到云端 |
| 构建镜像 | 2-3 分钟 | 使用 Dockerfile 构建镜像 |
| 推送镜像 | 60-90 秒 | 上传镜像到仓库 |
| 启动容器 | 30-60 秒 | 启动实例并初始化 |
| **总计** | **4-6 分钟** | |

---

## 🔧 解决方案

### 方案 1：访问控制台查看构建日志（推荐）

这是最直接的方式，可以查看详细的构建过程和错误信息。

**步骤**：

1. **访问服务详情页**
   ```
   https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/platform-run?serverName=nrc-web
   ```

2. **查看日志**
   - 在服务详情页，找到"日志"或"构建日志"标签
   - 点击查看实时日志
   - 检查是否有错误信息

3. **常见日志输出**
   
   **正常情况**：
   ```
   [INFO] 开始构建镜像...
   [INFO] 正在下载依赖...
   [INFO] 依赖安装完成
   [INFO] 正在构建项目...
   [INFO] 构建成功
   [INFO] 正在启动容器...
   [INFO] 容器启动成功
   ```
   
   **错误情况**：
   ```
   [ERROR] 构建失败：依赖安装超时
   [ERROR] Dockerfile 语法错误
   [ERROR] 端口冲突
   ```

### 方案 2：等待并重试

如果无法访问控制台，可以：

1. **等待 5-10 分钟**
2. **再次访问服务**
   ```
   https://nrc-web-223371-6-1392812070.sh.run.tcloudbase.com
   ```
3. **如果仍失败**，执行方案 1

### 方案 3：本地测试 Dockerfile

如果怀疑 Dockerfile 有问题，可以在本地测试：

```bash
# 进入项目目录
cd F:\v_bxgxwang\nrc_home\projects

# 构建 Docker 镜像
docker build -t nrc-web-test .

# 运行容器测试
docker run -p 3000:3000 --env-file .env.local nrc-web-test

# 访问 http://localhost:3000 测试
```

**预期结果**：
- 如果本地能成功构建和运行，说明 Dockerfile 没问题
- 如果本地构建失败，需要修正 Dockerfile

---

## 🐛 常见问题排查

### 问题 1：构建超时

**症状**：构建日志长时间卡住，超过 10 分钟

**原因分析**：
- 网络速度慢（依赖下载慢）
- 依赖包太多
- 构建步骤复杂

**解决方案**：
1. 在 Dockerfile 中使用国内镜像源
2. 减少不必要的依赖
3. 增加超时时间（通过控制台配置）

**优化 Dockerfile**：
```dockerfile
# 使用国内镜像源
RUN npm config set registry https://registry.npmmirror.com

# 或者使用淘宝镜像
RUN npm config set registry https://registry.npm.taobao.org
```

### 问题 2：依赖安装失败

**症状**：日志显示 npm install 或 pnpm install 失败

**原因分析**：
- 网络问题
- package.json 或 pnpm-lock.yaml 有问题
- 依赖版本冲突

**解决方案**：
1. 检查网络连接
2. 确认 pnpm-lock.yaml 文件完整
3. 尝试重新生成锁文件：
   ```bash
   rm pnpm-lock.yaml
   pnpm install
   git add pnpm-lock.yaml
   git commit -m "update pnpm-lock.yaml"
   ```

### 问题 3：端口冲突

**症状**：日志显示端口 3000 已被占用

**原因分析**：
- 配置的端口与其他服务冲突

**解决方案**：
1. 确认 Dockerfile 中 `EXPOSE 3000`
2. 确认 serverConfig 中 `Port: 3000`
3. 确保 package.json 中 `start` 脚本监听 3000 端口

### 问题 4：内存不足

**症状**：构建或运行时 OOM (Out of Memory)

**原因分析**：
- 构建或运行时内存不足
- 项目依赖太多

**解决方案**：
1. 升级服务配置（增加内存到 2GB）
2. 在 Dockerfile 中优化内存使用
3. 使用多阶段构建（已配置）

---

## 🔄 重新部署

如果发现问题需要修正后重新部署：

### 方法 1：使用 CLI（推荐）

```bash
# 安装 CloudBase CLI
npm install -g @cloudbase/cli

# 登录
cloudbase login

# 部署
cloudbase deploy
```

### 方法 2：通过控制台

1. 访问服务详情页
2. 点击"重新部署"或"发布"按钮
3. 等待部署完成

### 方法 3：调用部署工具（当前方式）

```bash
# 使用部署脚本
node F:\v_bxgxwang\nrc_home\projects\deploy-cloudrun.js
```

---

## 📝 检查清单

在部署前，确认以下内容：

### 项目文件
- [ ] `package.json` 存在
- [ ] `package-lock.json` 或 `pnpm-lock.yaml` 存在
- [ ] `Dockerfile` 存在
- [ ] `next.config.ts` 配置正确
- [ ] `.env.local` 存在（用于本地测试）

### Dockerfile 检查
- [ ] 基础镜像正确（node:18-alpine）
- [ ] 端口暴露正确（EXPOSE 3000）
- [ ] 启动命令正确（CMD ["node", "server.js"]）
- [ ] 环境变量设置正确

### Next.js 配置
- [ ] `output: 'standalone'` (用于 Docker 部署)
- [ ] 路由配置正确
- [ ] 环境变量引用正确

### 服务配置
- [ ] 服务名称唯一
- [ ] CPU/内存配置合理（0.5核/1GB 或更高）
- [ ] 端口配置正确（3000）
- [ ] 环境变量完整

---

## 🌐 访问地址

**主要地址**：
```
https://nrc-web-223371-6-1392812070.sh.run.tcloudbase.com
```

**备用测试**：
如果主地址无法访问，可以：
1. 等待 3-5 分钟后重试
2. 访问控制台查看状态
3. 联系技术支持

---

## 📞 技术支持

### 获取帮助

1. **官方文档**
   - CloudRun 开发指南：https://docs.cloudbase.net/
   - 错误码查询：https://docs.cloudbase.net/error-code
   - Dockerfile 编写：https://docs.docker.com/

2. **控制台链接**
   - 服务详情：https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/platform-run?serverName=nrc-web
   - 日志监控：https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/devops/log

3. **问题反馈**
   - 腾讯云工单：https://console.cloud.tencent.com/workorder
   - CloudBase 社区：https://cloud.tencent.com/developer

---

## ✅ 下一步行动

### 立即执行

1. **访问控制台查看日志**
   - 点击服务详情链接
   - 查看构建进度
   - 检查是否有错误

2. **如果看到错误**
   - 记录错误信息
   - 参考本文档排查
   - 修正问题后重新部署

3. **如果构建成功**
   - 等待 1-2 分钟让容器启动
   - 访问应用地址测试
   - 逐项测试所有功能

### 后续优化

1. **监控性能**
   - 查看 CPU/内存使用率
   - 观察响应时间
   - 调整配置优化成本

2. **配置域名**（可选）
   - 添加自定义域名
   - 配置 DNS 解析
   - 启用 SSL 证书

3. **持续集成**
   - 配置自动部署
   - 集成 CI/CD 流程
   - 自动化测试

---

**📝 更新时间**: 2026-02-03 10:58:00

**🎯 关键链接**:
- 控制台: https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/platform-run?serverName=nrc-web
- 应用地址: https://nrc-web-223371-6-1392812070.sh.run.tcloudbase.com
