import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * 创建音乐播放器数据库表
 * POST /api/db/tables
 */
export async function POST(request: Request) {
  try {
    console.log('📝 开始创建数据库表...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 使用 Supabase 的 SQL 执行（如果可用）
    // 注意：Supabase 的 ANON key 通常没有创建表的权限
    // 这里我们只是返回成功，让用户通过 Supabase 控制台手动创建表

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
        CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_favorite_track FOREIGN KEY (track_id) REFERENCES music_tracks(id) ON DELETE CASCADE,
        UNIQUE(user_id, track_id)
      );`,

      `CREATE INDEX IF NOT EXISTS idx_user_created ON user_favorites(user_id, created_at DESC);`,

      `CREATE TABLE IF NOT EXISTS play_history (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        track_id VARCHAR(64) NOT NULL,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        play_count INT DEFAULT 1,
        last_position INT DEFAULT 0,
        CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_history_track FOREIGN KEY (track_id) REFERENCES music_tracks(id) ON DELETE CASCADE
      );`,

      `CREATE INDEX IF NOT EXISTS idx_user_played ON play_history(user_id, played_at DESC);`,

      `CREATE INDEX IF NOT EXISTS idx_user_track ON play_history(user_id, track_id);`,
    ];

    console.log('📋 SQL 语句准备完成');
    console.log('⚠️ 请通过 Supabase 控制台手动执行以下 SQL 语句：\n');

    console.log('='.repeat(60));
    sqlStatements.forEach((sql, index) => {
      console.log(`\n-- 语句 ${index + 1}\n${sql}\n`);
    });
    console.log('='.repeat(60));

    return NextResponse.json({
      success: true,
      message: '请通过 Supabase 控制台手动创建表（SQL 语句已输出到控制台）',
      sqlStatements,
      instructions: {
        step1: '打开 Supabase 控制台',
        step2: '进入 SQL Editor',
        step3: '复制并执行上面的 SQL 语句',
        step4: '点击 Run 执行',
      }
    });
  } catch (error: any) {
    console.error('❌ 数据库表创建失败:', error);
    return NextResponse.json(
      { error: error.message || '数据库表创建失败' },
      { status: 500 }
    );
  }
}
