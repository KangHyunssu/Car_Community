const express = require('express'); // Express 프레임워크를 불러옴
const router = express.Router(); // Express의 Router 객체 생성
const moment = require('moment-timezone'); // 시간대 처리를 위해 moment-timezone 모듈을 불러옴

// 다른 라우트 파일을 사용하도록 설정
router.use(require('./freeboard')); // 자유 게시판 라우트 파일 사용
router.use(require('./newsboard')); // 뉴스 게시판 라우트 파일 사용
router.use(require('./termboard')); // 용어 게시판 라우트 파일 사용
router.use(require('./posts')); // 게시물 관련 라우트 파일 사용
router.use(require('./carboard')); // 자동차 게시판 라우트 파일 사용
router.use('/posts', require('./posts')); // '/posts' 경로에 게시물 관련 라우트 파일 사용
router.use(require('./salesRank')); // 판매 순위 라우트 파일 사용

module.exports = router; // 설정된 라우터를 모듈로 내보냄
