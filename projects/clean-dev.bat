@echo off
REM 清理 Next.js 开发环境的所有缓存和临时文件

echo.
echo 🧹 清理 Next.js 开发环境...
echo.

REM 删除构建缓存
if exist .next (
    rmdir /s /q .next
    echo ✅ 删除 .next 目录
)

REM 删除 turbopack 缓存
if exist .turbo (
    rmdir /s /q .turbo
    echo ✅ 删除 .turbo 目录
)

REM 删除 dist 目录
if exist dist (
    rmdir /s /q dist
    echo ✅ 删除 dist 目录
)

REM 删除 node_modules/.cache
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✅ 删除 node_modules\.cache 目录
)

REM 删除 out 目录
if exist out (
    rmdir /s /q out
    echo ✅ 删除 out 目录
)

echo.
echo ✨ 清理完成！现在可以运行 'npm run dev' 或 'pnpm dev'
echo.
pause
