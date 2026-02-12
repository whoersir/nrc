/**
 * 基础测试示例
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock environment
const originalEnv = process.env;

describe('基础测试示例', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should add two numbers', () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(1, 2)).toBe(3);
  });

  it('should handle strings', () => {
    const greet = (name: string) => `Hello, ${name}!`;
    expect(greet('World')).toBe('Hello, World!');
  });

  it('should work with arrays', () => {
    const numbers = [1, 2, 3, 4, 5];
    const doubled = numbers.map(n => n * 2);
    expect(doubled).toEqual([2, 4, 6, 8, 10]);
  });
});

describe('API 响应测试', () => {
  it('should create success response', () => {
    const createResponse = (data: unknown, message = 'Success') => ({
      success: true,
      message,
      data,
    });

    const response = createResponse({ id: 1, name: 'Test' });

    expect(response.success).toBe(true);
    expect(response.data).toEqual({ id: 1, name: 'Test' });
  });

  it('should create error response', () => {
    const createErrorResponse = (message: string, statusCode = 500) => ({
      success: false,
      error: message,
      statusCode,
    });

    const response = createErrorResponse('Not found', 404);

    expect(response.success).toBe(false);
    expect(response.error).toBe('Not found');
    expect(response.statusCode).toBe(404);
  });
});

describe('输入验证测试', () => {
  it('should validate email format', () => {
    const isValidEmail = (email: string) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    };

    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
  });

  it('should validate required fields', () => {
    const validateRequired = (obj: Record<string, unknown>, fields: string[]) => {
      const missing = fields.filter(field => !obj[field]);
      return {
        valid: missing.length === 0,
        missing,
      };
    };

    const result = validateRequired(
      { username: 'john', email: 'john@example.com' },
      ['username', 'email', 'password']
    );

    expect(result.valid).toBe(false);
    expect(result.missing).toContain('password');
  });
});

describe('游戏分数计算测试', () => {
  it('should calculate best score from multiple attempts', () => {
    const scores = [100, 250, 180, 300, 220];
    const bestScore = Math.max(...scores);
    expect(bestScore).toBe(300);
  });

  it('should calculate average score', () => {
    const scores = [100, 200, 300];
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    expect(avgScore).toBe(200);
  });

  it('should handle empty scores', () => {
    const scores: number[] = [];
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    expect(bestScore).toBe(0);
  });
});

describe('用户排名计算测试', () => {
  it('should calculate rank correctly', () => {
    const allScores = [
      { userId: '1', score: 300 },
      { userId: '2', score: 250 },
      { userId: '3', score: 200 },
      { userId: '4', score: 150 },
    ];

    // 按分数降序排序
    const sorted = allScores.sort((a, b) => b.score - a.score);

    // 找到某个用户的排名
    const findRank = (userId: string) => {
      const index = sorted.findIndex(s => s.userId === userId);
      return index + 1;
    };

    expect(findRank('1')).toBe(1);
    expect(findRank('2')).toBe(2);
    expect(findRank('3')).toBe(3);
    expect(findRank('4')).toBe(4);
  });
});
