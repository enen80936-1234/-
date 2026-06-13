import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let users = [];
let articles = [];
let userIdCounter = 1;
let articleIdCounter = 1;
let initialized = false;

const initializeData = async () => {
  if (initialized) return;
  
  try {
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const initialUser = {
      id: `user_${userIdCounter++}`,
      username: 'demo',
      email: 'demo@example.com',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      bio: '这是一个演示用户',
      createdAt: new Date().toISOString(),
    };
    users.push(initialUser);

    const initialArticle = {
      id: `article_${articleIdCounter++}`,
      title: '欢迎加入王耀庄家庭',
      content: '<p>欢迎加入王耀庄大家庭！在这里，你可以自由地表达你的想法，分享你的故事。</p><p>我们提供了一个温馨的社区环境，让你与志同道合的朋友们一起成长。</p>',
      summary: '欢迎加入王耀庄大家庭，开启你的精彩之旅。',
      author: initialUser.id,
      coverImage: '',
      category: '其他',
      tags: ['欢迎', '社区'],
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    articles.push(initialArticle);
    
    initialized = true;
    console.log('Data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize data:', error);
  }
};

const app = express();

// CORS配置
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// API路由
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ message: existingUser.email === email ? '该邮箱已被注册' : '该用户名已被使用' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: `user_${userIdCounter++}`,
      username,
      email,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio: '',
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret-key-change-in-production', { expiresIn: '7d' });

    res.status(201).json({
      user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio },
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
    const user = users.find(u => u.email === email);

    if (!user) return res.status(400).json({ message: '邮箱或密码错误' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: '邮箱或密码错误' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret-key-change-in-production', { expiresIn: '7d' });

    res.json({
      user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: '未授权' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-change-in-production');
    const user = users.find(u => u.id === decoded.userId);
    if (!user) return res.status(404).json({ message: '用户不存在' });

    res.json({ id: user.id, username: user.username, email: user.email, avatar: user.avatar, bio: user.bio });
  } catch (error) {
    res.status(401).json({ message: 'token无效' });
  }
});

app.get('/api/articles', (req, res) => {
  try {
    const publishedArticles = articles
      .filter(a => a.status === 'published')
      .map(a => ({ ...a, author: users.find(u => u.id === a.author) }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(publishedArticles);
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.get('/api/articles/:id', (req, res) => {
  try {
    const article = articles.find(a => a.id === req.params.id);
    if (!article) return res.status(404).json({ message: '文章不存在' });

    res.json({ ...article, author: users.find(u => u.id === article.author) });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.post('/api/articles', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: '未授权' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-change-in-production');
    const { title, content, summary, category, tags, status } = req.body;

    const article = {
      id: `article_${articleIdCounter++}`,
      title,
      content,
      summary,
      author: decoded.userId,
      coverImage: '',
      category: category || '其他',
      tags: tags || [],
      status: status || 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    articles.push(article);
    res.status(201).json({ ...article, author: users.find(u => u.id === decoded.userId) });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(401).json({ message: 'token无效' });
  }
});

app.put('/api/articles/:id', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: '未授权' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-change-in-production');
    const articleIndex = articles.findIndex(a => a.id === req.params.id);

    if (articleIndex === -1) return res.status(404).json({ message: '文章不存在' });
    if (articles[articleIndex].author !== decoded.userId) return res.status(403).json({ message: '无权编辑此文章' });

    const { title, content, summary, category, tags, status } = req.body;
    articles[articleIndex] = {
      ...articles[articleIndex],
      title, content, summary, category,
      tags: tags || [],
      status: status || 'published',
      updatedAt: new Date().toISOString(),
    };

    res.json({ ...articles[articleIndex], author: users.find(u => u.id === decoded.userId) });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(401).json({ message: 'token无效' });
  }
});

app.delete('/api/articles/:id', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: '未授权' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-change-in-production');
    const articleIndex = articles.findIndex(a => a.id === req.params.id);

    if (articleIndex === -1) return res.status(404).json({ message: '文章不存在' });
    if (articles[articleIndex].author !== decoded.userId) return res.status(403).json({ message: '无权删除此文章' });

    articles.splice(articleIndex, 1);
    res.json({ message: '文章删除成功' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(401).json({ message: 'token无效' });
  }
});

app.get('/api/articles/user/:userId', (req, res) => {
  try {
    const userArticles = articles
      .filter(a => a.author === req.params.userId)
      .map(a => ({ ...a, author: users.find(u => u.id === a.author) }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(userArticles);
  } catch (error) {
    console.error('Get user articles error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 静态文件服务
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 初始化并启动服务器
initializeData().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});
