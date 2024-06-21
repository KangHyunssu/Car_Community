const express = require('express');  // Express 모듈을 불러옴
const router = express.Router();     // 라우터 객체 생성
const db = require('../../config/db'); // 데이터베이스 설정 파일 불러옴
const moment = require('moment-timezone'); // moment-timezone 모듈을 불러옴

// 자유 게시판 목록을 표시하는 라우트
router.get('/freeboard', (req, res) => {
    const sql = 'SELECT * FROM posts ORDER BY created_at DESC'; // 게시물 목록을 생성 날짜 기준으로 내림차순 정렬하여 가져오는 SQL 쿼리

    db.query(sql, (err, results) => { // 데이터베이스에서 쿼리 실행
        if (err) {  // 오류 발생 시
            console.error('데이터베이스 조회 중 오류 발생:', err);  // 오류를 콘솔에 출력
            return res.status(500).send('데이터베이스 오류');  // 상태 코드 500과 함께 오류 메시지를 전송
        }
        // 각 게시물의 생성 날짜를 포맷 변경
        results.forEach(post => {
            post.formattedDate = moment(post.created_at).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'); // 생성 날짜를 'YYYY-MM-DD HH:mm:ss' 형식으로 변환
        });
        res.render('freeboard', { posts: results, user: req.session.user }); // 'freeboard' 템플릿에 게시물 목록과 사용자 정보를 전달하여 렌더링
    });
});

module.exports = router;  // 라우터 모듈을 내보냄