@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ==========================================
echo   NRC 应用 - 停止服务脚本
echo ==========================================
echo.

:: 检查 PM2 是否安装
where pm2 >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 PM2，无法停止服务
    pause
    exit /b 1
)

:: 停止服务
echo [1/2] 正在停止服务...
call pm2 stop nrc-app
if errorlevel 1 (
    echo [提示] 服务可能未运行
) else (
    echo [成功] 服务已停止
)

:: 删除服务配置
echo [2/2] 正在清理配置...
call pm2 delete nrc-app >nul 2>nul

echo.
echo ==========================================
echo   服务已完全停止
echo ==========================================
echo.
pause
