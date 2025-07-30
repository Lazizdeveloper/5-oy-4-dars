import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todos.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, 
  abortOnLimit: true,
}));
app.use(express.static(path.join(__dirname, 'public')));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB’ga ulanish muvaffaqiyatli'))
  .catch(err => console.error('MongoDB ulanish xatosi:', err));

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('Foydalanuvchi ulandi:', socket.id);
  socket.on('disconnect', () => {
    console.log('Foydalanuvchi uzildi:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server ${PORT} portida ishlamoqda`);
});