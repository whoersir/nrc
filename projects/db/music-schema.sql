-- 音乐播放器数据库表结构
-- 创建时间：2026-01-31
-- 说明：音乐元数据、用户收藏、播放历史

-- 音乐元数据表
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
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- 索引
  INDEX idx_artist_first_letter (artist_first_letter),
  INDEX idx_title_first_letter (title_first_letter),
  INDEX idx_artist_title (artist, title)
);

-- 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  track_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- 外键约束
  CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorite_track FOREIGN KEY (track_id) REFERENCES music_tracks(id) ON DELETE CASCADE,

  -- 唯一约束（同一用户不能重复收藏同一首歌）
  UNIQUE(user_id, track_id),

  -- 索引
  INDEX idx_user_created (user_id, created_at DESC)
);

-- 播放历史表
CREATE TABLE IF NOT EXISTS play_history (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  track_id VARCHAR(64) NOT NULL,
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  play_count INT DEFAULT 1,
  last_position INT DEFAULT 0,

  -- 外键约束
  CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_history_track FOREIGN KEY (track_id) REFERENCES music_tracks(id) ON DELETE CASCADE,

  -- 索引
  INDEX idx_user_played (user_id, played_at DESC),
  INDEX idx_user_track (user_id, track_id)
);
