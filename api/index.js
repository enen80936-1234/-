import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getFeeRecords, getFeeBalance, createFeeRecord, deleteFeeRecord } from './db.js';

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

initializeData();

export default async function handler(req, res) {
  if (!initialized) {
    await initializeData();
  }
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  if (pathname === '/api/auth/register' && req.method === 'POST') {
    try {
      const { username, email, password } = req.body;

      const existingUser = users.find(u => u.email === email || u.username === username);

      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({ message: '该邮箱已被注册' });
        }
        return res.status(400).json({ message: '该用户名已被使用' });
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

      const token = jwt.sign({ userId: user.id }, 'secret-key-change-in-production', { expiresIn: '7d' });

      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
        },
        token,
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }

  else if (pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const { email, password } = req.body;

      const user = users.find(u => u.email === email);

      if (!user) {
        return res.status(400).json({ message: '邮箱或密码错误' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: '邮箱或密码错误' });
      }

      const token = jwt.sign({ userId: user.id }, 'secret-key-change-in-production', { expiresIn: '7d' });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }

  else if (pathname === '/api/auth/me' && req.method === 'GET') {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }

    try {
      const decoded = jwt.verify(token, 'secret-key-change-in-production');
      const user = users.find(u => u.id === decoded.userId);

      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      });
    } catch (error) {
      res.status(401).json({ message: 'token无效' });
    }
  }

  else if (pathname === '/api/articles' && req.method === 'GET') {
    try {
      const publishedArticles = articles
        .filter(a => a.status === 'published')
        .map(a => ({
          ...a,
          author: users.find(u => u.id === a.author),
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json(publishedArticles);
    } catch (error) {
      console.error('Get articles error:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }

  else if (pathname.startsWith('/api/articles/') && pathname.split('/').length === 4 && req.method === 'GET') {
    try {
      const id = pathname.split('/')[3];
      const article = articles.find(a => a.id === id);

      if (!article) {
        return res.status(404).json({ message: '文章不存在' });
      }

      const articleWithAuthor = {
        ...article,
        author: users.find(u => u.id === article.author),
      };

      res.json(articleWithAuthor);
    } catch (error) {
      console.error('Get article error:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }

  else if (pathname === '/api/articles' && req.method === 'POST') {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }

    try {
      const decoded = jwt.verify(token, 'secret-key-change-in-production');
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

      const articleWithAuthor = {
        ...article,
        author: users.find(u => u.id === decoded.userId),
      };

      res.status(201).json(articleWithAuthor);
    } catch (error) {
      console.error('Create article error:', error);
      res.status(401).json({ message: 'token无效' });
    }
  }

  else if (pathname.startsWith('/api/articles/') && pathname.split('/').length === 4 && req.method === 'PUT') {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }

    try {
      const decoded = jwt.verify(token, 'secret-key-change-in-production');
      const id = pathname.split('/')[3];

      const articleIndex = articles.findIndex(a => a.id === id);

      if (articleIndex === -1) {
        return res.status(404).json({ message: '文章不存在' });
      }

      const article = articles[articleIndex];

      if (article.author !== decoded.userId) {
        return res.status(403).json({ message: '无权编辑此文章' });
      }

      const { title, content, summary, category, tags, status } = req.body;

      articles[articleIndex] = {
        ...article,
        title,
        content,
        summary,
        category,
        tags: tags || [],
        status: status || 'published',
        updatedAt: new Date().toISOString(),
      };

      const updatedArticle = {
        ...articles[articleIndex],
        author: users.find(u => u.id === decoded.userId),
      };

      res.json(updatedArticle);
    } catch (error) {
      console.error('Update article error:', error);
      res.status(401).json({ message: 'token无效' });
    }
  }

  else if (pathname.startsWith('/api/articles/') && pathname.split('/').length === 4 && req.method === 'DELETE') {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: '未授权' });
    }

    try {
      const decoded = jwt.verify(token, 'secret-key-change-in-production');
      const id = pathname.split('/')[3];

      const articleIndex = articles.findIndex(a => a.id === id);

      if (articleIndex === -1) {
        return res.status(404).json({ message: '文章不存在' });
      }

      const article = articles[articleIndex];

      if (article.author !== decoded.userId) {
        return res.status(403).json({ message: '无权删除此文章' });
      }

      articles.splice(articleIndex, 1);

      res.json({ message: '文章删除成功' });
    } catch (error) {
      console.error('Delete article error:', error);
      res.status(401).json({ message: 'token无效' });
    }
  }

  else if (pathname.startsWith('/api/articles/user/') && req.method === 'GET') {
    try {
      const userId = pathname.split('/')[4];
      const userArticles = articles
        .filter(a => a.author === userId)
        .map(a => ({
          ...a,
          author: users.find(u => u.id === a.author),
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json(userArticles);
    } catch (error) {
      console.error('Get user articles error:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }

  else if (pathname === '/api/fee/records' && req.method === 'GET') {
    try {
      const records = getFeeRecords();
      res.json(records);
    } catch (error) {
      console.error('Get fee records error:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }

  else if (pathname === '/api/fee/balance' && req.method === 'GET') {
    try {
      res.json(getFeeBalance());
    } catch (error) {
      console.error('Get fee balance error:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }

  else if (pathname === '/api/fee/records' && req.method === 'POST') {
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
  }

  else if (pathname.startsWith('/api/fee/records/') && req.method === 'DELETE') {
    try {
      const id = pathname.split('/')[4];
      const success = deleteFeeRecord(id);

      if (!success) {
        return res.status(404).json({ message: '记录不存在' });
      }

      res.json({ message: '删除成功' });
    } catch (error) {
      console.error('Delete fee record error:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }

  else {
    res.status(404).json({ message: 'Not found' });
  }
}
