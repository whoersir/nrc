#!/usr/bin/env node

/**
 * 项目优化清理脚本
 * 自动删除临时文档、重复文件和构建缓存
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function deleteFile(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    log(`⚠️  跳过（不存在）: ${filePath}`, colors.yellow);
    return false;
  }

  try {
    const stats = fs.statSync(fullPath);
    const size = (stats.size / 1024).toFixed(2);
    fs.unlinkSync(fullPath);
    log(`✓ 已删除: ${filePath} (${size} KB)`, colors.green);
    return true;
  } catch (error) {
    log(`✗ 删除失败: ${filePath}`, colors.red);
    log(`  错误: ${error.message}`, colors.red);
    return false;
  }
}

function deleteDirectory(dirPath, description) {
  const fullPath = path.join(__dirname, dirPath);
  
  if (!fs.existsSync(fullPath)) {
    log(`⚠️  跳过（不存在）: ${dirPath}`, colors.yellow);
    return false;
  }

  try {
    fs.rmSync(fullPath, { recursive: true, force: true });
    log(`✓ 已删除目录: ${dirPath}`, colors.green);
    return true;
  } catch (error) {
    log(`✗ 删除失败: ${dirPath}`, colors.red);
    log(`  错误: ${error.message}`, colors.red);
    return false;
  }
}

// 主函数
async function main() {
  log('\n========================================', colors.bright);
  log('  项目优化清理脚本', colors.bright);
  log('========================================\n');

  // 方案 A：保守清理
  log('方案 A：保守清理（推荐）', colors.blue);
  log('----------------------------------------\n');

  let totalDeleted = 0;
  let totalSize = 0;

  // 1. 临时测试报告和文档
  log('1. 删除临时测试报告和文档...', colors.yellow);
  
  const tempDocs = [
    'BACKEND_TEST_REPORT.md',
    'FAVORITE_AND_COVER_API_TEST_REPORT.md',
    'FIX_SUMMARY.txt',
    'SOLUTION_MAP.txt',
    'PROJECT_COMPLETION_SUMMARY.md',
    'HMR_WEBSOCKET_FIX.md',
    'MUSIC_PLAYER_PROGRESS.md',
    'TITLE_OPTIMIZATION_GUIDE.md',
    'API_TEST_GUIDE.md',
    'README_FIX.md',
    'VERIFICATION_CHECKLIST.md',
  ];

  tempDocs.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      
      fs.unlinkSync(fullPath);
      log(`  ✓ ${file} (${sizeKB} KB)`, colors.green);
      totalDeleted++;
      totalSize += stats.size;
    }
  });

  // 2. 重复的文档
  log('\n2. 删除重复文档...', colors.yellow);
  
  const duplicateDocs = [
    'QUICKSTART.md',
    'deploy.js',
  ];

  duplicateDocs.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      
      fs.unlinkSync(fullPath);
      log(`  ✓ ${file} (${sizeKB} KB)`, colors.green);
      totalDeleted++;
      totalSize += stats.size;
    }
  });

  // 3. 构建缓存和临时文件
  log('\n3. 清理构建缓存...', colors.yellow);
  
  const buildCache = [
    '.next',
    '.turbo',
    'build.log',
  ];

  buildCache.forEach(item => {
    const fullPath = path.join(__dirname, item);
    if (fs.existsSync(fullPath)) {
      try {
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          // 计算目录大小
          let dirSize = 0;
          const calcDirSize = (dirPath) => {
            const files = fs.readdirSync(dirPath);
            files.forEach(file => {
              const filePath = path.join(dirPath, file);
              const fileStats = fs.statSync(filePath);
              if (fileStats.isDirectory()) {
                calcDirSize(filePath);
              } else {
                dirSize += fileStats.size;
              }
            });
          };
          calcDirSize(fullPath);
          
          fs.rmSync(fullPath, { recursive: true, force: true });
          const sizeMB = (dirSize / (1024 * 1024)).toFixed(2);
          log(`  ✓ ${item}/ (${sizeMB} MB)`, colors.green);
          totalSize += dirSize;
        } else {
          const sizeKB = (stats.size / 1024).toFixed(2);
          fs.unlinkSync(fullPath);
          log(`  ✓ ${item} (${sizeKB} KB)`, colors.green);
          totalSize += stats.size;
        }
        totalDeleted++;
      } catch (error) {
        log(`  ✗ ${item}: ${error.message}`, colors.red);
      }
    }
  });

  // 4. 测试脚本（可选）
  log('\n4. 删除测试脚本...', colors.yellow);
  
  const testScripts = [
    'scripts/test-api.js',
    'scripts/test-music-scanner.js',
    'scripts/test-scanner.js',
  ];

  testScripts.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      
      fs.unlinkSync(fullPath);
      log(`  ✓ ${file} (${sizeKB} KB)`, colors.green);
      totalDeleted++;
      totalSize += stats.size;
    }
  });

  // 5. 测试目录
  log('\n5. 删除测试目录...', colors.yellow);
  
  const testDirs = ['cloudrun-sandbox'];
  
  testDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
      try {
        const calcDirSize = (dirPath) => {
          let size = 0;
          const files = fs.readdirSync(dirPath);
          files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const fileStats = fs.statSync(filePath);
            if (fileStats.isDirectory()) {
              size += calcDirSize(filePath);
            } else {
              size += fileStats.size;
            }
          });
          return size;
        };
        
        const dirSize = calcDirSize(fullPath);
        const sizeMB = (dirSize / (1024 * 1024)).toFixed(2);
        
        fs.rmSync(fullPath, { recursive: true, force: true });
        log(`  ✓ ${dir}/ (${sizeMB} MB)`, colors.green);
        totalDeleted++;
        totalSize += dirSize;
      } catch (error) {
        log(`  ✗ ${dir}: ${error.message}`, colors.red);
      }
    }
  });

  // 6. 检查是否需要创建归档目录
  log('\n6. 检查是否需要创建归档目录...', colors.yellow);
  
  const archiveDir = path.join(__dirname, 'docs', 'archive');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
    log('  ✓ 已创建归档目录: docs/archive/', colors.green);
    log('  💡 提示：如需保留历史文档，可手动移动到该目录', colors.blue);
  }

  // 总结
  log('\n========================================', colors.bright);
  log('  清理完成！', colors.bright);
  log('========================================\n');

  const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  
  log('📊 清理统计:', colors.bright);
  log(`  已删除文件/目录: ${totalDeleted} 个`);
  log(`  释放磁盘空间: ${sizeMB} MB`);
  
  log('\n✅ 优化后的项目更清晰！', colors.green);
  log('\n💡 下一步:', colors.blue);
  log('  1. 运行: pnpm install (重新安装依赖）');
  log('  2. 运行: pnpm dev (启动开发服务器）');
  log('  3. 查看优化后的项目结构\n');
  
  log('详细方案请查看: PROJECT_OPTIMIZATION_PLAN.md', colors.blue);
}

// 运行主函数
main().catch(error => {
  log('\n清理失败:', colors.red);
  console.error(error);
  process.exit(1);
});
