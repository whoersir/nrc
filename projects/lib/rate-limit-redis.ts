import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Redis Rate Limiter（生产环境推荐）
 * 
 * 需要安装：pnpm add ioredis
 * 环境变量：REDIS_URL=redis://localhost:6379
 */

// 内存存储（开发/测试环境）
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// Redis 客户端（懒加载）
let redis: any = null;

async function getRedisClient() {
  if (redis) return redis;
  
  try {
    const Redis = (await import('ioredis')).default;
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      console.warn('[RateLimit] REDIS_URL not set, using memory store');
      return null;
    }
    
    redis = new Redis(redisUrl);
    return redis;
  } catch (e) {
    console.warn('[RateLimit] Redis not available, using memory store');
    return null;
  }
}

const CONFIG = {
  windowMs: 60 * 1000, // 1 分钟
  maxRequests: 100,
  excludePaths: ['/api/health', '/api/db/tables', '/_next', '/favicon.ico'],
};

export async function rateLimit(request: NextRequest): Promise<NextResponse | null> {
  const ip = request.ip || 'unknown';
  const path = request.nextUrl.pathname;

  if (CONFIG.excludePaths.some(p => path.startsWith(p))) {
    return null;
  }

  const key = `ratelimit:${ip}`;
  const now = Date.now();
  const windowStart = now - (now % CONFIG.windowMs);

  // 尝试使用 Redis
  const client = await getRedisClient();
  
  if (client) {
    // Redis 实现
    const count = await client.incr(key);
    
    if (count === 1) {
      await client.pexpire(key, CONFIG.windowMs);
    }
    
    if (count > CONFIG.maxRequests) {
      const ttl = await client.pttl(key);
      return createRateLimitResponse(ttl, count - 1);
    }
    
    return null;
  }

  // 内存实现（后备）
  const record = memoryStore.get(ip);

  if (!record || now > record.resetTime) {
    memoryStore.set(ip, { count: 1, resetTime: now + CONFIG.windowMs });
    return null;
  }

  if (record.count >= CONFIG.maxRequests) {
    return createRateLimitResponse(record.resetTime - now, record.count);
  }

  record.count++;
  return null;
}

function createRateLimitResponse(retryAfter: number, remaining: number): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: 'Too Many Requests',
      message: '请求过于频繁，请稍后再试',
      retryAfter: Math.ceil(retryAfter / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(retryAfter / 1000)),
        'X-RateLimit-Limit': String(CONFIG.maxRequests),
        'X-RateLimit-Remaining': String(Math.max(0, CONFIG.maxRequests - remaining)),
      },
    }
  );
}

export function getRateLimitStatus(ip: string) {
  const record = memoryStore.get(ip);
  return {
    remaining: record ? CONFIG.maxRequests - record.count : CONFIG.maxRequests,
    resetTime: record?.resetTime || null,
  };
}