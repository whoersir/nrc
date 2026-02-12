import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 内存存储（生产环境建议用 Redis）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * 简单的 Rate Limiting 中间件
 *
 * 使用方式：在 next.config.js 中配置或在 API 路由中引入
 */

// 配置
const CONFIG = {
  // 窗口时间（毫秒）
  windowMs: 60 * 1000, // 1 分钟

  // 每个 IP 的最大请求数
  maxRequests: 100,

  // 排除的路径
  excludePaths: ['/api/health', '/api/db/tables', '/_next', '/favicon.ico'],
};

export function rateLimit(request: NextRequest): NextResponse | null {
  const ip = request.ip || 'unknown';
  const path = request.nextUrl.pathname;

  // 排除特定路径
  if (CONFIG.excludePaths.some(p => path.startsWith(p))) {
    return null;
  }

  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    // 新窗口
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + CONFIG.windowMs,
    });
    return null;
  }

  if (record.count >= CONFIG.maxRequests) {
    // 超过限制
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: '请求过于频繁，请稍后再试',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)),
          'X-RateLimit-Limit': String(CONFIG.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(record.resetTime),
        },
      }
    );
  }

  // 增加计数
  record.count++;
  rateLimitStore.set(ip, record);

  return null;
}

// 获取当前速率限制状态（用于监控）
export function getRateLimitStatus(ip: string) {
  const record = rateLimitStore.get(ip);
  if (!record) {
    return { remaining: CONFIG.maxRequests, resetTime: null };
  }
  return {
    remaining: Math.max(0, CONFIG.maxRequests - record.count),
    resetTime: record.resetTime > Date.now() ? record.resetTime : null,
  };
}
