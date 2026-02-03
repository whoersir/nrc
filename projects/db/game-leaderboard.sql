-- ========================================-- 游戏排行榜数据库表创建脚本-- 支持游戏: snake(贪吃蛇), gomoku(五子棋), fps(FPS射击), overcooked(分手厨房)-- ========================================-- 1. 创建游戏分数表
CREATE TABLE IF NOT EXISTS game_scores (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  game_id VARCHAR(32) NOT NULL,
  game_mode VARCHAR(32) DEFAULT 'classic',
  score INT NOT NULL,
  play_time INT,
  details JSONB DEFAULT '{}',
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_game_scores_user_id ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_id ON game_scores(game_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON game_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_played_at ON game_scores(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_user ON game_scores(game_id, user_id);

-- ========================================-- 创建完成!-- ========================================
