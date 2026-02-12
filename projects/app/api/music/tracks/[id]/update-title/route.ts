import { NextResponse } from 'next/server';
import { MusicService } from '@/lib/music/music-service';

/**
 * 手动更新单首歌曲标题
 * PUT /api/music/tracks/[id]/update-title
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: trackId } = await params;
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    const result = await MusicService.updateTrackTitle(trackId, title);

    return NextResponse.json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    console.error('❌ 更新标题失败');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
