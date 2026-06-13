import express from 'express';
import Article from '../models/Article.js';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate(
      'author',
      'username avatar email'
    );

    if (!article) {
      return res.status(404).json({ message: '文章不存在' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, summary, category, tags, status } = req.body;

    const article = new Article({
      title,
      content,
      summary,
      author: req.userId,
      category,
      tags: tags || [],
      status: status || 'published',
    });

    await article.save();
    await article.populate('author', 'username avatar email');

    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content, summary, category, tags, status } = req.body;

    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: '文章不存在' });
    }

    if (article.author.toString() !== req.userId) {
      return res.status(403).json({ message: '无权编辑此文章' });
    }

    article.title = title;
    article.content = content;
    article.summary = summary;
    article.category = category;
    article.tags = tags || [];
    article.status = status || 'published';
    article.updatedAt = new Date();

    await article.save();
    await article.populate('author', 'username avatar email');

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: '文章不存在' });
    }

    if (article.author.toString() !== req.userId) {
      return res.status(403).json({ message: '无权删除此文章' });
    }

    await article.deleteOne();

    res.json({ message: '文章删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const articles = await Article.find({
      author: req.params.userId,
    })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
