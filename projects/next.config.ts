import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // outputFileTracingRoot: path.resolve(__dirname, '../..//'),
  /* config options here */
  
  allowedDevOrigins: ['*.dev.coze.site', '10.75.31.37', '*'],
  
  // 支持 WebSocket 和 HMR
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
    ],
  },
  
  // 确保 Next.js 识别 src 目录

  // Turbopack 配置（空配置表示使用默认设置）
  turbopack: {},

  // 开发服务器配置 - 支持内网IP
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000, // 轮询文件变化
        aggregateTimeout: 300,
      };

      // 解决 WebSocket 连接问题
      config.infrastructureLogging = {
        level: 'error',
        debug: false,
      };
    }
    return config;
  },

  // HMR 配置 - 修复 WebSocket 连接失败问题
  devIndicators: {
    position: 'bottom-right',
  },

  // 禁用 React DevTools 的 WebSocket 检查
  onDemandEntries: {
    // 减少开发时的内存占用
    pagesBufferLength: 2,
    // 防止多次构建
    maxInactiveAge: 60 * 1000,
  },

  // 静态生成配置
  staticPageGenerationTimeout: 120,

  // 响应头配置 - 修复字体资源访问
  async headers() {
    return [
      // API 路由不缓存 - 必须放在第一个
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/_next/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },

  // 中间件配置 - 处理字体资源请求
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/__nextjs_font/:path*',
          destination: '/_next/static/media/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
