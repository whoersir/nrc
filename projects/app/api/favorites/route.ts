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
        { error: '获取用户信息失败' },
        { status: 401 }
      );
    }

    console.log(`💖 获取用户收藏: ${user.username}`);

    const result = await MusicService.getUserFavorites(user.id);

    return NextResponse.json({
      success: true,
      data: result.tracks,
      total: result.total,
    });
  } catch (error: any) {
    console.error('❌ 获取收藏列表失败:', error);
    return NextResponse.json(
      { error: error.message || '获取收藏失败' },
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
        { error: '获取用户信息失败' },
        { status: 401 }
      );
    }

    const { trackId } = await request.json();

    if (!trackId) {
      return NextResponse.json(
        { error: '缺少 trackId' },
        { status: 400 }
      );
    }

    console.log(`💖 添加收藏: ${user.username} -> ${trackId}`);

    const result = await MusicService.addFavorite(user.id, trackId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ 添加收藏失败:', error);
    return NextResponse.json(
      { error: error.message || '添加收藏失败' },
      { status: 500 }
    );
  }
}
