import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lacket',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function getConnection() {
  return await pool.getConnection();
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const connection = await getConnection();
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.execute(
      'INSERT INTO users (username, password, tokens) VALUES (?, ?, ?)',
      [username, hashedPassword, 0]
    );
    const userId = result.insertId;
    const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '7d' });
    await connection.execute('INSERT INTO sessions (user_id, token) VALUES (?, ?)', [userId, token]);
    connection.release();
    res.json({ success: true, token, user: { id: userId, username, tokens: 0 } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const connection = await getConnection();
    const [users] = await connection.execute(
      'SELECT id, username, password, tokens FROM users WHERE username = ?',
      [username]
    );
    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      connection.release();
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    await connection.execute('INSERT INTO sessions (user_id, token) VALUES (?, ?)', [user.id, token]);
    connection.release();
    res.json({ success: true, token, user: { id: user.id, username: user.username, tokens: user.tokens } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const connection = await getConnection();
    const [users] = await connection.execute(
      'SELECT id, username, tokens, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    connection.release();
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const connection = await getConnection();
    const [users] = await connection.execute(
      'SELECT id, username, tokens FROM users ORDER BY tokens DESC LIMIT 100'
    );
    connection.release();
    res.json({ success: true, leaderboard: users.map((user, idx) => ({ rank: idx + 1, ...user })) });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running ✅' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Lacket Backend API', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`🚀 Lacket server running on http://localhost:${PORT}`);
  console.log(`📊 Database: lacket`);
});
