import { NextResponse } from 'next/server';
import { MusicService } from '@/lib/music/music-service';

/**
 * 获取歌曲列表
 * GET /api/music/tracks
 *
 * 查询参数:
 * - page: 页码（默认1）
 * - limit: 每页数量（默认50）
 * - letter: 首字母筛选（A-Z 或 #）
 * - artist: 歌手筛选
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const letter = searchParams.get('letter');
    const artist = searchParams.get('artist');

    // 开发环境才输出日志
    if (process.env.NODE_ENV !== 'production') {
      console.log('🎵 获取歌曲列表:', { page, limit, letter: letter ? letter[0] : undefined });
    }

    const result = await MusicService.getAllTracks({
      page,
      limit,
      letter: letter || undefined,
      artist: artist || undefined,
    });

    return NextResponse.json({
      success: true,
      data: result.tracks,
      total: result.total,
      page,
      limit,
    });
  } catch (error) {
    console.error('❌ 获取歌曲列表失败');
    return NextResponse.json(
      {
        success: false,
        error: '获取歌曲列表失败',
      },
      { status: 500 }
    );
  }
}
