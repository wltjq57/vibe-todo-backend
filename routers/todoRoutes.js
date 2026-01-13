const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Todo = require('../models/Todo');

// 할일 목록 조회 라우터
router.get('/', async (req, res) => {
  try {
    // 모든 할일 조회 (최신순 정렬)
    const todos = await Todo.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: '할일 목록을 성공적으로 조회했습니다.',
      data: todos,
      count: todos.length
    });
  } catch (error) {
    console.error('할일 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '할일 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 할일 생성 라우터
router.post('/', async (req, res, next) => {
  try {
    const { title, description } = req.body;

    console.log('할일 생성 요청 받음:', { title, description });

    // title 필수 검증
    if (!title || title.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: '할일 제목은 필수입니다.' 
      });
    }

    // 새 할일 생성
    const todo = new Todo({
      title: title.trim(),
      description: description ? description.trim() : ''
    });

    console.log('할일 객체 생성 완료:', todo);

    // 데이터베이스에 저장
    const savedTodo = await todo.save();
    console.log('할일 저장 완료:', savedTodo);

    res.status(201).json({
      success: true,
      message: '할일이 성공적으로 생성되었습니다.',
      data: savedTodo
    });
  } catch (error) {
    console.error('할일 생성 오류 상세:', error);
    console.error('에러 스택:', error.stack);
    
    // 이미 응답이 전송된 경우
    if (res.headersSent) {
      return next(error);
    }

    res.status(500).json({
      success: false,
      message: '할일 생성 중 오류가 발생했습니다.',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 할일 수정 라우터
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    // ID 유효성 검증
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 할일 ID입니다.'
      });
    }

    // title 필수 검증
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '할일 제목은 필수입니다.'
      });
    }

    // 할일 찾기 및 수정
    const todo = await Todo.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        description: description ? description.trim() : '',
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    // 할일이 존재하지 않는 경우
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '해당 할일을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      message: '할일이 성공적으로 수정되었습니다.',
      data: todo
    });
  } catch (error) {
    console.error('할일 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '할일 수정 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 할일 삭제 라우터
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // ID 유효성 검증
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 할일 ID입니다.'
      });
    }

    // 할일 찾기 및 삭제
    const todo = await Todo.findByIdAndDelete(id);

    // 할일이 존재하지 않는 경우
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '해당 할일을 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      message: '할일이 성공적으로 삭제되었습니다.',
      data: todo
    });
  } catch (error) {
    console.error('할일 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '할일 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;
