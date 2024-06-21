const express = require('express'); // Express 모듈을 불러옴
const router = express.Router(); // Express의 Router를 사용
const db = require('../../config/db'); // 데이터베이스 연결 설정을 불러옴

// 용어 리스트 페이지 라우팅
router.get('/termboard', (req, res) => {
    // terms 테이블에서 모든 용어를 조회
    db.query('SELECT * FROM terms', (err, results) => {
        if (err) throw err; // 오류가 발생하면 예외를 던짐
        // 조회된 용어 리스트를 termboard 페이지에 렌더링하고 사용자 정보를 전달
        res.render('termboard', { terms: results, user: req.session.user });
    });
});

// 용어 검색 라우팅
router.get('/termboard/search', (req, res) => {
    const searchTerm = req.query.searchTerm; // 쿼리 파라미터에서 검색어를 추출
    // 검색어가 포함된 용어를 조회
    db.query('SELECT * FROM terms WHERE term_title LIKE ?', [`%${searchTerm}%`], (err, results) => {
        if (err) throw err; // 오류가 발생하면 예외를 던짐
        // 검색 결과를 termboard 페이지에 렌더링하고 사용자 정보를 전달
        res.render('termboard', { terms: results, user: req.session.user });
    });
});

// 특정 용어 상세 페이지 라우팅
router.get('/termDetail/:id', (req, res) => {
    const termId = req.params.id; // URL 파라미터에서 용어 ID를 추출
    // terms 테이블과 term_detail 테이블을 조인하여 특정 용어의 상세 정보를 조회
    db.query('SELECT t.*, d.detailed_description, d.additional_image FROM terms t LEFT JOIN term_detail d ON t.id = d.term_id WHERE t.id = ?', [termId], (err, result) => {
        if (err) throw err; // 오류가 발생하면 예외를 던짐
        if (result.length > 0) {
            // 조회된 용어 상세 정보를 termdetail 페이지에 렌더링하고 사용자 정보를 전달
            res.render('termdetail', { term: result[0], user: req.session.user });
        } else {
            res.status(404).send('용어를 찾을 수 없습니다.'); // 용어가 존재하지 않으면 404 상태 코드와 메시지를 전송
        }
    });
});

module.exports = router; // router 객체를 모듈로 내보냄
