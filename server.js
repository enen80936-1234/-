import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  seedDemoData,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUser,
  getPublishedArticles,
  getArticleById,
  getArticlesByAuthor,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleAuthorId,
  getFeeRecords,
  getFeeBalance,
  createFeeRecord,
  deleteFeeRecord,
} from './api/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-change-in-production';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
  };
}

function getTokenFromRequest(req) {
  return req.headers.authorization?.replace('Bearer ', '');
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/avatar/:seed', (req, res) => {
  const seed = decodeURIComponent(req.params.seed || 'U');
  const initial = seed.charAt(0).toUpperCase() || 'U';
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
  const color = colors[initial.charCodeAt(0) % colors.length];

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">` +
    `<rect fill="${color}" width="128" height="128"/>` +
    `<text x="64" y="72" text-anchor="middle" fill="white" font-size="52" font-family="sans-serif">${initial}</text>` +
    `</svg>`
  );
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: '请填写完整信息' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: '密码至少需要6个字符' });
    }

    const existingByEmail = findUserByEmail(email);
    if (existingByEmail) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    const existingByUsername = findUserByUsername(username);
    if (existingByUsername) {
      return res.status(400).json({ message: '该用户名已被使用' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = createUser({ username, email, password: hashedPassword });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: publicUser(user),
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '请填写邮箱和密码' });
    }

    const user = findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: publicUser(user),
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ message: '未授权' });

  try {
    const decoded = verifyToken(token);
    const user = findUserById(decoded.userId);
    if (!user) return res.status(404).json({ message: '用户不存在' });

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'token无效' });
  }
});

app.get('/api/articles', (_req, res) => {
  try {
    res.json(getPublishedArticles());
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.get('/api/articles/user/:userId', (req, res) => {
  try {
    res.json(getArticlesByAuthor(req.params.userId));
  } catch (error) {
    console.error('Get user articles error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.get('/api/articles/:id', (req, res) => {
  try {
    const article = getArticleById(req.params.id);
    if (!article) return res.status(404).json({ message: '文章不存在' });

    res.json(article);
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.post('/api/articles', (req, res) => {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ message: '未授权' });

  try {
    const decoded = verifyToken(token);
    const { title, content, summary, category, tags, status } = req.body;

    const article = createArticle({
      title,
      content,
      summary,
      authorId: decoded.userId,
      category,
      tags,
      status,
    });

    res.status(201).json(article);
  } catch (error) {
    console.error('Create article error:', error);
    res.status(401).json({ message: 'token无效' });
  }
});

app.put('/api/articles/:id', (req, res) => {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ message: '未授权' });

  try {
    const decoded = verifyToken(token);
    const authorId = getArticleAuthorId(req.params.id);

    if (!authorId) return res.status(404).json({ message: '文章不存在' });
    if (authorId !== decoded.userId) return res.status(403).json({ message: '无权编辑此文章' });

    const { title, content, summary, category, tags, status } = req.body;
    const article = updateArticle(req.params.id, {
      title,
      content,
      summary,
      category,
      tags,
      status,
    });

    res.json(article);
  } catch (error) {
    console.error('Update article error:', error);
    res.status(401).json({ message: 'token无效' });
  }
});

app.delete('/api/articles/:id', (req, res) => {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ message: '未授权' });

  try {
    const decoded = verifyToken(token);
    const authorId = getArticleAuthorId(req.params.id);

    if (!authorId) return res.status(404).json({ message: '文章不存在' });
    if (authorId !== decoded.userId) return res.status(403).json({ message: '无权删除此文章' });

    deleteArticle(req.params.id);
    res.json({ message: '文章删除成功' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(401).json({ message: 'token无效' });
  }
});

app.get('/api/fee/records', (req, res) => {
  try {
    res.json(getFeeRecords());
  } catch (error) {
    console.error('Get fee records error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.get('/api/fee/balance', (req, res) => {
  try {
    res.json(getFeeBalance());
  } catch (error) {
    console.error('Get fee balance error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.post('/api/fee/records', (req, res) => {
  try {
    const { type, amount, source, purpose, operator } = req.body;

    if (!type || !amount || !operator) {
      return res.status(400).json({ message: '缺少必填字段' });
    }

    if (type !== 'deposit' && type !== 'withdraw') {
      return res.status(400).json({ message: '类型必须是 deposit 或 withdraw' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: '金额必须大于 0' });
    }

    const record = createFeeRecord({
      type,
      amount: parseFloat(amount),
      source: type === 'deposit' ? source : '',
      purpose: type === 'withdraw' ? purpose : '',
      operator,
    });

    res.status(201).json(record);
  } catch (error) {
    console.error('Create fee record error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.delete('/api/fee/records/:id', (req, res) => {
  try {
    const success = deleteFeeRecord(req.params.id);

    if (!success) {
      return res.status(404).json({ message: '记录不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete fee record error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ message: '页面不存在，请先运行 npm run build' });
    }
  });
});

seedDemoData().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});
