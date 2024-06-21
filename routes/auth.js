const express = require('express'); // express 모듈을 불러옴
const router = express.Router(); // express의 Router를 사용
const bcrypt = require('bcrypt'); // bcrypt 모듈을 불러옴
const db = require('../config/db'); // 데이터베이스 연결 설정을 불러옴

// 로그인 페이지
router.get('/login', (req, res) => {
    res.render('login'); // 로그인 페이지를 렌더링
});

// 로그인 처리
router.post('/login', async (req, res) => {
    const { email, password } = req.body; // 요청 본문에서 email과 password를 추출
    const query = 'SELECT * FROM users WHERE email = ?'; // 사용자를 조회하는 SQL 쿼리 정의
    db.execute(query, [email], async (err, results) => { // SQL 쿼리를 실행
        if (err) {
            console.error('로그인 중 오류 발생:', err); // 오류 발생 시 콘솔에 로그 출력
            return res.render('login', { error: '로그인 실패' }); // 로그인 실패 메시지와 함께 로그인 페이지를 렌더링
        }
        if (results.length > 0) {
            const comparisonResult = await bcrypt.compare(password, results[0].password); // 입력된 비밀번호와 저장된 비밀번호 비교
            if (comparisonResult) {
                req.session.user = { nickname: results[0].nickname, role: results[0].role }; // 사용자의 닉네임과 역할을 세션에 저장
                res.redirect('/'); // 로그인 성공 시 메인 페이지로 리다이렉트
            } else {
                res.render('login', { error: '잘못된 비밀번호입니다.' }); // 비밀번호가 일치하지 않을 경우 오류 메시지 표시
            }
        } else {
            res.render('login', { error: '등록되지 않은 이메일입니다.' }); // 이메일이 등록되지 않은 경우 오류 메시지 표시
        }
    });
});

// 로그아웃 처리
router.get('/logout', (req, res) => {
    req.session.destroy(); // 세션 파기
    res.redirect('/'); // 메인 페이지로 리다이렉트
});

// 회원가입 페이지
router.get('/signup', (req, res) => {
    res.render('signup'); // 회원가입 페이지를 렌더링
});

// 회원가입 처리
router.post('/signup', async (req, res) => {
    const { nickname, email, password } = req.body; // 요청 본문에서 nickname, email, password 추출
    const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해시
    const query = 'INSERT INTO users (nickname, email, password) VALUES (?, ?, ?)'; // 사용자를 삽입하는 SQL 쿼리 정의
    db.execute(query, [nickname, email, hashedPassword], (err, results) => { // SQL 쿼리 실행
        if (err) {
            console.error('회원가입 중 오류 발생:', err); // 오류 발생 시 콘솔에 로그 출력
            return res.status(500).send('회원가입 실패'); // 회원가입 실패 메시지 전송
        }
        res.redirect('/login'); // 회원가입 성공 시 로그인 페이지로 리다이렉트
    });
});

module.exports = router; // router 객체를 모듈로 내보냄
