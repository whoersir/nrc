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

    console.log(`🖼️ 获取歌手封面: ${artistName}`);

    // 封面路径：F:\Music\{歌手}\cover.jpg
    const coverPath = path.join('F:\\Music', artistName, 'cover.jpg');

    // 检查文件是否存在
    if (!fs.existsSync(coverPath)) {
      console.warn(`⚠️ 封面文件不存在: ${coverPath}`);

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
        'Cache-Control': 'public, max-age=86400', // 缓存 1 天
      },
    });
  } catch (error: any) {
    console.error('❌ 获取封面失败:', error);
    return NextResponse.json(
      { error: error.message || '获取封面失败' },
      { status: 500 }
    );
  }
}
