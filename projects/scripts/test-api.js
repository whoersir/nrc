/**
 * 音乐播放器 API 测试脚本
 * 测试所有后端 API 接口
 */

const BASE_URL = 'http://localhost:5000';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color, text) {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function success(text) {
  log('green', `✅ ${text}`);
}

function error(text) {
  log('red', `❌ ${text}`);
}

function info(text) {
  log('blue', `ℹ️  ${text}`);
}

function warn(text) {
  log('yellow', `⚠️  ${text}`);
}

/**
 * 延迟函数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 测试 API
 */
async function testAPI(name, method, url, data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    info(`测试 ${name}...`);
    const response = await fetch(url, options);
    const result = await response.json();

    if (response.ok) {
      success(`${name} - 状态码: ${response.status}`);
      console.log(JSON.stringify(result, null, 2));
      return { success: true, data: result };
    } else {
      error(`${name} - 状态码: ${response.status}`);
      console.log(JSON.stringify(result, null, 2));
      return { success: false, error: result };
    }
  } catch (err) {
    error(`${name} - 请求失败: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * 主测试函数
 */
async function main() {
  console.log('\n========================================');
  log('cyan', '🎵 音乐播放器 API 测试');
  console.log('========================================\n');

  await delay(2000); // 等待服务器启动

  // 测试 1: 创建数据库表
  log('magenta', '\n📝 测试 1: 创建数据库表');
  const dbResult = await testAPI(
    '创建数据库表',
    'POST',
    `${BASE_URL}/api/db/tables`
  );
  await delay(500);

  if (!dbResult.success) {
    warn('数据库表创建失败，跳过后续测试');
    return;
  }

  // 测试 2: 扫描音乐库
  log('magenta', '\n📂 测试 2: 扫描音乐库');
  const scanResult = await testAPI(
    '扫描音乐库',
    'POST',
    `${BASE_URL}/api/music/scan`,
    {
      verbose: true,
      extractMetadata: false,
    }
  );
  await delay(1000);

  // 测试 3: 获取歌曲列表
  log('magenta', '\n🎵 测试 3: 获取歌曲列表');
  const tracksResult = await testAPI(
    '获取歌曲列表',
    'GET',
    `${BASE_URL}/api/music/tracks?page=1&limit=10`
  );
  await delay(500);

  // 测试 4: 获取歌手列表
  log('magenta', '\n🎤 测试 4: 获取歌手列表');
  const artistsResult = await testAPI(
    '获取歌手列表',
    'GET',
    `${BASE_URL}/api/music/artists`
  );
  await delay(500);

  // 测试 5: 获取歌手封面
  if (artistsResult.success && artistsResult.data.data?.length > 0) {
    const artistName = artistsResult.data.data[0].name;
    log('magenta', `\n🖼️  测试 5: 获取歌手封面 (${artistName})`);
    await testAPI(
      '获取歌手封面',
      'GET',
      `${BASE_URL}/api/music/cover/${encodeURIComponent(artistName)}`
    );
    await delay(500);
  }

  // 测试 6: 流式传输音乐
  if (tracksResult.success && tracksResult.data.data?.length > 0) {
    const trackId = tracksResult.data.data[0].id;
    log('magenta', `\n🎧 测试 6: 流式传输音乐 (${trackId})`);
    await testAPI(
      '流式传输音乐',
      'GET',
      `${BASE_URL}/api/music/stream/${trackId}`
    );
    await delay(500);
  }

  // 测试 7: 按字母筛选歌曲
  log('magenta', '\n🔤 测试 7: 按字母筛选歌曲 (A)');
  const letterTracksResult = await testAPI(
    '按字母筛选歌曲',
    'GET',
    `${BASE_URL}/api/music/tracks?page=1&limit=10&letter=A`
  );
  await delay(500);

  // 测试 8: 按字母筛选歌手
  log('magenta', '\n🔤 测试 8: 按字母筛选歌手 (A)');
  const letterArtistsResult = await testAPI(
    '按字母筛选歌手',
    'GET',
    `${BASE_URL}/api/music/artists?letter=A`
  );
  await delay(500);

  // 测试 9: 获取用户收藏（需要登录）
  log('magenta', '\n💖 测试 9: 获取用户收藏');
  await testAPI(
    '获取用户收藏',
    'GET',
    `${BASE_URL}/api/favorites`
  );
  await delay(500);

  console.log('\n========================================');
  log('cyan', '✨ 测试完成！');
  console.log('========================================\n');
}

// 运行测试
main().catch(err => {
  error(`测试脚本出错: ${err.message}`);
  process.exit(1);
});
