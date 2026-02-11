-- ========================================
-- 音乐播放器数据库表创建脚本（修正版）
-- 执行环境：Supabase SQL Editor
-- ========================================

-- 1. 创建音乐元数据表
CREATE TABLE IF NOT EXISTS music_tracks (
  id VARCHAR(64) PRIMARY KEY,
  filename VARCHAR(512) NOT NULL,
  title VARCHAR(255) NOT NULL,
  title_pinyin VARCHAR(255),
  title_first_letter CHAR(1),
  artist VARCHAR(255) NOT NULL,
  artist_pinyin VARCHAR(255),
  artist_first_letter CHAR(1),
  album VARCHAR(255),
  duration INT,
  file_size BIGINT,
  format VARCHAR(10),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 创建音乐表索引
CREATE INDEX IF NOT EXISTS idx_artist_first_letter ON music_tracks(artist_first_letter);
CREATE INDEX IF NOT EXISTS idx_title_first_letter ON music_tracks(title_first_letter);
CREATE INDEX IF NOT EXISTS idx_artist_title ON music_tracks(artist, title);

-- 3. 创建用户收藏表（移除外键约束，改为应用层控制）
CREATE TABLE IF NOT EXISTS user_favorites (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  track_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, track_id)
);

-- 4. 创建收藏表索引
CREATE INDEX IF NOT EXISTS idx_user_created ON user_favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorite_track ON user_favorites(track_id);

-- 5. 创建播放历史表（移除外键约束，改为应用层控制）
CREATE TABLE IF NOT EXISTS play_history (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  track_id VARCHAR(64) NOT NULL,
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  play_count INT DEFAULT 1,
  last_position INT DEFAULT 0
);

-- 6. 创建历史表索引
CREATE INDEX IF NOT EXISTS idx_user_played ON play_history(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_track ON play_history(user_id, track_id);

-- ========================================
-- 创建完成！
-- ========================================
