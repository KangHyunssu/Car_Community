const socketIO = require('socket.io'); // socket.io 모듈을 불러옴
const db = require('./config/db'); // 데이터베이스 연결 설정을 불러옴

module.exports = (server) => {
  const io = socketIO(server); // 서버 인스턴스를 사용하여 socket.io 초기화

  io.on('connection', (socket) => {
    console.log('사용자가 연결되었습니다.'); // 사용자가 연결되었을 때 메시지 출력

    // 특정 채팅방에 조인
    socket.on('joinRoom', ({ brand, user }) => {
      socket.join(brand); // 해당 브랜드 채팅방에 사용자를 추가
      console.log(`${user.nickname}님이 ${brand} 채팅방에 참여했습니다.`); // 채팅방 참여 메시지 출력
    });

    // 메시지 수신 및 방송
    socket.on('chatMessage', ({ brand, message, user }) => {
      const timestamp = new Date(); // 현재 시간 가져오기
      const formattedTimestamp = timestamp.toISOString().slice(0, 19).replace('T', ' '); // 시간을 포맷팅

      const chatMessage = {
        user: user.nickname,
        message,
        timestamp: formattedTimestamp
      };

      // 메시지를 데이터베이스에 저장
      const query = 'INSERT INTO messages (brand, user, message, timestamp) VALUES (?, ?, ?, ?)';
      db.execute(query, [brand, user.nickname, message, formattedTimestamp], (err, results) => {
        if (err) {
          console.error('메시지 저장 중 오류 발생:', err); // 오류 발생 시 콘솔에 출력
        }
      });

      io.to(brand).emit('message', chatMessage); // 해당 브랜드 채팅방에 메시지를 방송
    });

    // 사용자 연결 해제 시
    socket.on('disconnect', () => {
      console.log('사용자가 연결을 해제했습니다.'); // 사용자가 연결을 해제했을 때 메시지 출력
    });
  });
};
