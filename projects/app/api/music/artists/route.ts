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

    const result = await MusicService.getAllArtists({
      letter: letter || undefined,
    });

    return NextResponse.json({
      success: true,
      data: result.artists,
      total: result.total,
    });
  } catch (error) {
    console.error('❌ 获取歌手列表失败');
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
