import { NextResponse } from 'next/server';
import { MusicService } from '@/lib/music/music-service';
import { ServerAuth } from '@/lib/server-auth';

/**
 * 取消收藏
 * DELETE /api/favorites/:id
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await ServerAuth.getCurrentUser(request);
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: trackId } = await params;

    const result = await MusicService.removeFavorite(user.id, trackId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ 取消收藏失败');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
