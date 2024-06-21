const express = require('express'); // Express 모듈을 불러옴
const router = express.Router(); // 라우터 객체 생성
const db = require('../../config/db');  // 데이터베이스 설정 파일 불러옴


// 브랜드 목록을 표시하는 라우트
router.get('/carboard', (req, res) => {
    const user = req.session.user; // 세션에서 사용자 정보 가져옴

    db.query('SELECT * FROM brands', (err, brands) => { // 데이터베이스에서 브랜드 목록을 가져옴
        if (err) throw err;  // 오류 발생 시 예외를 던짐
        res.render('carboard', { user, brands }); // 'carboard' 템플릿에 사용자와 브랜드 목록을 전달하여 렌더링
    });
});

// 특정 브랜드의 자동차 모델 목록을 표시하는 라우트
router.get('/carModels/:brandId', (req, res) => {
    const user = req.session.user; // 세션에서 사용자 정보 가져옴
    const brandId = req.params.brandId; // URL 매개변수에서 브랜드 ID를 가져옴

    db.query('SELECT * FROM car_models WHERE brand_id = ?', [brandId], (err, models) => {
        if (err) { // 오류 발생 시
            console.error(err); // 오류를 콘솔에 출력
            res.status(500).send("Database query error"); // 상태 코드 500과 함께 오류 메시지를 전송
            return;
        }
        res.render('carModels', { user, models }); // 'carModels' 템플릿에 사용자와 모델 목록을 전달하여 렌더링
    });
});

// 특정 모델의 상세 정보를 표시하는 라우트
router.get('/carDetail/:modelId', (req, res) => {
    const user = req.session.user; // 세션에서 사용자 정보 가져옴
    const modelId = req.params.modelId;  // URL 매개변수에서 모델 ID를 가져옴

   // 특정 모델의 상세 정보를 데이터베이스에서 조인하여 가져옴
    db.query('SELECT * FROM car_models JOIN car_detail ON car_models.id = car_detail.model_id WHERE car_models.id = ?', [modelId], (err, results) => {
        if (err) { // 오류 발생 시
            console.error(err); // 오류를 콘솔에 출력
            res.status(500).send("Database query error"); // 상태 코드 500과 함께 오류 메시지를 전송
            return;
        }
        if (results.length === 0) {  // 결과가 없으면
            res.status(404).send("Model not found"); // 상태 코드 404와 함께 모델을 찾을 수 없다는 메시지를 전송
            return;
        }
        const model = results[0]; // 모델 정보 가져옴
        let images = [];
        if (model.image_url && typeof model.image_url === 'string') { // 이미지 URL이 문자열인지 확인
            images = model.image_url.split(',').map(url => url.trim()); // 이미지 URL을 배열로 변환
        }
        res.render('carDetail', { user, model, images });  // 'carDetail' 템플릿에 사용자, 모델 정보, 이미지 목록을 전달하여 렌더링
    });
});


module.exports = router; // 라우터 모듈을 내보냄