@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ==========================================
echo   NRC 应用 - 局域网部署启动脚本
echo ==========================================
echo.

:: 检查是否安装了 pnpm
where pnpm >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 pnpm，请先安装 pnpm：
    echo   npm install -g pnpm
    pause
    exit /b 1
)

:: 检查是否安装了 PM2
where pm2 >nul 2>nul
if errorlevel 1 (
    echo [提示] 正在全局安装 PM2...
    call npm install -g pm2
    if errorlevel 1 (
        echo [错误] PM2 安装失败，请手动安装：npm install -g pm2
        pause
        exit /b 1
    )
)

:: 创建日志目录
if not exist logs mkdir logs

:: 检查依赖是否安装
if not exist node_modules (
    echo [提示] 首次运行，正在安装依赖...
    call pnpm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

:: 清理旧的构建缓存（确保环境变量生效）
echo.
echo [0/2] 清理构建缓存...
if exist .next rmdir /s /q .next

:: 构建生产版本
echo.
echo [1/2] 正在构建生产版本...
echo ------------------------------------------
call pnpm build
if errorlevel 1 (
    echo [错误] 构建失败，请检查代码错误
    pause
    exit /b 1
)

echo.
echo [2/2] 正在启动 PM2 服务...
echo ------------------------------------------

:: 终止可能残留的 Next.js 构建进程
taskkill /F /IM node.exe >nul 2>nul
timeout /t 2 >nul

:: 清理 .next 锁文件
if exist .next\lock del /F /Q .next\lock >nul 2>nul

:: 先停止已存在的实例（如果有）
call pm2 stop nrc-app >nul 2>nul
call pm2 delete nrc-app >nul 2>nul

:: 启动服务
call pm2 start ecosystem.config.js
if errorlevel 1 (
    echo [错误] 启动失败
    pause
    exit /b 1
)

:: 保存 PM2 配置（用于开机自启）
call pm2 save >nul 2>nul

echo.
echo ==========================================
echo   服务启动成功！
echo ==========================================
echo.
:: 固定局域网 IP 配置
set LAN_IP=10.75.31.37
set PORT=5000

echo   本机访问: http://localhost:%PORT%
echo   局域网访问: http://%LAN_IP%:%PORT%

echo.
echo ------------------------------------------
echo 常用命令:
echo   pm2 status     - 查看服务状态
echo   pm2 logs       - 查看实时日志
echo   pm2 restart nrc-app - 重启服务
echo   pm2 stop nrc-app    - 停止服务
echo   stop-local.bat - 使用脚本停止服务
echo ------------------------------------------
echo.
pause
