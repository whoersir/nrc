/**
 * 音乐扫描器测试脚本
 * 用途：测试音乐文件扫描功能
 */

const { MusicFileScanner } = require('../src/lib/music/file-scanner.ts');

async function testScanner() {
  console.log('🎵 音乐扫描器测试\n');

  const scanner = new MusicFileScanner(
    'F:\\Music\\Playlists',
    'F:\\Music'
  );

  try {
    const result = await scanner.scan({
      verbose: true,
      extractMetadata: false, // 跳过元数据提取（加快速度）
    });

    console.log('\n📊 扫描结果:');
    console.log(JSON.stringify(result, null, 2));

    // 保存结果到文件
    const fs = require('fs');
    fs.writeFileSync(
      'scan-result.json',
      JSON.stringify(result, null, 2),
      'utf-8'
    );
    console.log('\n✅ 结果已保存到 scan-result.json');
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

testScanner();
