import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'app.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    avatar TEXT NOT NULL,
    bio TEXT DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT DEFAULT '',
    author_id TEXT NOT NULL,
    cover_image TEXT DEFAULT '',
    category TEXT DEFAULT '其他',
    tags TEXT DEFAULT '[]',
    status TEXT DEFAULT 'published',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (author_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS counters (
    name TEXT PRIMARY KEY,
    value INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS fee_records (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    source TEXT DEFAULT '',
    purpose TEXT DEFAULT '',
    operator TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const getCounter = db.prepare('SELECT value FROM counters WHERE name = ?');
const setCounter = db.prepare('INSERT INTO counters (name, value) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET value = excluded.value');

function nextId(prefix) {
  const row = getCounter.get(prefix);
  const value = row ? row.value : 1;
  setCounter.run(prefix, value + 1);
  return `${prefix}_${value}`;
}

export function getAvatarUrl(username) {
  return `/api/avatar/${encodeURIComponent(username)}`;
}

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    password: row.password,
    avatar: row.avatar,
    bio: row.bio,
    createdAt: row.created_at,
  };
}

function rowToPublicUser(row) {
  const user = rowToUser(row);
  if (!user) return null;
  const { password, ...publicUser } = user;
  return publicUser;
}

function rowToArticle(row, author) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    summary: row.summary,
    author: author || row.author_id,
    coverImage: row.cover_image,
    category: row.category,
    tags: JSON.parse(row.tags || '[]'),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const findUserByEmailStmt = db.prepare('SELECT * FROM users WHERE email = ?');
const findUserByUsernameStmt = db.prepare('SELECT * FROM users WHERE username = ?');
const findUserByIdStmt = db.prepare('SELECT * FROM users WHERE id = ?');
const insertUserStmt = db.prepare(`
  INSERT INTO users (id, username, email, password, avatar, bio, created_at)
  VALUES (@id, @username, @email, @password, @avatar, @bio, @created_at)
`);

export function findUserByEmail(email) {
  return rowToUser(findUserByEmailStmt.get(email.toLowerCase().trim()));
}

export function findUserByUsername(username) {
  return rowToUser(findUserByUsernameStmt.get(username.trim()));
}

export function findUserById(id) {
  return rowToPublicUser(findUserByIdStmt.get(id));
}

export function createUser({ username, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.trim();
  const now = new Date().toISOString();

  const user = {
    id: nextId('user'),
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    avatar: getAvatarUrl(normalizedUsername),
    bio: '',
    createdAt: now,
  };

  insertUserStmt.run({
    id: user.id,
    username: user.username,
    email: user.email,
    password: user.password,
    avatar: user.avatar,
    bio: user.bio,
    created_at: user.createdAt,
  });

  return user;
}

const publishedArticlesStmt = db.prepare(`
  SELECT * FROM articles WHERE status = 'published' ORDER BY created_at DESC
`);
const articleByIdStmt = db.prepare('SELECT * FROM articles WHERE id = ?');
const articlesByAuthorStmt = db.prepare(`
  SELECT * FROM articles WHERE author_id = ? ORDER BY created_at DESC
`);
const insertArticleStmt = db.prepare(`
  INSERT INTO articles (
    id, title, content, summary, author_id, cover_image, category, tags, status, created_at, updated_at
  ) VALUES (
    @id, @title, @content, @summary, @author_id, @cover_image, @category, @tags, @status, @created_at, @updated_at
  )
`);
const updateArticleStmt = db.prepare(`
  UPDATE articles SET
    title = @title,
    content = @content,
    summary = @summary,
    category = @category,
    tags = @tags,
    status = @status,
    updated_at = @updated_at
  WHERE id = @id
`);
const deleteArticleStmt = db.prepare('DELETE FROM articles WHERE id = ?');

function attachAuthor(articleRow) {
  const author = findUserById(articleRow.author_id);
  return rowToArticle(articleRow, author);
}

export function getPublishedArticles() {
  return publishedArticlesStmt.all().map(attachAuthor);
}

export function getArticleById(id) {
  const row = articleByIdStmt.get(id);
  if (!row) return null;
  return attachAuthor(row);
}

export function getArticlesByAuthor(userId) {
  return articlesByAuthorStmt.all(userId).map(attachAuthor);
}

export function createArticle({ title, content, summary, authorId, category, tags, status }) {
  const now = new Date().toISOString();
  const article = {
    id: nextId('article'),
    title,
    content,
    summary,
    author_id: authorId,
    cover_image: '',
    category: category || '其他',
    tags: JSON.stringify(tags || []),
    status: status || 'published',
    created_at: now,
    updated_at: now,
  };

  insertArticleStmt.run(article);
  return getArticleById(article.id);
}

export function updateArticle(id, { title, content, summary, category, tags, status }) {
  const existing = articleByIdStmt.get(id);
  if (!existing) return null;

  updateArticleStmt.run({
    id,
    title,
    content,
    summary,
    category,
    tags: JSON.stringify(tags || []),
    status: status || 'published',
    updated_at: new Date().toISOString(),
  });

  return getArticleById(id);
}

export function deleteArticle(id) {
  const result = deleteArticleStmt.run(id);
  return result.changes > 0;
}

export function getArticleAuthorId(id) {
  const row = articleByIdStmt.get(id);
  return row ? row.author_id : null;
}

function rowToFeeRecord(row) {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    source: row.source,
    purpose: row.purpose,
    operator: row.operator,
    createdAt: row.created_at,
  };
}

const getFeeRecordsStmt = db.prepare(`
  SELECT * FROM fee_records ORDER BY created_at DESC
`);
const getFeeRecordByIdStmt = db.prepare('SELECT * FROM fee_records WHERE id = ?');
const insertFeeRecordStmt = db.prepare(`
  INSERT INTO fee_records (id, type, amount, source, purpose, operator, created_at)
  VALUES (@id, @type, @amount, @source, @purpose, @operator, @created_at)
`);
const deleteFeeRecordStmt = db.prepare('DELETE FROM fee_records WHERE id = ?');
const getTotalBalanceStmt = db.prepare(`
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END), 0) as total_deposit,
    COALESCE(SUM(CASE WHEN type = 'withdraw' THEN amount ELSE 0 END), 0) as total_withdraw
  FROM fee_records
`);

export function getFeeRecords() {
  return getFeeRecordsStmt.all().map(rowToFeeRecord);
}

export function getFeeRecordById(id) {
  const row = getFeeRecordByIdStmt.get(id);
  return row ? rowToFeeRecord(row) : null;
}

export function createFeeRecord({ type, amount, source, purpose, operator }) {
  const now = new Date().toISOString();
  const record = {
    id: nextId('fee'),
    type,
    amount,
    source: source || '',
    purpose: purpose || '',
    operator,
    created_at: now,
  };

  insertFeeRecordStmt.run(record);
  return getFeeRecordById(record.id);
}

export function deleteFeeRecord(id) {
  const result = deleteFeeRecordStmt.run(id);
  return result.changes > 0;
}

export function getFeeBalance() {
  const row = getTotalBalanceStmt.get();
  return {
    totalDeposit: row.total_deposit,
    totalWithdraw: row.total_withdraw,
    balance: row.total_deposit - row.total_withdraw,
  };
}

export async function seedDemoData() {
  const demoUser = findUserByEmail('demo@example.com');
  if (demoUser) return;

  const hashedPassword = await bcrypt.hash('demo123', 10);
  const user = createUser({
    username: 'demo',
    email: 'demo@example.com',
    password: hashedPassword,
  });

  db.prepare('UPDATE users SET bio = ? WHERE id = ?').run('这是一个演示用户', user.id);

  createArticle({
    title: '欢迎加入王耀庄家庭',
    content: '<p>欢迎加入王耀庄大家庭！在这里，你可以自由地表达你的想法，分享你的故事。</p><p>我们提供了一个温馨的社区环境，让你与志同道合的朋友们一起成长。</p>',
    summary: '欢迎加入王耀庄大家庭，开启你的精彩之旅。',
    authorId: user.id,
    category: '其他',
    tags: ['欢迎', '社区'],
    status: 'published',
  });

  console.log('Demo data seeded successfully');
}

export default db;