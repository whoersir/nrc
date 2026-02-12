import { NextResponse } from 'next/server';
import { MusicService } from '@/lib/music/music-service';

/**
 * 批量清理和更新歌曲标题
 * POST /api/music/tracks/batch-update
 */
export async function POST(request: Request) {
  try {
    const options = await request.json();

    const result = await MusicService.batchUpdateTitles({
      limit: options?.limit,
      dryRun: options?.dryRun ?? false,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ 批量更新标题失败');
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        processedCount: 0,
        updatedCount: 0,
        unchangedCount: 0,
        details: [],
      },
      { status: 500 }
    );
  }
}
