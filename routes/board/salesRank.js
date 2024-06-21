const express = require('express'); // Express 모듈을 불러옴
const router = express.Router(); // Express의 Router를 사용
const db = require('../../config/db'); // 데이터베이스 연결 설정을 불러옴

// 자동차 판매 순위 페이지 라우트 설정
router.get('/salesRank', (req, res) => {
  // car_sales 테이블에서 데이터를 조회하여 순위별로 정렬
  db.query('SELECT * FROM car_sales ORDER BY ranking', (err, results) => {
    if (err) {
      console.error('데이터베이스 쿼리 오류:', err); // 쿼리 실행 중 오류가 발생하면 콘솔에 로그 출력
      res.status(500).send("데이터베이스 쿼리 오류"); // 클라이언트에게 데이터베이스 쿼리 오류 메시지를 전송
      return;
    }
    // 조회된 데이터를 사용하여 salesRank 페이지를 렌더링하고, 사용자 정보도 함께 전달
    res.render('salesRank', { cars: results, user: req.session.user });
  });
});

module.exports = router; // router 객체를 모듈로 내보냄
