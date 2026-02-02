# 音乐播放器 - 快速开始指南

## 🚀 5 分钟快速启动

### 步骤 1：确保数据库表已创建

访问 Supabase SQL Editor：
```
https://supabase.com/dashboard/project/lrfonsjtrltglabckxrz/sql/new
```

检查是否已创建以下表：
- `music_tracks` - 音乐元数据表
- `user_favorites` - 用户收藏表
- `play_history` - 播放历史表

**如果没有**，请复制 `SUPABASE_CREATE_TABLES.sql` 中的 SQL 语句并执行。

---

### 步骤 2：启动开发服务器

```bash
cd projects
pnpm dev
```

服务器将在 `http://localhost:5000` 启动。

---

### 步骤 3：扫描音乐库

**方法 1：使用 curl**
```bash
curl -X POST http://localhost:5000/api/music/scan \
  -H "Content-Type: application/json" \
  -d '{"verbose": true, "extractMetadata": false}'
```

**方法 2：使用浏览器**
打开浏览器控制台（F12），粘贴以下代码：
```javascript
fetch('http://localhost:5000/api/music/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ verbose: true, extractMetadata: false })
})
.then(res => res.json())
.then(data => console.log('扫描完成:', data))
```

**预期输出**：
```json
{
  "totalTracks": 915,
  "totalArtists": 238,
  "syncedCount": 915,
  "errorCount": 0,
  "scanTime": "12.3s"
}
```

---

### 步骤 4：访问播放器

在浏览器中访问：
```
http://localhost:5000/music
```

---

## 🎵 功能使用指南

### 播放音乐

1. 在歌曲列表中点击任意歌曲开始播放
2. 使用底部播放控制器：
   - **播放/暂停**：点击播放按钮
   - **上一首/下一首**：使用左右箭头按钮
   - **音量控制**：拖动音量滑块

### 播放模式切换

点击播放模式按钮（顺序/随机/循环），三种模式循环切换：
- **顺序播放**：按列表顺序依次播放
- **随机播放**：随机选择下一首歌曲
- **单曲循环**：循环播放当前歌曲

### 视图切换

点击顶部视图切换按钮，在三种视图间切换：
- **全部音乐**：显示所有 915 首歌曲
- **歌手列表**：显示 238 位歌手的卡片
- **收藏音乐**：显示你收藏的歌曲

### A-Z 快速跳转

点击字母按钮（# + A-Z）快速筛选：
- 在"全部音乐"视图：按歌曲首字母筛选
- 在"歌手列表"视图：按歌手首字母筛选
- 点击"全部"按钮清除筛选

### 歌手功能

1. 在"歌手列表"视图中，点击任意歌手卡片
2. 弹出对话框显示该歌手的所有歌曲
3. 点击任意歌曲播放
4. 点击"全部播放"按钮播放该歌手的所有歌曲

### 收藏功能

1. 在歌曲列表中，点击红心图标添加收藏
2. 再次点击红心图标取消收藏
3. 切换到"收藏音乐"视图查看所有收藏的歌曲

---

## 🧪 API 测试

### 测试歌曲列表
```bash
curl "http://localhost:5000/api/music/tracks?page=1&limit=10"
```

### 测试歌手列表
```bash
curl "http://localhost:5000/api/music/artists?limit=10"
```

### 测试收藏功能
```bash
# 添加收藏
curl -X POST "http://localhost:5000/api/favorites" \
  -H "Content-Type: application/json" \
  -d '{"trackId": "track_6412cc2d"}'

# 获取收藏列表
curl "http://localhost:5000/api/favorites"

# 取消收藏
curl -X DELETE "http://localhost:5000/api/favorites/track_6412cc2d"
```

### 测试歌手封面
```bash
# 周杰伦的封面（如果有真实封面）
curl -I "http://localhost:5000/api/music/cover/%E5%91%A8%E6%9D%B0%E4%BC%A6"

# 不存在的歌手（返回占位图）
curl -I "http://localhost:5000/api/music/cover/NonExistArtist"
```

---

## 🔧 常见问题

### 1. 扫描音乐库时没有数据？

**原因**：音乐文件路径不正确或无权限

**解决**：
- 确认音乐文件位于 `F:\Music\` 目录
- 确认 Next.js 进程有读取该目录的权限
- 检查目录下是否有 M3U 播放列表文件

### 2. 播放音乐时无法加载？

**原因**：文件路径错误或文件不存在

**解决**：
- 检查浏览器控制台的错误信息
- 确认音乐文件路径正确
- 尝试直接访问文件 URL

### 3. 收藏功能不工作？

**原因**：数据库连接问题或用户认证失败

**解决**：
- 检查 Supabase 连接是否正常
- 检查数据库表是否创建成功
- 查看浏览器控制台的错误信息

### 4. 歌手封面显示错误？

**原因**：封面文件不存在

**解决**：
- 将封面图片命名为 `cover.jpg`
- 放在对应歌手目录下，例如：`F:\Music\周杰伦\cover.jpg`
- 或者，系统会自动显示 SVG 占位图

### 5. TypeScript 编译错误？

**解决**：
```bash
# 清除缓存
rm -rf .next
rm -rf node_modules/.cache

# 重新安装依赖
pnpm install

# 重新启动
pnpm dev
```

---

## 📊 数据统计

扫描完成后，你的音乐库应该包含：

| 项目 | 数量 |
|------|------|
| **总歌曲数** | 915 首 |
| **总歌手数** | 238 位 |
| **总大小** | 约 30GB |
| **最热歌手** | 周杰伦（221 首） |

---

## 🎨 界面预览

### 主界面
- 渐变背景（粉紫蓝）
- 玻璃拟态卡片
- 响应式布局

### 播放控制器
- 歌曲信息（标题、歌手）
- 封面图（呼吸动画）
- 进度条（动画波形）
- 播放控制按钮
- 音量滑块

### 视图切换
- 三个视图切换按钮
- A-Z 字母导航
- 刷新按钮（旋转动画）

### 歌手卡片
- 网格布局（2-5 列）
- 封面图（或占位图）
- 歌手名字
- 歌曲数量

---

## 📱 局域网访问

如果你想让局域网内的其他用户访问：

1. **获取本机 IP 地址**
   ```bash
   # Windows
   ipconfig

   # 查看 "IPv4 地址"，例如：192.168.1.100
   ```

2. **告诉其他用户访问**
   ```
   http://192.168.1.100:5000/music
   ```

3. **确保防火墙允许**
   - Windows 防火墙允许 Node.js
   - 或者临时关闭防火墙进行测试

---

## 🎉 开始使用吧！

一切准备就绪，现在就开始享受你的音乐吧！

如果遇到任何问题，请查看：
- `PROJECT_COMPLETION_SUMMARY.md` - 项目完成总结
- `BACKEND_TEST_REPORT.md` - 后端测试报告
- `FAVORITE_AND_COVER_API_TEST_REPORT.md` - API 测试报告

---

**祝使用愉快！** 🎵🎶
