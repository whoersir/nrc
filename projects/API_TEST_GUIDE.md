# 音乐播放器 API 测试指南

## ✅ 已完成的测试

### 1. M3U 文件解析
- ✅ 状态：通过
- 📊 结果：成功解析 238 个播放列表
- 📋 数据：238 位歌手，915 首歌曲

### 2. 拼音转换功能
- ✅ 状态：通过
- 🔤 测试项：
  - 中文转拼音：`周杰伦` → `zhoujielun`
  - 首字母提取：`陈奕迅` → `C`
  - 英文处理：`Hello` → `H`

### 3. 排序和分组
- ✅ 状态：通过
- 📊 结果：按拼音正确排序，A-Z 分组正常

---

## 📝 数据库表创建

由于 Supabase ANON Key 权限限制，需要**手动创建数据库表**。

### 方法 1：通过 Supabase 控制台（推荐）

1. 打开 Supabase SQL Editor：
   ```
   https://supabase.com/dashboard/project/lrfonsjtrltglabckxrz/sql/new
   ```

2. 复制 `DATABASE_SQL.sql` 文件内容

3. 粘贴到 SQL Editor

4. 点击 "Run" 执行

5. 确认所有表都创建成功

### 方法 2：使用 API（需要管理员权限）

```bash
curl -X POST http://localhost:5000/api/db/tables
```

这个 API 会输出所有 SQL 语句，你可以复制到 Supabase 控制台执行。

---

## 🧪 API 测试步骤

### 前提条件
1. ✅ 开发服务器已启动：`http://localhost:5000`
2. ✅ 数据库表已创建（参考上面的步骤）
3. ✅ 已登录用户（收藏功能需要）

---

### 测试 1：创建数据库表

```bash
curl -X POST http://localhost:5000/api/db/tables
```

**预期结果**：
```json
{
  "success": true,
  "message": "请通过 Supabase 控制台手动创建表（SQL 语句已输出到控制台）",
  "sqlStatements": [...],
  "instructions": {...}
}
```

---

### 测试 2：扫描音乐库

```bash
curl -X POST http://localhost:5000/api/music/scan \
  -H "Content-Type: application/json" \
  -d '{
    "verbose": true,
    "extractMetadata": false
  }'
```

**预期结果**：
```json
{
  "success": true,
  "message": "扫描完成，共 915 首歌曲",
  "data": {
    "totalTracks": 915,
    "totalArtists": 238,
    "totalSize": "...",
    "syncedCount": 915,
    "scannedFiles": 915,
    "errors": []
  }
}
```

---

### 测试 3：获取歌曲列表

```bash
# 获取所有歌曲（分页）
curl "http://localhost:5000/api/music/tracks?page=1&limit=20"

# 按首字母筛选
curl "http://localhost:5000/api/music/tracks?page=1&limit=20&letter=A"

# 按歌手筛选
curl "http://localhost:5000/api/music/tracks?page=1&limit=20&artist=周杰伦"
```

**预期结果**：
```json
{
  "success": true,
  "data": [
    {
      "id": "track_xxx",
      "filename": "01. 十年.mp3",
      "title": "十年",
      "artist": "陈奕迅",
      "album": "...",
      "duration": 272,
      "format": "mp3",
      "added_at": "2026-01-31T..."
    }
  ],
  "total": 915,
  "page": 1,
  "limit": 20
}
```

---

### 测试 4：获取歌手列表

```bash
# 获取所有歌手
curl "http://localhost:5000/api/music/artists"

# 按首字母筛选
curl "http://localhost:5000/api/music/artists?letter=A"
```

**预期结果**：
```json
{
  "success": true,
  "data": [
    {
      "name": "阿杜",
      "pinyin": "adu",
      "firstLetter": "A",
      "trackCount": 28
    },
    {
      "name": "艾敬",
      "pinyin": "aijing",
      "firstLetter": "A",
      "trackCount": 15
    }
  ],
  "total": 238
}
```

---

### 测试 5：流式传输音乐

```bash
# 替换 {trackId} 为实际的歌曲 ID
curl "http://localhost:5000/api/music/stream/track_xxx" \
  --output test.mp3
```

**预期结果**：
- HTTP 状态码：200 或 206（断点续传）
- Content-Type: `audio/mpeg`
- 返回音频文件流

---

### 测试 6：获取歌手封面

```bash
# 替换 {artistName} 为实际歌手名
curl "http://localhost:5000/api/music/cover/周杰伦" \
  --output cover.jpg
```

**预期结果**：
- HTTP 状态码：200
- Content-Type: `image/jpeg`
- 返回封面图片

---

### 测试 7：获取用户收藏（需要登录）

```bash
curl "http://localhost:5000/api/favorites"
```

**预期结果**：
```json
{
  "success": true,
  "data": [...],
  "total": 0
}
```

---

### 测试 8：添加收藏（需要登录）

```bash
curl -X POST http://localhost:5000/api/favorites \
  -H "Content-Type: application/json" \
  -d '{
    "trackId": "track_xxx"
  }'
```

**预期结果**：
```json
{
  "success": true,
  "message": "收藏成功"
}
```

---

### 测试 9：取消收藏（需要登录）

```bash
curl -X DELETE "http://localhost:5000/api/favorites/track_xxx"
```

**预期结果**：
```json
{
  "success": true,
  "message": "取消收藏成功"
}
```

---

## 🌐 浏览器测试

你也可以直接在浏览器中测试：

### 1. 访问 API 端点
```
http://localhost:5000/api/music/tracks
http://localhost:5000/api/music/artists
```

### 2. 使用浏览器控制台
```javascript
// 获取歌曲列表
fetch('http://localhost:5000/api/music/tracks')
  .then(r => r.json())
  .then(data => console.log(data));

// 扫描音乐库
fetch('http://localhost:5000/api/music/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ verbose: true })
})
  .then(r => r.json())
  .then(data => console.log(data));
```

---

## 📋 测试检查清单

- [ ] 数据库表已创建（music_tracks, user_favorites, play_history）
- [ ] 扫描音乐库成功
- [ ] 获取歌曲列表成功
- [ ] 获取歌手列表成功
- [ ] 流式传输音乐成功
- [ ] 获取歌手封面成功
- [ ] 添加收藏成功
- [ ] 取消收藏成功
- [ ] 按字母筛选成功
- [ ] 分页功能正常

---

## 🚀 下一步

所有测试通过后，我们可以开始 **Phase 3：前端 UI 重构**。

包括：
- ✅ 三种视图切换（全部音乐 / 歌手列表 / 收藏音乐）
- ✅ A-Z 快速跳转导航
- ✅ 播放模式切换（顺序/随机/单曲循环）
- ✅ 刷新按钮
- ✅ 歌手卡片布局
- ✅ 歌手歌曲对话框

---

*更新时间：2026-01-31*
*状态：后端测试完成，等待数据库表创建*
