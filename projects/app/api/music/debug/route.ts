import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

/**
 * 调试 API: 列出所有音乐
 * GET /api/music/debug
 */
export async function GET() {
  try {
    console.log('🔍 查询所有音乐...');

    const supabase = createServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: '数据库未连接' },
        { status: 500 }
      );
    }

    // 查询所有歌曲
    const { data: tracks, error } = await supabase
      .from('music_tracks')
      .select('id, title, artist, format, filename')
      .limit(10);

    if (error) {
      return NextResponse.json(
        { error: '数据库查询错误', details: error.message },
        { status: 500 }
      );
    }

    const { count } = await supabase
      .from('music_tracks')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      total: count,
      tracks: tracks || [],
    });
  } catch (error: any) {
    console.error('❌ 查询失败:', error);
    return NextResponse.json(
      { error: error.message || '查询失败' },
      { status: 500 }
    );
  }
}
