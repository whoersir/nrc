import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase.client';
import fs from 'fs';
import path from 'path';

/**
 * 初始化数据库表
 * POST /api/db/init
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 500 }
      );
    }

    // 检查环境变量
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      );
    }

    // 读取 SQL 文件
    const sqlPath = path.join(process.cwd(), 'db', 'music-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // 分割 SQL 语句（按分号分割）
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // 逐个执行 SQL 语句
    const results = [];
    const errors = [];

    for (const statement of statements) {
      try {
        const { Client } = await import('pg');
        const client = new Client({ connectionString: databaseUrl });

        await client.connect();
        await client.query(statement);
        await client.end();

        results.push({ success: true });
      } catch (error) {
        errors.push({ error: 'Statement failed' });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: `Database init: ${results.length} success, ${errors.length} failed`,
    });
  } catch (error) {
    console.error('数据库初始化失败');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
