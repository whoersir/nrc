# 局域网部署指南（PM2 方案）

本文档介绍如何在局域网内部署 NRC 应用，供内网用户访问使用。

## 特点

- 崩溃自动重启
- 开机自动启动
- 内存超限自动重启
- 日志管理方便
- 资源占用低

---

## 环境要求

- Node.js 18+
- pnpm 9+
- Windows 操作系统

---

## 快速开始

### 方式一：双击启动（推荐）

1. 双击运行 `start-local.bat`
2. 等待构建完成
3. 服务自动启动

### 方式二：命令行启动

```bash
# 1. 进入项目目录
cd f:/v_bxgxwang/nrc_home/projects

# 2. 安装 PM2（如未安装）
npm install -g pm2

# 3. 构建项目
pnpm build

# 4. 启动服务
pm2 start ecosystem.config.js

# 5. 设置开机自启（可选）
pm2 startup windows
pm2 save
```

---

## 访问方式

### 本机访问

```
http://localhost:5000
```

### 局域网其他设备访问

直接在其他设备浏览器中访问：
```
http://10.75.31.37:5000
```

> 如需修改IP地址，请编辑 `start-local.bat` 中的 `LAN_IP` 变量

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `pm2 status` | 查看服务状态 |
| `pm2 logs nrc-app` | 查看实时日志 |
| `pm2 logs nrc-app --lines 100` | 查看最近100行日志 |
| `pm2 restart nrc-app` | 重启服务 |
| `pm2 stop nrc-app` | 停止服务 |
| `pm2 delete nrc-app` | 删除服务配置 |
| `pm2 monit` | 打开监控面板 |

---

## 开机自启设置

```bash
# 1. 生成开机启动脚本
pm2 startup windows

# 2. 保存当前 PM2 配置
pm2 save
```

---

## 停止服务

### 方式一：双击停止

双击运行 `stop-local.bat`

### 方式二：命令行停止

```bash
pm2 stop nrc-app
pm2 delete nrc-app
```

---

## 日志文件

日志文件存放在 `logs/` 目录：

- `out.log` - 标准输出日志
- `error.log` - 错误日志
- `combined.log` - 合并日志

---

## 环境配置

部署前请确保 `.env.local` 文件已配置：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 应用地址（局域网固定IP）
NEXT_PUBLIC_APP_URL=http://10.75.31.37:5000

# 天气API配置
NEXT_PUBLIC_WEATHER_APP_KEY=your_weather_app_key
NEXT_PUBLIC_WEATHER_UID=your_weather_uid
```

---

## 防火墙设置

如需其他设备访问，请确保 Windows 防火墙允许 5000 端口：

```powershell
# 以管理员身份运行 PowerShell
New-NetFirewallRule -DisplayName "NRC App" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
```

---

## 故障排查

### 服务无法启动

1. 检查端口占用：
   ```bash
   netstat -ano | findstr :5000
   ```

2. 检查依赖是否安装：
   ```bash
   pnpm install
   ```

3. 查看错误日志：
   ```bash
   pm2 logs nrc-app --lines 50
   ```

### 局域网无法访问

1. 确保设备在同一 WiFi/网络下
2. 关闭防火墙或开放 5000 端口
3. 检查 IP 地址是否正确

---

## 文件说明

| 文件 | 说明 |
|------|------|
| `ecosystem.config.js` | PM2 配置文件 |
| `start-local.bat` | 启动脚本（双击运行） |
| `stop-local.bat` | 停止脚本（双击运行） |
| `logs/` | 日志文件目录 |

---

## 更新部署

当代码更新后，重新部署：

```bash
# 1. 拉取最新代码
# git pull

# 2. 重新构建
pnpm build

# 3. 重启服务
pm2 restart nrc-app
```

或双击运行 `start-local.bat` 自动完成。
