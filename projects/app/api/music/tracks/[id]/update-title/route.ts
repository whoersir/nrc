import { NextResponse } from 'next/server';
import { MusicService } from '@/lib/music/music-service';

/**
 * 手动更新单首歌曲标题
 * PUT /api/music/tracks/[id]/update-title
 *
 * 路径参数:
 * - id: 歌曲ID
 *
 * 请求体:
 * {
 *   title: string,  // 新标题
 * }
 *
 * 响应:
 * {
 *   success: boolean,
 *   message: string,
 * }
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: trackId } = params;
    const { title } = await request.json();

    console.log(`🎵 收到更新标题请求: ${trackId} -> ${title}`);

    const result = await MusicService.updateTrackTitle(trackId, title);

    return NextResponse.json({
      success: result.success,
      message: result.message,
    });
  } catch (error: any) {
    console.error('❌ 更新标题失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '更新标题失败',
      },
      { status: 500 }
    );
  }
}
