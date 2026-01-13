const mongoose = require('mongoose');
const todoSchema = require('./TodoSchema');

// Todo 모델 생성 및 export
const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
