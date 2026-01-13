const mongoose = require('mongoose');

// 할일 스키마 정의
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '할일 제목은 필수입니다.'],
    trim: true,
    maxlength: [200, '할일 제목은 200자 이하여야 합니다.']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, '할일 설명은 1000자 이하여야 합니다.']
  }
}, {
  timestamps: true // createdAt과 updatedAt을 자동으로 관리
});

module.exports = todoSchema;
