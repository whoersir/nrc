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
        { error: '获取用户信息失败' },
        { status: 401 }
      );
    }

    const { id: trackId } = await params;

    console.log(`💖 取消收藏: ${user.username} -> ${trackId}`);

    const result = await MusicService.removeFavorite(user.id, trackId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ 取消收藏失败:', error);
    return NextResponse.json(
      { error: error.message || '取消收藏失败' },
      { status: 500 }
    );
  }
}
