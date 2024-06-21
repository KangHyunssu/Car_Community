const express = require('express'); // Express 모듈을 불러옴
const bodyParser = require('body-parser'); // body-parser 모듈을 불러옴
const db = require('./config/db'); // 데이터베이스 연결 설정을 불러옴
const bcrypt = require('bcrypt'); // bcrypt 모듈을 불러옴
const session = require('express-session'); // express-session 모듈을 불러옴
const http = require('http'); // HTTP 서버 모듈을 불러옴
const app = express(); // Express 애플리케이션 생성
const moment = require('moment-timezone'); // 시간대를 처리하기 위해 moment-timezone 모듈을 불러옴

// 뷰 엔진 설정
app.set('view engine', 'ejs');

// 정적 파일 경로 설정
app.use(express.static('public'));

// 바디 파서 설정
app.use(bodyParser.urlencoded({ extended: true }));

// 세션 미들웨어 설정
app.use(session({
  secret: 'secret_key', // 세션 암호화 키 설정
  resave: false, // 세션을 항상 저장할지 여부 설정
  saveUninitialized: true, // 초기화되지 않은 세션을 저장할지 여부 설정
  cookie: {
    secure: false // HTTPS를 사용하지 않는 경우 false로 설정
  }
}));

// 라우트 파일 임포트
const indexRouter = require('./routes/index');
const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/board');
const chatRoutes = require('./routes/chat');   
const newsBoardRoutes = require('./routes/board/newsboard');
const termboardRoutes = require('./routes/board/termboard');

// 라우트 사용
app.use('/', indexRouter); // 메인 페이지 라우트
app.use('/', authRoutes); // 인증 관련 라우트
app.use('/', boardRoutes); // 게시판 관련 라우트
app.use('/', chatRoutes); // 채팅 관련 라우트
app.use('/board', boardRoutes); // 게시판 라우트
app.use('/newsboard', newsBoardRoutes); // 뉴스 게시판 라우트
app.use('/termboard', termboardRoutes); // 용어 게시판 라우트

// 서버 생성 및 실행
const server = http.createServer(app); // HTTP 서버 생성
const PORT = 3000; // 서버 포트 설정
const HOST = '0.0.0.0'; // 모든 IP에서 접속 허용
server.listen(PORT, HOST, () => {
  console.log(`서버가 http://${HOST}:${PORT}에서 실행중입니다.`); // 서버 실행 메시지 출력
});

// Socket.IO 설정
require('./socket')(server); // Socket.IO 설정 및 서버에 연결
