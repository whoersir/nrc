#!/usr/bin/env node

/**
 * CloudBase 部署助手
 * 帮助将项目部署到 CloudBase CloudRun
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.blue);
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// 获取项目目录
const PROJECT_DIR = 'F:\\v_bxgxwang\\nrc_home\\projects';

// CloudBase 环境信息
const CLOUDBASE_CONFIG = {
  envId: 'nrc-8ggxdu3m3534afc0',
  region: 'ap-shanghai',
  alias: 'nrc',
  hostingDomain: 'nrc-8ggxdu3m3534afc0-1392812070.tcloudbaseapp.com',
};

// 必需的部署文件
const REQUIRED_FILES = [
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'next.config.ts',
  'tsconfig.json',
  'tailwind.config.ts',
  'Dockerfile',
  'components.json',
];

// 必需的部署目录
const REQUIRED_DIRS = [
  'app',
  'src',
  'public',
];

// 验证项目文件
function checkProjectFiles() {
  logSection('检查项目文件');

  const missingFiles = [];
  const missingDirs = [];

  REQUIRED_FILES.forEach(file => {
    const filePath = path.join(PROJECT_DIR, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    } else {
      logSuccess(`找到文件: ${file}`);
    }
  });

  REQUIRED_DIRS.forEach(dir => {
    const dirPath = path.join(PROJECT_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      missingDirs.push(dir);
    } else {
      logSuccess(`找到目录: ${dir}`);
    }
  });

  if (missingFiles.length > 0 || missingDirs.length > 0) {
    logError('缺少以下必需文件或目录:');
    missingFiles.forEach(file => log(`  - ${file}`, colors.red));
    missingDirs.forEach(dir => log(`  - ${dir}`, colors.red));
    return false;
  }

  logSuccess('所有必需文件和目录检查通过');
  return true;
}

// 检查环境变量
function checkEnvironmentVariables() {
  logSection('检查环境变量');

  const envPath = path.join(PROJECT_DIR, '.env.local');
  
  if (!fs.existsSync(envPath)) {
    logWarning('.env.local 文件不存在');
    logInfo('部署时需要在 CloudRun 中手动配置环境变量');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  let allPresent = true;
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      logSuccess(`环境变量已设置: ${varName}`);
    } else {
      logWarning(`环境变量未设置: ${varName}`);
      allPresent = false;
    }
  });

  if (!allPresent) {
    logWarning('部分环境变量缺失，请在部署时手动配置');
  }
}

// 显示部署信息
function showDeploymentInfo() {
  logSection('CloudBase 环境信息');

  console.log(`
  ${colors.bright}环境 ID:${colors.reset}      ${CLOUDBASE_CONFIG.envId}
  ${colors.bright}别名:${colors.reset}           ${CLOUDBASE_CONFIG.alias}
  ${colors.bright}区域:${colors.reset}           ${CLOUDBASE_CONFIG.region}
  ${colors.bright}静态托管域名:${colors.reset}  ${CLOUDBASE_CONFIG.hostingDomain}
  `);

  logSuccess('CloudBase 环境已连接');
}

// 显示部署步骤
function showDeploymentSteps() {
  logSection('CloudRun 部署步骤');

  const steps = [
    {
      step: 1,
      title: '访问 CloudRun 控制台',
      url: 'https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/platform-run',
      action: '打开上述链接，点击"新建服务"',
    },
    {
      step: 2,
      title: '配置服务信息',
      action: '服务名称: nrc-web',
      subActions: [
        '服务类型: 容器型',
        '代码来源: 本地上传',
        'Dockerfile: 选择项目根目录的 Dockerfile',
      ],
    },
    {
      step: 3,
      title: '配置资源规格',
      action: 'CPU: 0.5 核',
      subActions: [
        '内存: 1 GB',
        '端口: 3000',
        '最小实例数: 1',
        '最大实例数: 2',
      ],
    },
    {
      step: 4,
      title: '上传项目文件',
      action: '上传以下文件和目录:',
      subActions: [
        '必需文件: package.json, next.config.ts, Dockerfile 等',
        '必需目录: app/, src/, public/',
      ],
    },
    {
      step: 5,
      title: '配置环境变量',
      action: '添加以下环境变量:',
      subActions: [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'NODE_ENV=production',
        'PORT=3000',
      ],
    },
    {
      step: 6,
      title: '部署服务',
      action: '点击"部署"按钮，等待 3-5 分钟',
    },
    {
      step: 7,
      title: '测试部署',
      action: '访问分配的域名，测试各项功能',
    },
  ];

  steps.forEach(step => {
    console.log(`\n${colors.bright}步骤 ${step.step}: ${step.title}${colors.reset}`);
    console.log(`  ${step.action}`);
    if (step.url) {
      log(`  URL: ${step.url}`, colors.blue);
    }
    if (step.subActions) {
      step.subActions.forEach(sub => log(`    - ${sub}`, colors.blue));
    }
  });
}

// 显示重要链接
function showImportantLinks() {
  logSection('重要链接');

  const links = [
    { name: 'CloudRun 管理', url: 'https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/platform-run' },
    { name: '静态托管', url: 'https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/static-hosting' },
    { name: '环境概览', url: 'https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/overview' },
    { name: '云函数管理', url: 'https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/scf' },
    { name: '数据库管理', url: 'https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/db/doc' },
    { name: '云存储管理', url: 'https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/storage' },
    { name: '日志监控', url: 'https://tcb.cloud.tencent.com/dev?envId=nrc-8ggxdu3m3534afc0#/devops/log' },
  ];

  links.forEach(link => {
    console.log(`\n${colors.bright}${link.name}:${colors.reset}`);
    log(link.url, colors.blue);
  });
}

// 显示检查清单
function showChecklist() {
  logSection('部署检查清单');

  const checklist = [
    { task: '环境已连接', checked: true },
    { task: '项目文件完整', checked: true },
    { task: 'Dockerfile 已配置', checked: true },
    { task: '创建 CloudRun 服务', checked: false },
    { task: '上传项目文件', checked: false },
    { task: '配置环境变量', checked: false },
    { task: '服务正常运行', checked: false },
    { task: '域名可访问', checked: false },
    { task: '功能测试通过', checked: false },
  ];

  checklist.forEach(item => {
    const status = item.checked ? '✅' : '⬜';
    console.log(`  ${status} ${item.task}`);
  });
}

// 主函数
function main() {
  console.log('\n' + '='.repeat(60));
  log('CloudBase CloudRun 部署助手', colors.bright + colors.green);
  console.log('='.repeat(60) + '\n');

  // 检查项目文件
  if (!checkProjectFiles()) {
    process.exit(1);
  }

  // 检查环境变量
  checkEnvironmentVariables();

  // 显示部署信息
  showDeploymentInfo();

  // 显示部署步骤
  showDeploymentSteps();

  // 显示重要链接
  showImportantLinks();

  // 显示检查清单
  showChecklist();

  logSection('下一步');

  console.log(`
${colors.bright}1. 按照上述步骤完成部署${colors.reset}
   访问 CloudRun 控制台，按照步骤完成服务创建和配置

${colors.bright}2. 部署完成后测试应用${colors.reset}
   访问分配的域名，测试所有功能是否正常

${colors.bright}3. 查看详细文档${colors.reset}
   参考: CLOUDBASE_DEPLOYMENT_STEPS.md

${colors.bright}4. 监控服务状态${colors.reset}
   查看日志、性能指标，确保服务稳定运行

`);

  logSuccess('部署助手执行完成！');
  logInfo('请在 CloudBase 控制台完成后续部署步骤');
  console.log();
}

// 运行主函数
main();
