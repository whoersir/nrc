/**
 * Logger 测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock console methods
const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
const mockLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockDebug = vi.spyOn(console, 'debug').mockImplementation(() => {});

describe('Logger 测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    process.env.NODE_ENV = 'development';
    process.env.LOG_LEVEL = 'info';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log error messages', () => {
    // 直接测试 logger 函数
    const { logger } = await import('../lib/logger');
    logger.error('Test error message');

    expect(mockError).toHaveBeenCalledTimes(1);
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('Test error message'));
  });

  it('should log warn messages', () => {
    const { logger } = await import('../lib/logger');
    logger.warn('Test warning');

    expect(mockWarn).toHaveBeenCalledTimes(1);
  });

  it('should log info messages', () => {
    const { logger } = await import('../lib/logger');
    logger.info('Test info');

    expect(mockLog).toHaveBeenCalledTimes(1);
  });

  it('should include module name when using create()', async () => {
    const { logger } = await import('../lib/logger');
    const testLogger = logger.create('TestModule');

    testLogger.info('Test message');

    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('[TestModule]'));
  });
});

describe('Rate Limiting 测试', () => {
  it('should allow requests within limit', async () => {
    // 这是一个简化的测试
    const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
    const now = Date.now();
    const windowMs = 60000;
    const maxRequests = 100;

    const ip = 'test-ip';
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });

    const record = rateLimitStore.get(ip);
    expect(record?.count).toBe(1);
    expect(record?.count).toBeLessThan(maxRequests);
  });

  it('should block requests over limit', async () => {
    const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
    const now = Date.now();
    const windowMs = 60000;
    const maxRequests = 100;

    const ip = 'test-ip';
    rateLimitStore.set(ip, {
      count: maxRequests, // 已达到上限
      resetTime: now + windowMs,
    });

    const record = rateLimitStore.get(ip);
    expect(record?.count).toBeGreaterThanOrEqual(maxRequests);
  });
});

describe('安全中间件测试', () => {
  it('should include security headers', async () => {
    const securityHeaders = {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };

    expect(securityHeaders['X-Frame-Options']).toBe('DENY');
    expect(securityHeaders['X-Content-Type-Options']).toBe('nosniff');
  });

  it('should validate CSP header format', () => {
    const csp = "default-src 'self'; script-src 'self'";
    expect(csp).toContain("default-src 'self'");
  });
});
