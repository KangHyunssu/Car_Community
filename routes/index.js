const express = require('express'); // Express 모듈을 불러옴
const router = express.Router(); // Express의 Router를 사용
const db = require('../config/db'); // 데이터베이스 연결 설정을 불러옴
const moment = require('moment-timezone'); // 시간대를 처리하기 위해 moment-timezone 모듈을 불러옴
const axios = require('axios'); // HTTP 요청을 보내기 위해 axios 모듈을 불러옴

// 메인 홈페이지 라우트 설정
router.get('/', async (req, res) => {
    const newsApiKey = 'myNewsAPI_Key'; // 뉴스 API 키를 설정
    const newsUrl = `https://newsapi.org/v2/everything?q=자동차&apiKey=${newsApiKey}`; // 뉴스 API URL을 설정

    try {
        const newsResponse = await axios.get(newsUrl); // 뉴스 API에 GET 요청을 보냄
        const articles = newsResponse.data.articles; // 응답에서 뉴스 기사 목록을 추출

        const sql = 'SELECT * FROM posts ORDER BY likes DESC'; // 게시글을 좋아요 순으로 정렬하는 SQL 쿼리 정의
        db.query(sql, (err, results) => { // SQL 쿼리를 실행
            if (err) {
                console.error('데이터베이스 조회 중 오류 발생:', err); // 오류가 발생하면 콘솔에 로그 출력
                return res.status(500).send('데이터베이스 오류'); // 클라이언트에게 데이터베이스 오류 메시지를 전송
            }
            results.forEach(post => {
                post.formattedDate = moment(post.created_at).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'); // 각 게시글의 작성 시간을 포맷
            });
            res.render('index', { posts: results, user: req.session.user, articles: articles }); // 메인 페이지를 렌더링하고 게시글 및 뉴스 기사를 전달
        });
    } catch (error) {
        console.error('뉴스 API 호출 중 오류 발생:', error); // 뉴스 API 호출 중 오류가 발생하면 콘솔에 로그 출력
        res.render('index', { posts: [], user: req.session.user, articles: [] }); // 메인 페이지를 렌더링하고 빈 게시글 및 뉴스 기사 목록을 전달
    }
});

module.exports = router; // router 객체를 모듈로 내보냄
