import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from './models/User.js';
import Todo from './models/Todo.js';

// .env faylini sozlash
dotenv.config();

// ES modullarda __dirname olish
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Middleware'lar
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cheklov (baytlarda)
  abortOnLimit: true,
}));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB ulanishi
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app';
mongoose.connect(MONGODB_URI).then(() => {
  console.log('MongoDB-ga ulanish muvaffaqiyatli');
}).catch(err => {
  console.error('MongoDB ulanish xatosi:', err);
});

// JWT maxfiy kaliti
const JWT_SECRET = process.env.JWT_SECRET || 'sizning-maxfiy-kalitingiz';

// JWT tokenini tekshirish middleware'i
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Ruxsat berilmadi' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Noto‘g‘ri token' });
    req.user = user;
    next();
  });
};

// Maxsus xato boshqaruvchi middleware
const errorHandler = (err, req, res, next) => {
  console.error('Xato:', err.message);
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Serverda nimadir xato ketdi';

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: errorMessage,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
};

// Autentifikatsiya yo‘llari
app.post('/api/register', async (req, res, next) => {
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
    const token = jwt.sign({ id: user._id, username }, JWT_SECRET);
    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
});

app.post('/api/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !(await user.comparePassword(password))) {
      const error = new Error('Noto‘g‘ri ma’lumotlar');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({ id: user._id, username }, JWT_SECRET);
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

// Foydalanuvchi profilini yangilash
app.put('/api/profile', authenticateToken, async (req, res, next) => {
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
    io.emit('profileUpdated', { id: user._id, username: user.username });
    res.json({ message: 'Profil muvaffaqiyatli yangilandi' });
  } catch (error) {
    next(error);
  }
});

// Todo CRUD yo‘llari
app.post('/api/todos', authenticateToken, async (req, res, next) => {
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
    io.emit('todoCreated', todo);
    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
});

app.get('/api/todos', authenticateToken, async (req, res, next) => {
  try {
    const userTodos = await Todo.find({ userId: req.user.id });
    res.json(userTodos);
  } catch (error) {
    next(error);
  }
});

app.put('/api/todos/:id', authenticateToken, async (req, res, next) => {
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
    io.emit('todoUpdated', todo);
    res.json(todo);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/todos/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!todo) {
      const error = new Error('Todo topilmadi');
      error.statusCode = 404;
      throw error;
    }

    io.emit('todoDeleted', todo._id);
    res.json({ message: 'Todo muvaffaqiyatli o‘chirildi' });
  } catch (error) {
    next(error);
  }
});

// Socket.io ulanishi
io.on('connection', (socket) => {
  console.log('Foydalanuvchi ulandi:', socket.id);
  socket.on('disconnect', () => {
    console.log('Foydalanuvchi uzildi:', socket.id);
  });
});

// Frontendni xizmat qilish
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Xatolarni boshqarish middleware'ini qo‘shish
app.use(errorHandler);

// Serverni ishga tushirish
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server ${PORT} portida ishlamoqda`);
});