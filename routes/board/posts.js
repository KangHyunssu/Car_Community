const express = require('express'); // Express 프레임워크를 불러옴
const router = express.Router(); // Express의 Router 객체 생성
const multer = require('multer'); // 파일 업로드 처리를 위한 Multer 모듈 불러옴
const path = require('path'); // 파일 경로 관리를 위한 Path 모듈 불러옴
const db = require('../../config/db'); // 데이터베이스 연결 설정을 불러옴
const moment = require('moment-timezone'); // 시간 관리를 위한 Moment-Timezone 모듈 불러옴

// Multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // 파일 저장 경로 설정
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // 파일명 설정
    }
});

const upload = multer({ storage: storage }); // Multer 인스턴스 생성

// 자유 게시판 게시글 작성 처리
router.post('/write', upload.single('image'), (req, res) => {
    if (!req.session || !req.session.user) { // 로그인 상태 확인
        return res.status(401).send('로그인이 필요합니다.');
    }
    const { title, content } = req.body; // 요청 본문에서 제목과 내용 추출
    const author = req.session.user.nickname; // 세션에서 작성자 정보 추출
    const imageUrl = req.file ? '/uploads/' + req.file.filename : null; // 이미지 업로드 여부에 따라 URL 설정
    const board_type = "자유";  // 게시판 유형 설정

    const sql = 'INSERT INTO posts (title, content, author, image_url, board_type) VALUES (?, ?, ?, ?, ?)'; // 게시글 삽입 SQL 쿼리
    db.query(sql, [title, content, author, imageUrl, board_type], (err, result) => { // 데이터베이스에 게시글 삽입
        if (err) {
            console.error('데이터베이스 삽입 중 오류 발생:', err);
            return res.status(500).send('데이터베이스 오류');
        }
        res.redirect('/freeboard'); // 성공 시 자유 게시판으로 리다이렉트
    });
});

// 댓글 추가 처리
router.post('/freeboard/:id/comment', (req, res) => {
    if (!req.session || !req.session.user) { // 로그인 상태 확인
        // 로그인 필요 메시지와 함께 로그인 페이지로 리다이렉트
        return res.status(401).send('<script>alert("로그인 후 사용 가능합니다."); location.href="/login";</script>');
    }
    const postId = req.params.id; // URL에서 게시글 ID 추출
    const { comment } = req.body; // 요청 본문에서 댓글 내용 추출
    const author = req.session.user.nickname; // 세션에서 작성자 정보 추출

    const insertCommentQuery = 'INSERT INTO comments (post_id, author, content) VALUES (?, ?, ?)'; // 댓글 삽입 SQL 쿼리
    db.query(insertCommentQuery, [postId, author, comment], (err, result) => { // 데이터베이스에 댓글 삽입
        if (err) {
            console.error('데이터베이스 삽입 중 오류 발생:', err);
            return res.status(500).send('데이터베이스 오류');
        }
        res.redirect('/freeboard/' + postId); // 성공 시 해당 게시글로 리다이렉트
    });
});

// 댓글 삭제 처리
router.post('/freeboard/comment/delete/:id', (req, res) => {
    if (!req.session || !req.session.user) { // 로그인 상태 확인
        return res.status(401).send('로그인이 필요합니다.');
    }
    const commentId = req.params.id; // URL에서 댓글 ID 추출

    // 댓글 작성자 또는 관리자만 삭제 가능
    const checkAuthorQuery = 'SELECT author FROM comments WHERE id = ?'; // 댓글 작성자 확인 SQL 쿼리
    db.query(checkAuthorQuery, [commentId], (err, results) => { // 데이터베이스에서 댓글 작성자 조회
        if (err) {
            console.error('데이터베이스 조회 중 오류 발생:', err);
            return res.status(500).send('데이터베이스 오류');
        }
        if (results.length > 0) {
            const commentAuthor = results[0].author; // 댓글 작성자 정보 추출
            if (req.session.user.role === 'admin' || req.session.user.nickname === commentAuthor) { // 관리자이거나 댓글 작성자인 경우
                const deleteCommentQuery = 'DELETE FROM comments WHERE id = ?'; // 댓글 삭제 SQL 쿼리
                db.query(deleteCommentQuery, [commentId], (err, result) => { // 데이터베이스에서 댓글 삭제
                    if (err) {
                        console.error('댓글 삭제 중 오류 발생:', err);
                        return res.status(500).send('데이터베이스 오류');
                    }
                    res.redirect('back'); // 성공 시 이전 페이지로 리다이렉트
                });
            } else {
                res.status(403).send('삭제 권한이 없습니다.'); // 권한 없는 경우 에러 메시지 반환
            }
        } else {
            res.status(404).send('댓글을 찾을 수 없습니다.'); // 댓글을 찾을 수 없는 경우 에러 메시지 반환
        }
    });
});

// 공감수 증가 처리
router.post('/freeboard/like/:id', (req, res) => {
    if (!req.session.user) { // 로그인 상태 확인
        return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
    }
    const postId = req.params.id; // URL에서 게시글 ID 추출
    const updateLikesQuery = 'UPDATE posts SET likes = likes + 1 WHERE id = ?'; // 공감수 증가 SQL 쿼리
    db.query(updateLikesQuery, [postId], (err, result) => { // 데이터베이스에서 공감수 업데이트
        if (err) {
            console.error('데이터베이스 업데이트 중 오류 발생:', err);
            return res.status(500).json({ success: false, message: '데이터베이스 오류' });
        }
        // 업데이트된 공감수 조회
        const getUpdatedLikes = 'SELECT likes FROM posts WHERE id = ?'; // 공감수 조회 SQL 쿼리
        db.query(getUpdatedLikes, [postId], (err, results) => { // 데이터베이스에서 공감수 조회
            if (err) {
                console.error('공감수 조회 중 오류 발생:', err);
                return res.status(500).json({ success: false, message: '데이터베이스 오류' });
            }
            res.json({ success: true, likes: results[0].likes }); // 공감수 반환
        });
    });
});

