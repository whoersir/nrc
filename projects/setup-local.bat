@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ==========================================
echo   NRC 应用 - 局域网部署初始化
echo ==========================================
echo.

:: 检查 Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 18+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] 检查 Node.js 版本...
node --version
echo.

:: 检查 pnpm
where pnpm >nul 2>nul
if errorlevel 1 (
    echo [2/5] 正在安装 pnpm...
    npm install -g pnpm
    if errorlevel 1 (
        echo [错误] pnpm 安装失败
        pause
        exit /b 1
    )
) else (
    echo [2/5] pnpm 已安装
    pnpm --version
)
echo.

:: 检查 PM2
where pm2 >nul 2>nul
if errorlevel 1 (
    echo [3/5] 正在安装 PM2...
    npm install -g pm2
    if errorlevel 1 (
        echo [错误] PM2 安装失败
        pause
        exit /b 1
    )
) else (
    echo [3/5] PM2 已安装
)
echo.

:: 安装依赖
echo [4/5] 正在安装项目依赖...
if not exist node_modules (
    call pnpm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo 依赖已存在，跳过安装
)
echo.

:: 检查环境变量文件
echo [5/5] 检查环境变量配置...
if not exist .env.local (
    echo.
    echo [警告] 未找到 .env.local 文件！
    echo 请复制 .env.example 为 .env.local 并配置相关参数
    echo.
    echo 必需配置项：
    echo   - NEXT_PUBLIC_SUPABASE_URL
    echo   - NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo.
    pause
    exit /b 1
) else (
    echo 环境变量文件已存在
)
echo.

:: 创建日志目录
if not exist logs mkdir logs

echo ==========================================
echo   初始化完成！
echo ==========================================
echo.
echo 现在可以运行 start-local.bat 启动服务
echo.
pause
