import express from 'express';
import Todo from '../models/Todo.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      const error = new Error('Sarlavha talab qilinadi');
      error.statusCode = 400;
      throw error;
    }

    const todo = new Todo({
      userId: req.user.id,
      title,
      description,
      completed: false,
      createdAt: new Date(),
    });

    await todo.save();
    req.io.emit('todoCreated', todo);
    res.status(201).json({ todo, message: 'Todo muvaffaqiyatli yaratildi' });
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userTodos = await Todo.find({ userId: req.user.id });
    res.json(userTodos);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    const todo = await Todo.findOne({ _id: id, userId: req.user.id });

    if (!todo) {
      const error = new Error('Todo topilmadi');
      error.statusCode = 404;
      throw error;
    }

    if (title) todo.title = title;
    if (description) todo.description = description;
    if (completed !== undefined) todo.completed = completed;
    await todo.save();

    req.io.emit('todoUpdated', todo);
    res.json({ todo, message: 'Todo muvaffaqiyatli yangilandi' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!todo) {
      const error = new Error('Todo topilmadi');
      error.statusCode = 404;
      throw error;
    }

    req.io.emit('todoDeleted', todo._id);
    res.json({ message: 'Todo muvaffaqiyatli o‘chirildi' });
  } catch (error) {
    next(error);
  }
});

export default router;