/**
 * 简单日志系统
 *
 * 支持不同日志级别：
 * - error: 错误
 * - warn: 警告
 * - info: 信息
 * - debug: 调试（仅开发环境）
 */

// 日志级别
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// 配置
const CONFIG = {
  level: (process.env.LOG_LEVEL || 'info') as LogLevel,
  showTimestamp: true,
};

// 级别优先级
const LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// 获取当前级别数字
const currentLevel = LEVELS[CONFIG.level] || LEVELS.info;

// 格式化消息
function formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
  const timestamp = CONFIG.showTimestamp
    ? new Date().toISOString().slice(0, 19).replace('T', ' ')
    : '';

  const prefix = `[${timestamp}] [${level.toUpperCase()}]`.trim();

  if (args.length > 0) {
    return `${prefix} ${message} ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}`;
  }

  return `${prefix} ${message}`;
}

// 日志输出函数
function log(level: LogLevel, message: string, ...args: unknown[]): void {
  // 生产环境只输出 error 和 warn
  if (process.env.NODE_ENV === 'production' && level === 'debug') {
    return;
  }

  // 检查是否应该输出
  if (LEVELS[level] > currentLevel) {
    return;
  }

  const formattedMessage = formatMessage(level, message, ...args);

  switch (level) {
    case 'error':
      console.error(formattedMessage);
      break;
    case 'warn':
      console.warn(formattedMessage);
      break;
    case 'info':
      console.log(formattedMessage);
      break;
    case 'debug':
      console.debug(formattedMessage);
      break;
  }
}

// 公开 API
export const logger = {
  error: (message: string, ...args: unknown[]) => log('error', message, ...args),
  warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
  info: (message: string, ...args: unknown[]) => log('info', message, ...args),
  debug: (message: string, ...args: unknown[]) => log('debug', message, ...args),

  // 便捷方法：创建带模块名的 logger
  create: (moduleName: string) => ({
    error: (message: string, ...args: unknown[]) => log('error', `[${moduleName}] ${message}`, ...args),
    warn: (message: string, ...args: unknown[]) => log('warn', `[${moduleName}] ${message}`, ...args),
    info: (message: string, ...args: unknown[]) => log('info', `[${moduleName}] ${message}`, ...args),
    debug: (message: string, ...args: unknown[]) => log('debug', `[${moduleName}] ${message}`, ...args),
  }),
};

// 导出类型
export type { LogLevel };
