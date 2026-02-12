import { NextResponse } from 'next/server';
import { MusicService } from '@/lib/music/music-service';
import { ServerAuth } from '@/lib/server-auth';

/**
 * 获取收藏列表
 * GET /api/favorites
 */
export async function GET(request: Request) {
  try {
    const user = await ServerAuth.getCurrentUser(request);
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await MusicService.getUserFavorites(user.id);

    return NextResponse.json({
      success: true,
      data: result.tracks,
      total: result.total,
    });
  } catch (error) {
    console.error('❌ 获取收藏列表失败');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 添加收藏
 * POST /api/favorites
 *
 * 请求体:
 * {
 *   trackId: string
 * }
 */
export async function POST(request: Request) {
  try {
    const user = await ServerAuth.getCurrentUser(request);
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { trackId } = await request.json();

    if (!trackId) {
      return NextResponse.json(
        { error: 'Missing trackId' },
        { status: 400 }
      );
    }

    const result = await MusicService.addFavorite(user.id, trackId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ 添加收藏失败');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
