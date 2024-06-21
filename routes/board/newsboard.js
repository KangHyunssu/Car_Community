const express = require('express'); // Express 프레임워크를 불러옴
const axios = require('axios'); // HTTP 요청을 보내기 위해 Axios를 불러옴
const router = express.Router(); // Express의 Router 객체 생성

// 뉴스 데이터를 가져오는 비동기 함수
async function fetchNews() {
    const apiKey = 'a239d054b544453391e2867f01a26503'; // API 키값 설정
    const url = `https://newsapi.org/v2/everything?q=자동차&apiKey=${apiKey}`; // '자동차' 키워드로 뉴스 검색 URL 생성

    try {
        const response = await axios.get(url); // Axios를 사용하여 뉴스 API에 GET 요청을 보냄
        return response.data.articles; // 응답에서 기사 데이터를 추출하여 반환
    } catch (error) {
        console.error('뉴스 데이터를 가져오는데 실패했습니다:', error); // 오류 발생 시 콘솔에 오류 메시지 출력
        return []; // 빈 배열을 반환하여 오류를 처리
    }
}

// '/newsboard' 경로에 대한 GET 요청을 처리하는 라우트 핸들러
router.get('/newsboard', async (req, res) => {
    try {
        const newsArticles = await fetchNews(); // 뉴스 데이터를 가져옴
        res.render('newsboard', { user: req.session.user, articles: newsArticles }); // 'newsboard' 뷰를 렌더링하고 사용자 및 기사 데이터를 전달
    } catch (error) {
        res.status(500).send('뉴스를 불러오는 중 오류가 발생했습니다.'); // 오류 발생 시 500 상태 코드와 함께 오류 메시지를 응답으로 보냄
    }
});

module.exports = router; // 설정된 라우터를 모듈로 내보냄
