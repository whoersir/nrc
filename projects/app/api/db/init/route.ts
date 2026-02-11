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
        { error: 'Supabase 客户端未初始化' },
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
        // 使用 supabase.rpc 执行 SQL（如果支持）或者使用 direct SQL
        // 注意：Supabase JS SDK 不直接支持原始 SQL，这里使用 data API

        // 方法1：使用 pg 客户端直接执行
        const { Client } = await import('pg');
        const client = new Client({
          connectionString: process.env.DATABASE_URL
        });

        if (!process.env.DATABASE_URL) {
          return NextResponse.json(
            { error: 'DATABASE_URL 环境变量未设置' },
            { status: 500 }
          );
        }

        await client.connect();
        const result = await client.query(statement);
        await client.end();

        results.push({ statement: statement.substring(0, 50) + '...', success: true });
      } catch (error: any) {
        errors.push({ statement: statement.substring(0, 50) + '...', error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `数据库初始化完成：成功 ${results.length} 条，失败 ${errors.length} 条`,
      results,
      errors,
    });
  } catch (error: any) {
    console.error('数据库初始化失败:', error);
    return NextResponse.json(
      { error: error.message || '数据库初始化失败' },
      { status: 500 }
    );
  }
}
