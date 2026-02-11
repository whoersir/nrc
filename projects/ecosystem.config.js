/**
 * PM2 配置文件 - 局域网部署使用
 * 
 * 使用方法:
 * 1. 首次启动: pm2 start ecosystem.config.js
 * 2. 查看状态: pm2 status
 * 3. 查看日志: pm2 logs nrc-app
 * 4. 重启: pm2 restart nrc-app
 * 5. 停止: pm2 stop nrc-app
 * 6. 开机自启: pm2 startup windows && pm2 save
 */

const path = require('path');

module.exports = {
  apps: [{
    name: 'nrc-app',
    script: './node_modules/next/dist/bin/next',
    args: 'start --port 5000',
    cwd: path.resolve(__dirname),
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      HOSTNAME: '0.0.0.0'
    },
    // 日志配置
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Windows 隐藏窗口
    windowsHide: true,
    // 合并日志
    merge_logs: true,
    // 日志文件大小限制 (10MB)
    log_max_size: '10M',
    // 保留 7 天的日志
    log_rotate_interval: '1d',
    // 异常退出时重启延迟
    restart_delay: 3000,
    // 最大重启次数
    max_restarts: 10,
    // 最小运行时间（毫秒），小于此时间重启会认为异常
    min_uptime: '10s'
  }]
};
