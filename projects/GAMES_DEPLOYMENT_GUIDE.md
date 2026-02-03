# 游戏集成部署指南

本指南说明如何将 `F:\game` 目录下的三个游戏项目集成到当前项目中。

## 游戏列表

### 1. FPS 射击游戏
- **路径**: `F:\game\fps-game`
- **技术栈**: React 19 + Vite + Three.js + Tailwind CSS
- **特点**: 3D 第一人称射击、实时排行榜、云端分数存储

### 2. 五子棋联机对战
- **路径**: `F:\game\gomoku-game`
- **技术栈**: Vue 3 + Vite + Tailwind CSS + CloudBase
- **特点**: 实时联机对战、房间系统、排行榜、观战模式

### 3. 分手厨房
- **路径**: `F:\game\overcooked-game`
- **技术栈**: React 18 + Phaser 3 + Vite + Tailwind CSS
- **特点**: 合作烹饪、实时同步、订单系统、跨设备联机

## 部署方式

### 方案一：独立部署到 CloudBase（推荐）

每个游戏作为独立应用部署到腾讯云开发静态托管。

#### 步骤 1: 部署 FPS 射击游戏

```powershell
cd F:\game\fps-game

# 安装依赖
npm install

# 构建生产版本
npm run build

# 部署到 CloudBase（需要安装 CLI）
npm install -g @cloudbase/cli
tcb login
tcb framework deploy
```

**部署后访问地址**: `https://your-env-id.tcloudbaseapp.com/fps-game/`

#### 步骤 2: 部署五子棋游戏

```powershell
cd F:\game\gomoku-game

# 安装依赖
npm install

# 配置 CloudBase 环境 ID
# 编辑 src/utils/cloudbase.js，替换为你的环境 ID

# 构建生产版本
npm run build

# 部署到 CloudBase
tcb framework deploy
```

**部署后访问地址**: `https://your-env-id.tcloudbaseapp.com/gomoku/`

#### 步骤 3: 部署分手厨房游戏

```powershell
cd F:\game\overcooked-game

# 安装依赖
npm install

# 配置 CloudBase 环境 ID
# 编辑 src/utils/cloudbase.js，替换为你的环境 ID

# 创建数据库集合
# - game_rooms
# - game_actions
# - game_scores

# 部署云函数
cd cloudfunctions
tcb deploy gameRoom
tcb deploy gameSync
tcb deploy getLeaderboard
tcb deploy updateGameScore

# 构建并部署前端
cd ..
npm run build
tcb framework deploy
```

**部署后访问地址**: `https://your-env-id.tcloudbaseapp.com/overcooked-game/`

### 方案二：集成到当前项目（复杂）

如果需要将游戏代码直接集成到当前 Next.js 项目中，需要解决以下问题：

#### 技术挑战

1. **依赖冲突**
   - FPS 游戏使用 React 19，当前项目使用 React 19.2.3（兼容）
   - 五子棋使用 Vue 3，需要额外配置
   - Phaser 3 游戏引擎体积较大（约 1MB）

2. **构建配置差异**
   - 游戏项目使用 Vite，当前项目使用 Next.js
   - 需要适配不同的构建流程

3. **路由冲突**
   - 游戏项目有自己的路由系统
   - 需要集成到 Next.js App Router

#### 集成步骤（以 FPS 游戏为例）

1. **复制游戏代码**

```powershell
# 复制 FPS 游戏源代码
xcopy /E /I F:\game\fps-game\src F:\v_bxgxwang\nrc_home\projects\games\fps\src
xcopy /E /I F:\game\fps-game\public F:\v_bxgxwang\nrc_home\projects\public\games\fps
```

2. **安装额外依赖**

```bash
cd F:\v_bxgxwang\nrc_home\projects
pnpm add three @react-three/fiber @react-three/drei zustand
pnpm add -D @types/three
```

3. **创建 Next.js 页面**

创建 `app/games/fps/page.tsx`:

```tsx
'use client';

import dynamic from 'next/dynamic';

const FPSGame = dynamic(() => import('@/games/fps/src/App'), {
  ssr: false,
});

export default function FPSPage() {
  return (
    <div className="h-screen w-full">
      <FPSGame />
    </div>
  );
}
```

4. **适配游戏代码**

修改游戏代码以适配 Next.js 环境：
- 替换 `react-router-dom` 为 Next.js `useRouter`
- 调整静态资源路径
- 处理 CloudBase 初始化

## 配置更新

部署完成后，更新 `app/games/page.tsx` 中的游戏配置：

```typescript
const games: Game[] = [
  // ... 其他游戏
  {
    id: 'fps',
    name: 'FPS 射击游戏',
    description: '...',
    status: 'deployed',  // 改为 deployed
    url: 'https://your-env-id.tcloudbaseapp.com/fps-game/',
    // ...
  },
  // ...
];
```

## 数据库配置

### 五子棋游戏

创建集合:
- `game_rooms` - 游戏房间
- `user_rankings` - 用户排名

权限设置: 所有人可读写

### 分手厨房游戏

创建集合:
- `game_rooms` - 游戏房间
- `game_actions` - 游戏动作同步
- `game_scores` - 游戏分数记录

权限设置: 所有人可读写

## 云函数配置

### 五子棋游戏

部署 `cloudfunctions/gameRoom`:
- createRoom - 创建房间
- joinRoom - 加入房间
- placeStone - 落子
- getRankings - 获取排行榜

### 分手厨房游戏

部署以下云函数:
- `gameRoom` - 房间管理
- `gameSync` - 游戏同步
- `getLeaderboard` - 排行榜
- `updateGameScore` - 分数更新

## 测试验证

### FPS 游戏
1. 访问部署地址
2. 输入用户名登录
3. 开始游戏，测试射击功能
4. 检查排行榜是否正常显示

### 五子棋游戏
1. 创建房间
2. 邀请朋友加入（或开两个浏览器窗口）
3. 测试落子同步
4. 测试胜负判定

### 分手厨房游戏
1. 创建合作房间
2. 邀请朋友加入
3. 测试移动和交互
4. 测试订单系统

## 故障排除

### 游戏加载失败
- 检查 CloudBase 环境配置
- 确认静态资源已正确上传
- 查看浏览器控制台错误信息

### 联机功能异常
- 检查数据库权限设置
- 确认云函数正常运行
- 验证实时监听是否正常

### 性能问题
- 检查网络连接
- 优化游戏资源（压缩图片、音频）
- 启用 CDN 加速

## 后续优化

1. **统一用户系统**
   - 将游戏用户与主项目用户打通
   - 实现单点登录

2. **游戏数据互通**
   - 在主项目显示游戏成就
   - 统一的积分系统

3. **移动端适配**
   - 优化移动端操作体验
   - 添加触摸控制支持

4. **社交功能**
   - 添加好友系统
   - 游戏内聊天
   - 分享功能

## 相关文档

- [CloudBase 官方文档](https://docs.cloudbase.net/)
- [Three.js 文档](https://threejs.org/docs/)
- [Phaser 3 文档](https://phaser.io/phaser3)
- [Vue 3 文档](https://vuejs.org/)

## 技术支持

如遇到问题，请检查:
1. CloudBase 控制台日志
2. 浏览器开发者工具 Console
3. 网络请求是否正常
4. 数据库权限配置

---

**最后更新**: 2026-02-02
