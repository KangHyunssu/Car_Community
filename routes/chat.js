const express = require('express'); // Express 모듈을 불러옴
const db = require('../config/db'); // 데이터베이스 연결 설정을 불러옴
const router = express.Router(); // Express의 Router를 사용

// 채팅 페이지 라우트 설정
router.get('/chat', (req, res) => {
  if (!req.session.user) { // 사용자가 로그인하지 않았을 경우
    return res.redirect('/login'); // 로그인 페이지로 리다이렉트
  }
  res.render('chat', { user: req.session.user }); // 사용자가 로그인한 경우 채팅 페이지를 렌더링
});

// 브랜드별 채팅방 라우트 설정
router.get('/chat/:brand', (req, res) => {
  if (!req.session.user) { // 사용자가 로그인하지 않았을 경우
    return res.redirect('/login'); // 로그인 페이지로 리다이렉트
  }
  const brand = req.params.brand; // URL에서 브랜드 이름을 추출

  // 데이터베이스에서 메시지 불러오기
  const query = 'SELECT user, message, timestamp FROM messages WHERE brand = ? ORDER BY timestamp ASC'; // 브랜드별 메시지를 불러오는 SQL 쿼리
  db.execute(query, [brand], (err, results) => { // SQL 쿼리를 실행
    if (err) { // 쿼리 실행 중 오류가 발생한 경우
      console.error('메시지 불러오기 중 오류 발생:', err); // 오류를 콘솔에 출력
      return res.status(500).send('메시지 불러오기 실패'); // 클라이언트에게 오류 메시지를 전송
    }

    // 채팅방 페이지 렌더링 시 이전 메시지 전달
    res.render('chatroom', {
      user: req.session.user, // 현재 사용자 정보 전달
      brand: brand, // 브랜드 이름 전달
      messages: results // 데이터베이스에서 불러온 메시지 목록 전달
    });
  });
});

module.exports = router; // router 객체를 모듈로 내보냄
