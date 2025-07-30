import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      const error = new Error('Foydalanuvchi nomi va parol talab qilinadi');
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      const error = new Error('Foydalanuvchi nomi allaqachon mavjud');
      error.statusCode = 400;
      throw error;
    }

    const user = new User({ username, password });
    await user.save();
    const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET);
    res.status(201).json({ token, message: 'Ro‘yxatdan o‘tish muvaffaqiyatli' });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      const error = new Error('Noto‘g‘ri foydalanuvchi nomi yoki parol');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET);
    res.json({ token, message: 'Kirish muvaffaqiyatli' });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      const error = new Error('Foydalanuvchi topilmadi');
      error.statusCode = 404;
      throw error;
    }

    if (username) user.username = username;
    if (password) user.password = password;
    await user.save();

    req.io.emit('profileUpdated', { id: user._id, username: user.username });
    res.json({ message: 'Profil muvaffaqiyatli yangilandi' });
  } catch (error) {
    next(error);
  }
});

export default router;