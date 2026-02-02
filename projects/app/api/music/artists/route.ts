import { NextResponse } from 'next/server';
import { MusicService } from '@/lib/music/music-service';

/**
 * 获取歌手列表
 * GET /api/music/artists
 *
 * 查询参数:
 * - letter: 首字母筛选（A-Z 或 #）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const letter = searchParams.get('letter');

    console.log('🎵 获取歌手列表:', { letter });

    const result = await MusicService.getAllArtists({
      letter: letter || undefined,
    });

    return NextResponse.json({
      success: true,
      data: result.artists,
      total: result.total,
    });
  } catch (error: any) {
    console.error('❌ 获取歌手列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '获取歌手列表失败',
      },
      { status: 500 }
    );
  }
}
