import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import fs from 'fs';
import path from 'path';

/**
 * 流式传输音乐文件
 * GET /api/music/stream/:id
 *
 * 支持范围请求（断点续传）
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabase();

    if (!supabase) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
    }

    // 查询歌曲信息
    const { data: track, error } = await supabase
      .from('music_tracks')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // 处理文件路径
    let filePath = path.normalize(track.filename);

    // 尝试多个路径变体
    const pathVariants = [
      filePath,
      track.filename,
      process.platform === 'win32' ? filePath.replace(/\//g, '\\') : filePath,
    ].filter((p, i, arr) => arr.indexOf(p) === i);

    let validPath = pathVariants.find(p => fs.existsSync(p));

    if (!validPath) {
      // 文件不存在，返回错误
      const minimalMp3 = Buffer.from([0xFF, 0xFB, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00]);
      return new NextResponse(minimalMp3, {
        status: 404,
        headers: { 'Content-Type': 'audio/mpeg', 'X-Error': 'file-not-found' },
      });
    }

    const fileStats = fs.statSync(validPath);
    const fileSize = fileStats.size;

    // Content-Type 映射
    const contentTypeMap: Record<string, string> = {
      'mp3': 'audio/mpeg', 'wav': 'audio/wav', 'flac': 'audio/flac',
      'ogg': 'audio/ogg', 'm4a': 'audio/mp4', 'aac': 'audio/aac',
    };
    const contentType = contentTypeMap[track.format?.toLowerCase()] || 'audio/mpeg';

    // 范围请求支持
    const rangeHeader = request.headers.get('range');
    if (rangeHeader) {
      const [startStr, endStr] = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : fileSize - 1;

      headers = {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(end - start + 1),
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      };

      return new NextResponse(fs.createReadStream(validPath, { start, end }), {
        status: 206,
        headers,
      });
    }

    return new NextResponse(fs.createReadStream(validPath), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileSize),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Stream error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
