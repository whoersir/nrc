#!/bin/bash

# 清理 Next.js 开发环境的所有缓存和临时文件

echo "🧹 清理 Next.js 开发环境..."

# 删除构建缓存
rm -rf .next
echo "✅ 删除 .next 目录"

# 删除 turbopack 缓存
rm -rf .turbo
echo "✅ 删除 .turbo 目录"

# 删除 dist 目录
rm -rf dist
echo "✅ 删除 dist 目录"

# 删除 node_modules/.cache
rm -rf node_modules/.cache
echo "✅ 删除 node_modules/.cache 目录"

# 删除系统缓存
rm -rf out
echo "✅ 删除 out 目录"

echo ""
echo "✨ 清理完成！现在可以运行 'npm run dev' 或 'pnpm dev'"