// 조회수 업데이트, 게시글, 댓글 정보 조회
router.get('/freeboard/:id', (req, res) => {
    const postId = req.params.id; // URL에서 게시글 ID 추출

    // 조회수 업데이트
    const updateViewsQuery = 'UPDATE posts SET views = views + 1 WHERE id = ?';
    db.query(updateViewsQuery, [postId], (err, result) => { // 데이터베이스에서 조회수 업데이트
        if (err) {
            console.error('데이터베이스 업데이트 중 오류 발생:', err);
            return res.status(500).send('데이터베이스 오류');
        }

        // 게시글 정보 조회
        const selectPostQuery = 'SELECT * FROM posts WHERE id = ?';
        db.query(selectPostQuery, [postId], (err, postResults) => { // 데이터베이스에서 게시글 정보 조회
            if (err) {
                console.error('데이터베이스 조회 중 오류 발생:', err);
                return res.status(500).send('데이터베이스 오류');
            }
            if (postResults.length > 0) {
                const post = postResults[0];

                // 댓글 정보 조회
                const selectCommentsQuery = 'SELECT * FROM comments WHERE post_id = ?';
                db.query(selectCommentsQuery, [postId], (err, commentsResults) => { // 데이터베이스에서 댓글 정보 조회
                    if (err) {
                        console.error('데이터베이스 조회 중 오류 발생:', err);
                        return res.status(500).send('데이터베이스 오류');
                    }
                    // 게시글과 댓글 정보를 함께 렌더링
                    res.render('read', { post: post, comments: commentsResults, user: req.session.user });
                });
            } else {
                res.status(404).send('게시글을 찾을 수 없습니다.');
            }
        });
    });
});

// 게시글 수정 페이지 라우트
router.get('/edit/:id', (req, res) => {
    if (!req.session.user) { // 로그인 상태 확인
        return res.status(401).send('로그인이 필요합니다.');
    }
    const postId = req.params.id; // URL에서 게시글 ID 추출
    const sql = 'SELECT * FROM posts WHERE id = ?';
    db.query(sql, [postId], (err, results) => { // 데이터베이스에서 게시글 정보 조회
        if (err) {
            console.error('데이터베이스 조회 중 오류 발생:', err);
            return res.status(500).send('데이터베이스 오류');
        }
        if (results.length > 0) {
            const post = results[0];
            // 관리자이거나 게시글의 작성자와 로그인한 사용자가 일치할 경우에만 수정 페이지 접근 허용
            if (req.session.user.role === 'admin' || req.session.user.nickname === post.author) {
                res.render('edit', { post: post, user: req.session.user });
            } else {
                res.status(403).send('수정 권한이 없습니다.');
            }
        } else {
            res.status(404).send('게시글을 찾을 수 없습니다.');
        }
    });
});

// 게시글 수정 처리 라우트
router.post('/edit/:id', upload.single('image'), (req, res) => {
    if (!req.session || !req.session.user) { // 로그인 상태 확인
        return res.status(401).send('로그인이 필요합니다.');
    }
    const postId = req.params.id; // URL에서 게시글 ID 추출
    const { title, content, board_type } = req.body; // 요청 본문에서 제목, 내용, 게시판 타입 추출
    const imageUrl = req.file ? '/uploads/' + req.file.filename : req.body.oldImage; // 이미지 업로드 처리
    const sql = 'UPDATE posts SET title = ?, content = ?, image_url = ?, board_type = ? WHERE id = ?';
    db.query(sql, [title, content, imageUrl, board_type, postId], (err, result) => { // 데이터베이스에서 게시글 업데이트
        if (err) {
            console.error('데이터베이스 업데이트 중 오류 발생:', err);
            return res.status(500).send('데이터베이스 오류');
        }
        res.redirect('/freeboard/' + postId); // 성공 시 해당 게시글로 리다이렉트
    });
});

// 게시글 삭제 처리 라우트
router.post('/delete/:id', (req, res) => {
    if (!req.session || !req.session.user) { // 로그인 상태 확인
        return res.status(401).send('로그인이 필요합니다.');
    }
    const postId = req.params.id; // URL에서 게시글 ID 추출
    const sql = 'DELETE FROM posts WHERE id = ?';
    db.query(sql, [postId], (err, result) => { // 데이터베이스에서 게시글 삭제
        if (err) {
            console.error('데이터베이스 삭제 중 오류 발생:', err);
            return res.status(500).send('데이터베이스 오류');
        }
        res.redirect('/freeboard'); // 성공 시 자유 게시판으로 리다이렉트
    });
});

// 글쓰기 페이지 라우트
router.get('/write', (req, res) => {
    if (req.session.user) { // 로그인 상태 확인
        res.render('write', { post: null, user: req.session.user }); // 글쓰기 페이지 렌더링
    } else {
        res.redirect('/login'); // 로그인 페이지로 리다이렉트
    }
});

module.exports = router; // 설정된 라우터를 모듈로 내보냄