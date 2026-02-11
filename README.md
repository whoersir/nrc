# 个人云空间项目

一个功能丰富的个人云空间应用，集成了音乐播放、AI 助手、个人空间和在线游戏等功能。

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.0.0-f69220?style=for-the-badge&logo=pnpm)](https://pnpm.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [环境配置](#环境配置)
- [API 端点](#api-端点)
- [部署](#部署)
- [开发指南](#开发指南)
- [文档索引](#文档索引)

## 功能特性

### 个人空间
- 自定义用户专属空间
- 个性化组件展示
- 用户资料管理
- 昵称和个人信息设置

### AI Agent 助手
- 智能对话功能
- 多轮对话支持
- 流式响应
- 会话历史管理

### 音乐播放器
- 本地音乐库扫描
- 音乐播放控制（播放/暂停/上一首/下一首）
- 播放进度拖动
- 音量控制
- 播放队列管理
- 收藏歌曲功能
- 封面显示
- 歌曲元数据提取
- 按歌手、专辑分类
- 播放历史记录

### 在线游戏
- 🐍 贪吃蛇 - 经典街机游戏，支持排行榜
- ⭕ 五子棋 - 双人对战策略游戏
- 🏆 游戏排行榜 - 记录高分，与好友竞技

### 用户系统
- 用户注册和登录
- Supabase 认证集成
- 会话管理

## 技术栈

### 前端框架
- **Next.js 16.1.1** - React 框架
- **React 19.2.3** - UI 库
- **TypeScript 5** - 类型安全

### UI 组件
- **Radix UI** - 无障碍组件库
- **shadcn/ui** - 高质量 UI 组件
- **Lucide React** - 图标库
- **Tailwind CSS 4** - 样式框架
- **next-themes** - 主题管理
- **sonner** - Toast 通知

### 状态管理和表单
- **React Hook Form** - 表单管理
- **Zod** - 数据验证
- **date-fns** - 日期处理

### 数据存储
- **Supabase** - 后端服务
  - PostgreSQL 数据库
  - 用户认证
  - 实时订阅
- **Drizzle ORM** - 数据库 ORM

### 其他依赖
- **AWS SDK** - 云存储
- **Embla Carousel** - 轮播组件
- **Recharts** - 数据可视化
- **cmdk** - 命令面板

## 快速开始

### 前置要求

- Node.js >= 18
- pnpm >= 9.0.0
- Supabase 账号

### 安装依赖

```bash
pnpm install
```

### 环境配置

创建 `.env.local` 文件：

```env
# Supabase 环境配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 应用地址
NEXT_PUBLIC_APP_URL=http://localhost:5000

# 天气API配置
NEXT_PUBLIC_WEATHER_APP_KEY=your-api-key
NEXT_PUBLIC_WEATHER_UID=your-uid
```

### 启动开发服务器

```bash
# 启动开发服务器（默认端口 5000）
pnpm dev

# 启动开发服务器（legacy 模式）
pnpm dev:legacy
```

访问应用：http://localhost:5000

### 构建生产版本

```bash
pnpm build
pnpm start
```

### 类型检查

```bash
pnpm ts-check
```

### 代码检查

```bash
pnpm lint
```

## 项目结构

```
projects/
├── app/                      # Next.js App Router
│   ├── api/                  # API 路由
│   │   ├── music/            # 音乐相关 API
│   │   ├── favorites/        # 收藏 API
│   │   └── ...
│   ├── music/               # 音乐播放器页面
│   ├── chat/                # AI 聊天页面
│   ├── profile/             # 个人空间页面
│   ├── games/               # 游戏页面
│   ├── login/               # 登录页面
│   ├── register/            # 注册页面
│   ├── layout.tsx           # 根布局
│   └── page.tsx            # 首页
├── src/                      # 源代码
│   ├── components/          # 共享组件
│   ├── lib/                 # 工具库
│   ├── services/            # 服务层
│   ├── types/              # 类型定义
│   └── storage/            # 数据存储
├── db/                       # 数据库相关
├── services/                 # API 服务
├── public/                   # 静态资源
├── components.json           # shadcn/ui 配置
├── next.config.ts          # Next.js 配置
├── tsconfig.json           # TypeScript 配置
├── tailwind.config.ts      # Tailwind 配置
└── package.json            # 项目配置
```

## 环境配置

### 必需变量

| 变量名 | 说明 | 示例 |
|---------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_APP_URL` | 应用访问地址 | `http://localhost:5000` |

### 可选变量

| 变量名 | 说明 | 示例 |
|---------|------|------|
| `NEXT_PUBLIC_WEATHER_APP_KEY` | 天气 API 密钥 | `your-weather-api-key` |
| `NEXT_PUBLIC_WEATHER_UID` | 天气 API 用户 ID | `your-weather-uid` |

## API 端点

### 音乐 API

#### 扫描音乐库
```http
POST /api/music/scan
Content-Type: application/json

{
  "verbose": true,
  "extractMetadata": false
}
```

#### 获取歌曲列表
```http
GET /api/music/tracks?page=1&limit=10
```

#### 获取歌手列表
```http
GET /api/music/artists?limit=10
```

#### 搜索歌曲
```http
GET /api/music/search?q=搜索关键词
```

### 收藏 API

#### 获取收藏列表
```http
GET /api/favorites
```

#### 添加收藏
```http
POST /api/favorites
Content-Type: application/json

{
  "trackId": "track_6412cc2d"
}
```

#### 删除收藏
```http
DELETE /api/favorites/:trackId
```

## 部署

### 🎉 CloudBase 部署（已完成）

**部署状态**：✅ 已成功部署

**访问地址**：https://nrc-web-223371-6-1392812070.sh.run.tcloudbase.com

**部署信息**：
- **服务名称**：nrc-web
- **服务类型**：容器型（CloudRun）
- **CPU**：0.5 核
- **内存**：1 GB
- **端口**：3000
- **状态**：正常运行
- **自动扩缩容**：已启用

**管理控制台**：
- 服务详情：https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/platform-run?serverName=nrc-web
- 服务监控：https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/devops/log

### Vercel 部署

```bash
npm install -g vercel
vercel
```

### 自定义服务器部署

```bash
pnpm build
pnpm start
```

## 开发指南

### 添加新页面

1. 在 `app/` 目录创建新文件夹
2. 添加 `page.tsx` 文件
3. 实现页面组件

### 添加 API 端点

1. 在 `app/api/` 目录创建新文件夹
2. 添加 `route.ts` 文件
3. 实现处理逻辑

### 数据库操作

使用 Drizzle ORM：

```typescript
import { db } from '@/lib/db';
import { users } from '@/lib/schema';

// 查询用户
const user = await db.select().from(users).where(eq(users.id, userId));

// 插入数据
await db.insert(users).values({ name: 'John' });
```

### 组件样式

使用 Tailwind CSS 和 shadcn/ui 组件：

```tsx
import { Button } from '@/components/ui/button';

<Button className="bg-blue-500 hover:bg-blue-600">
  Click me
</Button>
```

## 文档索引

- [QUICK_START.md](./projects/QUICK_START.md) - 快速启动指南
- [SUPABASE.md](./projects/SUPABASE.md) - Supabase 配置说明
- [SUPABASE_CREATE_TABLES.sql](./projects/SUPABASE_CREATE_TABLES.sql) - 数据库表创建脚本
- [DATABASE_SQL.sql](./projects/DATABASE_SQL.sql) - 数据库 SQL 脚本
- [DEPLOYMENT_GUIDE.md](./projects/DEPLOYMENT_GUIDE.md) - 部署指南
- [TROUBLESHOOTING.md](./projects/TROUBLESHOOTING.md) - 问题排查指南

## 常见问题

### Q: 如何重置数据库？

A: 在 Supabase 控制台执行 `SUPABASE_CREATE_TABLES.sql` 中的 DROP 和 CREATE 语句。

### Q: 音乐扫描失败怎么办？

A: 检查音乐文件路径是否正确，确保有读取权限，可以尝试重新扫描。

### Q: 如何切换主题？

A: 使用 `next-themes` 提供的 `useTheme` 钩子：

```typescript
const { theme, setTheme } = useTheme();
setTheme('dark');
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或联系项目维护者。
