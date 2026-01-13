const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
// CORS 설정
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // 환경 변수로 설정 가능, 기본값은 모든 origin 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: process.env.CORS_ORIGIN !== '*' ? true : false, // 특정 origin일 때만 credentials 허용
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 모든 응답에 보안 헤더 추가
app.use((req, res, next) => {
  // Referrer Policy 설정
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-db';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB 연결성공');
  })
  .catch((error) => {
    console.error('MongoDB 연결 실패:', error);
    process.exit(1);
  });

// MongoDB 연결 상태 확인 미들웨어
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.error('MongoDB 연결 상태:', mongoose.connection.readyState);
    return res.status(503).json({
      success: false,
      message: '데이터베이스에 연결할 수 없습니다.',
      error: 'MongoDB connection not ready'
    });
  }
  next();
});

// 라우터 import
const todoRoutes = require('./routers/todoRoutes');

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'TODO Backend API가 정상적으로 작동 중입니다.' });
});

// 할일 라우터
app.use('/api/todos', todoRoutes);

// 404 핸들러 (모든 라우트 이후에 위치)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 리소스를 찾을 수 없습니다.',
    path: req.path
  });
});

// 전역 에러 핸들러 (모든 미들웨어 이후에 위치)
app.use((err, req, res, next) => {
  console.error('서버 오류:', err);
  
  // 이미 응답이 전송된 경우
  if (res.headersSent) {
    return next(err);
  }

  // JSON 형식으로 에러 응답
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '서버 내부 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
