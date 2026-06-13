import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: '未授权' });
  }

  try {
    const decoded = jwt.verify(
      token,
      'secret-key-change-in-production'
    );

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'token无效' });
  }
};

export default authMiddleware;
