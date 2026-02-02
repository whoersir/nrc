@echo off
setlocal enabledelayedexpansion

:: 设置 Node.js 内存限制
set NODE_OPTIONS=--max_old_space_size=4096

:: 启动开发服务器
pnpm dev

pause
