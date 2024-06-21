const session = require('express-session'); // 세션 설정을 위한 express-session 모듈 사용


// 세션 설정을 내보내는 함수를 모듈로 정의
module.exports = function(sessionConfig) {
    // express-session을 사용하여 세션 설정을 반환
    return session({
        secret: sessionConfig.secret, // 세션 암호화 키
        resave: sessionConfig.resave, // 세션을 항상 저장할 지 설정
        saveUninitialized: sessionConfig.saveUninitialized, // 초기화되지 않은 세션을 저장할 지 설정
        cookie: { secure: sessionConfig.secure } // HTTPS를 통해서만 쿠키가 전송되는지 설정
    });
};