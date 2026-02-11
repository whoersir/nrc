const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// 数据库连接字符串 - 从环境变量读取
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ 错误: 请设置 DATABASE_URL 环境变量');
  console.error('示例: set DATABASE_URL=postgresql://user:password@host:port/database');
  process.exit(1);
}

async function initDatabase() {
  const client = new Client({ connectionString });

  try {
    console.log('🔗 连接到数据库...');
    await client.connect();
    console.log('✅ 数据库连接成功');

    // 读取 SQL 文件
    const sqlPath = path.join(__dirname, '../db/music-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // 分割 SQL 语句
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`\n📝 发现 ${statements.length} 条 SQL 语句\n`);

    // 逐个执行 SQL 语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      try {
        await client.query(statement);
        console.log(`✅ [${i + 1}/${statements.length}] 执行成功`);
      } catch (error) {
        console.error(`❌ [${i + 1}/${statements.length}] 执行失败:`, error.message);
      }
    }

    console.log('\n✅ 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDatabase();
