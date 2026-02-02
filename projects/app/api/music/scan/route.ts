import { NextResponse } from 'next/server';
import { MusicService } from '@/lib/music/music-service';

/**
 * 扫描并同步音乐库
 * POST /api/music/scan
 *
 * 请求体:
 * {
 *   force?: boolean,         // 强制重新扫描
 *   extractMetadata?: boolean, // 提取音频元数据
 *   verbose?: boolean         // 详细日志
 * }
 */
export async function POST(request: Request) {
  try {
    const options = await request.json();

    console.log('🎵 收到扫描请求:', options);

    const result = await MusicService.scanAndSync({
      forceRescan: options?.force ?? false,
      extractMetadata: options?.extractMetadata ?? false,
      verbose: options?.verbose ?? true,
    });

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: {
        totalTracks: result.stats.totalTracks,
        totalArtists: result.stats.totalArtists,
        totalSize: result.stats.totalSize,
        syncedCount: result.syncedCount,
        scannedFiles: result.stats.scannedFiles,
        errors: result.stats.errors,
      },
    });
  } catch (error: any) {
    console.error('❌ 扫描失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '扫描失败',
      },
      { status: 500 }
    );
  }
}
