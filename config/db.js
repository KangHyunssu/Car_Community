// MySQL 모듈을 불러옵니다.
const mysql = require('mysql2');

// 데이터베이스 연결 설정
const connection = mysql.createConnection({
    host: 'my_DB_host', // 데이터베이스 호스트 (로컬호스트)
    user: 'my_DB_host', // 데이터베이스 사용자 이름
    password: 'my_DB_pw', // 데이터베이스 비밀번호
    database: 'my_DB_name' // 데이터베이스 이름
});

// 데이터베이스 연결 시도
connection.connect(err => {
    if (err) {
        console.error('데이터베이스 연결 실패:', err); // 연결 실패 시 에러 메시지를 출력합니다.
        return;
    }
    console.log('데이터베이스에 성공적으로 연결되었습니다.'); // 연결 성공 시 메시지를 출력합니다.
});

// connection 객체를 모듈 외부로 내보냄
module.exports = connection;
