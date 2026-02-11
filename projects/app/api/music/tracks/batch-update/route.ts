import { NextResponse } from 'next/server';
import { MusicService } from '@/lib/music/music-service';

/**
 * 批量清理和更新歌曲标题
 * POST /api/music/tracks/batch-update
 *
 * 请求体:
 * {
 *   limit?: number,      // 处理数量限制 (不传则处理全部)
 *   dryRun?: boolean,    // 预演模式,不实际更新数据库 (用于预览)
 * }
 *
 * 响应:
 * {
 *   success: boolean,
 *   message: string,
 *   processedCount: number,
 *   updatedCount: number,
 *   unchangedCount: number,
 *   details: Array<{
 *     id: string,
 *     originalTitle: string,
 *     newTitle: string,
 *     changed: boolean,
 *   }>,
 * }
 */
export async function POST(request: Request) {
  try {
    const options = await request.json();

    console.log('🎵 收到批量更新标题请求:', options);

    const result = await MusicService.batchUpdateTitles({
      limit: options?.limit,
      dryRun: options?.dryRun ?? false,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ 批量更新标题失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || '批量更新标题失败',
        processedCount: 0,
        updatedCount: 0,
        unchangedCount: 0,
        details: [],
      },
      { status: 500 }
    );
  }
}
