/**
 * 音乐文件扫描测试脚本
 * 测试 M3U 解析和文件扫描功能（不依赖数据库）
 */

const { M3UParser } = require('../src/lib/music/m3u-parser.ts');
const { PinyinHelper } = require('../src/lib/music/pinyin-helper.ts');
const fs = require('fs');

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

function header(text) {
  log('magenta', `\n${text}`);
}

async function main() {
  console.log('\n' + '='.repeat(60));
  log('cyan', '🎵 音乐文件扫描测试');
  console.log('='.repeat(60) + '\n');

  const playlistsPath = 'F:\\Music\\Playlists';

  // 测试 1: M3U 解析
  header('📝 测试 1: M3U 解析器');
  const parser = new M3UParser(playlistsPath);

  try {
    const playlists = await parser.parseAll();

    if (playlists.length === 0) {
      error('未找到任何 M3U 播放列表');
      return;
    }

    success(`成功解析 ${playlists.length} 个播放列表`);

    // 显示前 3 个歌手
    playlists.slice(0, 3).forEach((playlist, index) => {
      info(`  [${index + 1}] ${playlist.artist} - ${playlist.tracks.length} 首歌曲`);
      if (playlist.tracks.length > 0) {
        playlist.tracks.slice(0, 2).forEach((track, tIndex) => {
          console.log(`      └─ ${track.title}`);
        });
      }
    });

    // 统计
    const totalTracks = playlists.reduce((sum, p) => sum + p.tracks.length, 0);
    info(`\n📊 统计: ${playlists.length} 位歌手, ${totalTracks} 首歌曲`);

    // 测试 2: 拼音转换
    header('🔤 测试 2: 拼音转换');
    const testTexts = ['周杰伦', '陈奕迅', '十年', '浮夸', 'Hello'];

    testTexts.forEach(text => {
      const pinyin = PinyinHelper.getPinyin(text);
      const firstLetter = PinyinHelper.getFirstLetter(text);
      info(`  "${text}" -> 拼音: ${pinyin}, 首字母: ${firstLetter}`);
    });

    // 测试 3: 按拼音排序
    header('📊 测试 3: 拼音排序');
    const testArtists = ['陈奕迅', '周杰伦', '林俊杰', '邓紫棋', '蔡依林'];

    const sortedArtists = PinyinHelper.sortByPinyin(testArtists, a => a);
    info(`  原始顺序: ${testArtists.join(', ')}`);
    info(`  排序后: ${sortedArtists.join(', ')}`);

    // 测试 4: 按首字母分组
    header('🔤 测试 4: 首字母分组');
    const groups = PinyinHelper.groupByFirstLetter(testArtists, a => a);
    const letters = Array.from(groups.keys()).sort();

    letters.forEach(letter => {
      const items = groups.get(letter);
      info(`  [${letter}] ${items.join(', ')}`);
    });

    // 保存结果
    const result = {
      playlistsCount: playlists.length,
      totalTracks,
      samplePlaylists: playlists.slice(0, 5).map(p => ({
        artist: p.artist,
        trackCount: p.tracks.length,
        sampleTracks: p.tracks.slice(0, 3).map(t => ({
          title: t.title,
          filename: t.filename,
          filePath: t.filePath,
        })),
      })),
    };

    fs.writeFileSync(
      'test-scan-result.json',
      JSON.stringify(result, null, 2),
      'utf-8'
    );

    success(`\n✅ 测试结果已保存到 test-scan-result.json`);

    console.log('\n' + '='.repeat(60));
    log('cyan', '✨ 所有测试通过！');
    console.log('='.repeat(60) + '\n');

  } catch (err) {
    error(`测试失败: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

main();
