import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import fs from 'fs';
import path from 'path';

/**
 * 流式传输音乐文件
 * GET /api/music/stream/:id
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`🎵 流式传输音乐: ${id}`);

    const supabase = createServerSupabase();
    if (!supabase) {
      console.error('❌ 数据库未连接');
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
      console.error(`❌ 数据库查询错误:`, error);
      return NextResponse.json(
        { error: '歌曲不存在', details: error.message },
        { status: 404 }
      );
    }

    if (!track) {
      console.error(`❌ 未找到歌曲 ID: ${id}`);
      return NextResponse.json(
        { error: '歌曲不存在', trackId: id },
        { status: 404 }
      );
    }

    // 处理文件路径 - 兼容 Windows 和 Unix 路径
    let filePath = track.filename;

    // 使用 path.normalize 规范化路径（处理多余的斜杠、点等）
    filePath = path.normalize(filePath);

    console.log(`📂 尝试加载文件: ${filePath}`);
    console.log(`🔍 原始文件名: ${track.filename}`);
    console.log(`🖥️  当前平台: ${process.platform}`);
    console.log(`📁 当前工作目录: ${process.cwd()}`);
    console.log(`✅ fs.existsSync: ${fs.existsSync(filePath)}`);

    // 如果规范化后的路径不存在，尝试原始路径
    if (!fs.existsSync(filePath) && filePath !== track.filename) {
      console.log(`⚠️  规范化路径检查失败，尝试原始路径: ${track.filename}`);
      console.log(`✅ 原始路径检查: ${fs.existsSync(track.filename)}`);
      if (fs.existsSync(track.filename)) {
        filePath = track.filename;
      }
    }

    // 如果仍然失败，尝试将正斜杠转换为反斜杠（Windows）
    if (!fs.existsSync(filePath) && process.platform === 'win32') {
      const backslashPath = filePath.replace(/\//g, '\\');
      console.log(`⚠️  尝试反斜杠路径: ${backslashPath}`);
      console.log(`✅ 反斜杠路径检查: ${fs.existsSync(backslashPath)}`);
      if (fs.existsSync(backslashPath)) {
        filePath = backslashPath;
      }
    }

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      // 尝试诊断问题
      console.error(`❌ 文件不存在: ${filePath}`);
      console.error(`📝 歌曲信息:`, {
        id: track.id,
        title: track.title,
        filename: track.filename,
        processedPath: filePath,
        platform: process.platform,
        cwd: process.cwd()
      });

      // 尝试找到可能存在的类似文件
      try {
        const dir = filePath.substring(0, filePath.lastIndexOf('\\'));
        if (fs.existsSync(dir)) {
          console.log(`✅ 目录存在: ${dir}`);
          const files = fs.readdirSync(dir);
          console.log(`📂 目录中的文件 (${files.length}个):`, files.slice(0, 10));
        } else {
          console.error(`❌ 目录也不存在: ${dir}`);
        }
      } catch (err) {
        console.error(`❌ 诊断失败:`, err);
      }

      // 返回一个最小的有效 MP3 header，让 audio 元素触发 MEDIA_ERR_SRC_NOT_SUPPORTED 错误
      // 而不是返回 JSON（这会导致 content-type 不匹配）
      const minimalMp3 = Buffer.from([
        0xFF, 0xFB, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
      ]);

      return new NextResponse(minimalMp3, {
        status: 404,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': '30',
          'X-Audio-Error': 'file-not-found',
          'X-Error-Message': '音乐文件不存在',
        },
      });
    }

    // 读取文件流
    const fileStream = fs.createReadStream(filePath);

    // 获取文件大小
    const fileStats = fs.statSync(filePath);
    const fileSize = fileStats.size;

    // 根据格式设置 Content-Type
    const contentTypeMap: Record<string, string> = {
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'flac': 'audio/flac',
      'ogg': 'audio/ogg',
      'wma': 'audio/x-ms-wma',
      'm4a': 'audio/mp4',
      'aac': 'audio/aac',
    };

    const contentType = contentTypeMap[track.format.toLowerCase()] || 'audio/mpeg';

    // 支持范围请求（断点续传）
    const rangeHeader = request.headers.get('range');
    let headers: Record<string, string> = {
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    };

    if (rangeHeader) {
      const range = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(range[0], 10);
      const end = range[1] ? parseInt(range[1], 10) : fileSize - 1;

      headers['Content-Length'] = String(end - start + 1);
      headers['Content-Range'] = `bytes ${start}-${end}/${fileSize}`;

      const chunk = fs.createReadStream(filePath, { start, end });
      return new NextResponse(chunk as any, {
        status: 206,
        headers,
      });
    } else {
      headers['Content-Length'] = String(fileSize);
      return new NextResponse(fileStream as any, {
        status: 200,
        headers,
      });
    }
  } catch (error: any) {
    console.error('❌ 流式传输失败:', error);
    return NextResponse.json(
      { error: error.message || '传输失败' },
      { status: 500 }
    );
  }
}
