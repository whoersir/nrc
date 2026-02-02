-- =====================================================
-- 数据库迁移: 添加title规范化字段
-- 创建时间: 2026-01-31
-- 说明: 为音乐表添加规范化字段,便于搜索和排序优化
-- =====================================================

-- 1. 添加规范化字段
ALTER TABLE music_tracks
ADD COLUMN IF NOT EXISTS title_clean VARCHAR(255) COMMENT '清理后的标题(去除序号、扩展名等)',
ADD COLUMN IF NOT EXISTS title_normalized VARCHAR(255) COMMENT '标准化标题(全小写、去特殊字符)',
ADD COLUMN IF NOT EXISTS artist_clean VARCHAR(255) COMMENT '清理后的歌手名',
ADD COLUMN IF NOT EXISTS artist_normalized VARCHAR(255) COMMENT '标准化歌手名(全小写、去特殊字符)';

-- 2. 添加索引以优化搜索性能
CREATE INDEX IF NOT EXISTS idx_title_clean ON music_tracks(title_clean);
CREATE INDEX IF NOT EXISTS idx_title_normalized ON music_tracks(title_normalized);
CREATE INDEX IF NOT EXISTS idx_artist_clean ON music_tracks(artist_clean);
CREATE INDEX IF NOT EXISTS idx_artist_normalized ON music_tracks(artist_normalized);

-- 3. 为现有数据生成规范化值 (手动执行)
-- 注意: 这部分需要在应用层完成,因为需要使用TitleCleaner类
-- 下面是示例SQL逻辑,实际应该在应用层执行

-- 示例: 更新title_clean (需要应用层清理逻辑)
-- UPDATE music_tracks
-- SET title_clean = REGEXP_REPLACE(
--   REGEXP_REPLACE(
--     REGEXP_REPLACE(title, '\\.(mp3|wav|flac|ogg|wma|m4a|aac)$', ''),
--     '^\\d+[\\.\\s-]+', ''
--   ),
--   '\\s+', ' '
-- ) WHERE title_clean IS NULL;

-- 示例: 更新title_normalized
-- UPDATE music_tracks
-- SET title_normalized = LOWER(
--   REGEXP_REPLACE(
--     REGEXP_REPLACE(title, '[^a-zA-Z0-9\\u4e00-\\u9fa5]', ''),
--     '\\s+', ''
--   )
-- ) WHERE title_normalized IS NULL;

-- =====================================================
-- 使用说明
-- =====================================================
--
-- 1. 应用此迁移:
--    - 在Supabase控制台的SQL编辑器中执行此脚本
--    - 或使用 supabase migration 命令
--
-- 2. 更新现有数据:
--    - 使用 POST /api/music/tracks/batch-update API
--    - 该API会自动生成清理后的title并更新相关字段
--
-- 3. 应用代码适配:
--    - 在file-scanner.ts中已集成TitleCleaner
--    - 在扫描和更新时自动填充这些字段
--
-- =====================================================
