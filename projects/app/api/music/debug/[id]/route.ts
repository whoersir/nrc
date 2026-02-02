import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import fs from 'fs';
import path from 'path';

/**
 * 诊断音频文件
 * GET /api/music/debug/:id
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = createServerSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: '数据库未连接' },
        { status: 500 }
      );
    }

    // 查询歌曲信息
    const { data: track, error } = await supabase
      .from('music_tracks')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: '查询失败', details: error.message },
        { status: 500 }
      );
    }

    if (!track) {
      return NextResponse.json(
        { error: '歌曲不存在', trackId: id },
        { status: 404 }
      );
    }

    // 处理文件路径
    let filePath = track.filename;
    if (process.platform === 'win32') {
      filePath = filePath.replace(/\//g, '\\');
    } else {
      filePath = filePath.replace(/\\/g, '/');
    }

    // 诊断信息
    const diagnosis: any = {
      track: {
        id: track.id,
        title: track.title,
        artist: track.artist,
        format: track.format,
        duration: track.duration,
      },
      file: {
        originalPath: track.filename,
        processedPath: filePath,
        exists: fs.existsSync(filePath),
      },
      system: {
        platform: process.platform,
        cwd: process.cwd(),
      },
    };

    // 检查目录
    try {
      const dir = path.dirname(filePath);
      diagnosis.directory = {
        path: dir,
        exists: fs.existsSync(dir),
      };

      if (fs.existsSync(dir)) {
        diagnosis.directory.files = fs.readdirSync(dir).slice(0, 20);
        diagnosis.directory.fileCount = fs.readdirSync(dir).length;
      }
    } catch (err: any) {
      diagnosis.directoryError = err.message;
    }

    // 检查文件
    if (diagnosis.file.exists) {
      try {
        const stats = fs.statSync(filePath);
        diagnosis.fileStats = {
          size: stats.size,
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory(),
          modified: stats.mtime,
        };
      } catch (err: any) {
        diagnosis.statsError = err.message;
      }
    }

    return NextResponse.json(diagnosis);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '诊断失败' },
      { status: 500 }
    );
  }
}
