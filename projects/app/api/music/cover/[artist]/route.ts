import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * 获取歌手封面图
 * GET /api/music/cover/:artist
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ artist: string }> }
) {
  try {
    // 解码歌手名（URL 编码的）
    const { artist: artistName } = await params;

    // 封面路径：从环境变量读取音乐目录
    const musicDir = process.env.MUSIC_LIBRARY_PATH || 'F:\\Music';
    const coverPath = path.join(musicDir, artistName, 'cover.jpg');

    // 检查文件是否存在
    if (!fs.existsSync(coverPath)) {
      // 返回 SVG 占位图
      const placeholderSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#8b5cf6"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="60" font-family="Arial, sans-serif">
    ${artistName.charAt(0)}
  </text>
</svg>
      `.trim();

      return new NextResponse(placeholderSvg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // 读取文件
    const fileBuffer = fs.readFileSync(coverPath);

    // 返回图片
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': String(fileBuffer.length),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('❌ 获取封面失败');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
