import fs from 'fs';
import bluebird from 'bluebird';
import parse from 'connection-string';
import mysql from 'mysql';
import Connection from 'mysql/lib/Connection';
import Pool from 'mysql/lib/Pool';
import dotenv from 'dotenv';
dotenv.config();

// @ts-ignore
const config = parse(process.env.HUB_DATABASE_URL);
config.connectionLimit = 5;
config.host = config.hosts[0].name;
config.port = config.hosts[0].port;
bluebird.promisifyAll([Pool, Connection]);
const db = mysql.createPool(config);
const dbName = config.path[0];

async function run() {
  const splitToken = ');';

  console.log('Start database setup');
  const result = await db.queryAsync(
    `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${dbName}'`
  );
  if (result.length == 0) {
    console.info(`- Database not exists`);
    return;
  }

  try {
    console.info(`- Updating database character set to utf8mb4`);
    await db.queryAsync(
      `ALTER DATABASE ${dbName} DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;`
    );

    // 获取所有表
    const tables = await db.queryAsync(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = '${dbName}'`
    );

    console.log('tables[0]', tables[0]);

    // 对每个表执行 ALTER TABLE 操作
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      const alterTableQuery = `ALTER TABLE ${dbName}.${tableName} DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;
      await db.queryAsync(alterTableQuery);
      console.log(`Table ${tableName} character set updated.`);
    }

    const columns = await db.queryAsync(
      `SELECT table_name, column_name, COLUMN_TYPE FROM information_schema.columns WHERE table_schema = '${dbName}' AND character_set_name = 'utf8'`
    );
    console.log('columns[0]', columns[0]);

    for (const column of columns) {
      const { TABLE_NAME, COLUMN_NAME, COLUMN_TYPE } = column;
      const alterColumnQuery = `ALTER TABLE ${dbName}.${TABLE_NAME} MODIFY COLUMN ${COLUMN_NAME} ${COLUMN_TYPE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;
      await db.queryAsync(alterColumnQuery);
      console.log(`Column ${COLUMN_NAME} in table ${TABLE_NAME} character set updated.`);
    }

    console.log('Database character set update completed.');
  } catch (err) {
    console.error('Error updating database charset:', err);
  }
}

(async () => {
  try {
    await run();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
