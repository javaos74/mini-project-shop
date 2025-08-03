const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'dev_class.db');
const initSqlPath = path.join(__dirname, 'init_sqlite.sql');

// 기존 데이터베이스 파일 삭제
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('기존 데이터베이스 파일을 삭제했습니다.');
}

// 새 데이터베이스 생성
const db = new sqlite3.Database(dbPath);

// 초기화 스크립트 실행
if (fs.existsSync(initSqlPath)) {
  console.log('MariaDB 데이터를 SQLite3로 복원 중...');
  const initSql = fs.readFileSync(initSqlPath, 'utf8');
  
  db.exec(initSql, (err) => {
    if (err) {
      console.error('데이터 복원 중 오류 발생:', err);
    } else {
      console.log('✅ 데이터 복원이 완료되었습니다!');
      
      // 복원된 데이터 확인
      db.all("SELECT COUNT(*) as count FROM t_category", (err, rows) => {
        if (!err) console.log(`카테고리: ${rows[0].count}개`);
      });
      
      db.all("SELECT COUNT(*) as count FROM t_product", (err, rows) => {
        if (!err) console.log(`제품: ${rows[0].count}개`);
      });
      
      db.all("SELECT COUNT(*) as count FROM t_image", (err, rows) => {
        if (!err) console.log(`이미지: ${rows[0].count}개`);
      });
      
      db.all("SELECT COUNT(*) as count FROM t_seller", (err, rows) => {
        if (!err) console.log(`판매자: ${rows[0].count}개`);
      });
      
      db.all("SELECT COUNT(*) as count FROM t_user", (err, rows) => {
        if (!err) console.log(`사용자: ${rows[0].count}개`);
      });
    }
    
    db.close();
  });
} else {
  console.error('init_sqlite.sql 파일을 찾을 수 없습니다.');
  db.close();
}