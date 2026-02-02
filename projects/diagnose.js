#!/usr/bin/env node

/**
 * Next.js 开发环境诊断工具
 * 用于检测和诊断 HMR 和 WebSocket 连接问题
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('\n📋 Next.js 开发环境诊断工具\n');
console.log('=' .repeat(50));

// 诊断项目结构
console.log('\n1️⃣  检查项目结构...');
const requiredFiles = [
  'next.config.ts',
  'package.json',
  'tsconfig.json',
  '.env.local',
  '.env.development.local',
];

let structureOk = true;
requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ⚠️  ${file} (缺失)`);
    structureOk = false;
  }
});

// 检查缓存目录
console.log('\n2️⃣  检查缓存状态...');
const cacheDirs = [
  { name: '.next', critical: true },
  { name: '.turbo', critical: false },
  { name: 'node_modules/.cache', critical: false },
];

cacheDirs.forEach(({ name, critical }) => {
  const dirPath = path.join(process.cwd(), name);
  const exists = fs.existsSync(dirPath);
  const icon = exists ? '⚠️ ' : '✅';
  const status = exists ? '(存在，可能导致问题)' : '(不存在，正常)';
  console.log(`  ${icon} ${name} ${status}`);
});

// 检查环境变量
console.log('\n3️⃣  检查环境变量配置...');
const envPath = path.join(process.cwd(), '.env.development.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasWebSocketDisable = envContent.includes('NEXT_DISABLE_WEBSOCKET=true');
  const hasPolling = envContent.includes('WATCHPACK_POLLING');
  
  console.log(`  ${hasWebSocketDisable ? '✅' : '⚠️ '} WebSocket 禁用设置`);
  console.log(`  ${hasPolling ? '✅' : '⚠️ '} 文件轮询设置`);
} else {
  console.log('  ⚠️  .env.development.local 文件缺失');
}

// 检查 next.config.ts 配置
console.log('\n4️⃣  检查 Next.js 配置...');
const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
  const configContent = fs.readFileSync(nextConfigPath, 'utf8');
  const hasTurbopackPolling = configContent.includes('poll: 1000');
  const hasOptimizeFonts = configContent.includes('optimizeFonts: false');
  const hasHeaders = configContent.includes('async headers()');
  
  console.log(`  ${hasTurbopackPolling ? '✅' : '⚠️ '} Turbopack 轮询配置`);
  console.log(`  ${hasOptimizeFonts ? '✅' : '⚠️ '} 字体优化禁用`);
  console.log(`  ${hasHeaders ? '✅' : '⚠️ '} 响应头配置`);
} else {
  console.log('  ⚠️  next.config.ts 文件缺失');
}

// 检查系统资源
console.log('\n5️⃣  检查系统资源...');
const cpus = os.cpus().length;
const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
const freeMemory = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
const platform = os.platform();

console.log(`  ℹ️  操作系统: ${platform}`);
console.log(`  ℹ️  CPU 核心数: ${cpus}`);
console.log(`  ℹ️  总内存: ${totalMemory} GB`);
console.log(`  ℹ️  可用内存: ${freeMemory} GB`);

// 检查 Node.js 版本
console.log('\n6️⃣  检查 Node.js 环境...');
const nodeVersion = process.version;
const npmVersion = require('child_process')
  .execSync('npm -v', { encoding: 'utf8' })
  .trim();
const pnpmVersion = require('child_process')
  .execSync('pnpm -v', { encoding: 'utf8' })
  .trim();

console.log(`  ℹ️  Node.js: ${nodeVersion}`);
console.log(`  ℹ️  npm: ${npmVersion}`);
console.log(`  ℹ️  pnpm: ${pnpmVersion}`);

// 生成诊断报告
console.log('\n' + '='.repeat(50));
console.log('\n📊 诊断建议:\n');

const issues = [];

if (!structureOk) {
  issues.push('• 项目文件缺失，请运行 "pnpm install"');
}

const nextDirExists = fs.existsSync(path.join(process.cwd(), '.next'));
if (nextDirExists) {
  issues.push('• 检测到 .next 缓存目录，建议运行 "clean-dev.bat" 或 "clean-dev.sh" 清理');
}

const turboExists = fs.existsSync(path.join(process.cwd(), '.turbo'));
if (turboExists) {
  issues.push('• 检测到 .turbo 缓存目录，建议清理');
}

if (freeMemory < 1) {
  issues.push('• ⚠️  可用内存过低 (<1GB)，建议关闭其他应用');
}

if (issues.length === 0) {
  console.log('✨ 一切看起来正常！');
  console.log('\n建议的启动步骤:');
  console.log('  1. 运行: pnpm dev');
  console.log('  2. 打开浏览器访问: http://10.75.31.37:5000');
  console.log('  3. 打开开发者工具检查控制台');
  console.log('  4. 修改文件验证 HMR 是否正常工作');
} else {
  console.log('检测到以下问题:\n');
  issues.forEach(issue => console.log(issue));
  
  console.log('\n建议的修复步骤:');
  console.log('  1. 运行: clean-dev.bat (Windows) 或 ./clean-dev.sh (macOS/Linux)');
  console.log('  2. 运行: pnpm install');
  console.log('  3. 运行: pnpm dev');
}

console.log('\n' + '='.repeat(50) + '\n');
