import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * 创建音乐播放器数据库表
 * POST /api/db/tables
 *
 * 返回 SQL 语句，用户需在 Supabase 控制台手动执行
 */
export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Configuration error' },
      { status: 500 }
    );
  }

  const sqlStatements = [
    `CREATE TABLE IF NOT EXISTS music_tracks (
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
    );`,

    `CREATE INDEX IF NOT EXISTS idx_artist_first_letter ON music_tracks(artist_first_letter);`,
    `CREATE INDEX IF NOT EXISTS idx_title_first_letter ON music_tracks(title_first_letter);`,
    `CREATE INDEX IF NOT EXISTS idx_artist_title ON music_tracks(artist, title);`,

    `CREATE TABLE IF NOT EXISTS user_favorites (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      track_id VARCHAR(64) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, track_id)
    );`,
    `CREATE INDEX IF NOT EXISTS idx_user_created ON user_favorites(user_id, created_at DESC);`,

    `CREATE TABLE IF NOT EXISTS play_history (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      track_id VARCHAR(64) NOT NULL,
      played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      play_count INT DEFAULT 1,
      last_position INT DEFAULT 0
    );`,
    `CREATE INDEX IF NOT EXISTS idx_user_played ON play_history(user_id, played_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_user_track ON play_history(user_id, track_id);`,
  ];

  // 开发环境输出 SQL 到日志
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DB] SQL statements prepared:', sqlStatements.length);
  }

  return NextResponse.json({
    success: true,
    message: 'Execute SQL in Supabase console',
    instructions: {
      step1: 'Open Supabase Console',
      step2: 'Go to SQL Editor',
      step3: 'Copy and execute SQL statements',
    },
    sqlStatements,
  });
}
