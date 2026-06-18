import bcrypt from 'bcryptjs';
import { CloudBase } from '@cloudbase/node-sdk';

let db = null;
let tcb = null;

async function initCloudBase() {
  if (tcb) return;
  
  try {
    tcb = new CloudBase({
      env: process.env.TCB_ENV || 'wangjiansheng-d9gtp0u2e6b3',
    });
    db = tcb.database();
    await db.collection('users').get().catch(() => {});
    console.log('CloudBase initialized successfully');
  } catch (error) {
    console.error('Failed to initialize CloudBase:', error);
    throw error;
  }
}

async function ensureCollection(name) {
  await initCloudBase();
  try {
    await db.createCollection(name);
  } catch (e) {
    if (!e.message.includes('already exists')) {
      throw e;
    }
  }
}

async function createTables() {
  await ensureCollection('users');
  await ensureCollection('articles');
  await ensureCollection('fee_records');
  await ensureCollection('counters');
}

createTables().catch(console.error);

async function getCounter(name) {
  await initCloudBase();
  const res = await db.collection('counters').where({ name }).get();
  return res.data.length > 0 ? res.data[0].value : 1;
}

async function setCounter(name, value) {
  await initCloudBase();
  const res = await db.collection('counters').where({ name }).get();
  if (res.data.length > 0) {
    await db.collection('counters').where({ name }).update({ value });
  } else {
    await db.collection('counters').add({ name, value });
  }
}

async function nextId(prefix) {
  const value = await getCounter(prefix);
  await setCounter(prefix, value + 1);
  return `${prefix}_${value}`;
}

function getAvatarUrl(username) {
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
    bio: row.bio || '',
    createdAt: row.createdAt || row.created_at || new Date().toISOString(),
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
    summary: row.summary || '',
    author: author || row.author_id,
    coverImage: row.coverImage || row.cover_image || '',
    category: row.category || '其他',
    tags: row.tags || [],
    status: row.status || 'published',
    createdAt: row.createdAt || row.created_at || new Date().toISOString(),
    updatedAt: row.updatedAt || row.updated_at || new Date().toISOString(),
  };
}

export async function findUserByEmail(email) {
  await initCloudBase();
  const res = await db.collection('users').where({ email: email.toLowerCase().trim() }).get();
  return res.data.length > 0 ? rowToUser(res.data[0]) : null;
}

export async function findUserByUsername(username) {
  await initCloudBase();
  const res = await db.collection('users').where({ username: username.trim() }).get();
  return res.data.length > 0 ? rowToUser(res.data[0]) : null;
}

export async function findUserById(id) {
  await initCloudBase();
  const res = await db.collection('users').doc(id).get();
  return res.data ? rowToPublicUser(res.data) : null;
}

export async function createUser({ username, email, password }) {
  await initCloudBase();
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.trim();
  const now = new Date().toISOString();

  const user = {
    id: await nextId('user'),
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    avatar: getAvatarUrl(normalizedUsername),
    bio: '',
    createdAt: now,
  };

  await db.collection('users').add(user);

  return user;
}

export async function getPublishedArticles() {
  await initCloudBase();
  const res = await db.collection('articles').where({ status: 'published' }).orderBy('createdAt', 'desc').get();
  
  const articles = [];
  for (const article of res.data) {
    const author = await findUserById(article.author_id);
    articles.push(rowToArticle(article, author));
  }
  
  return articles;
}

export async function getArticleById(id) {
  await initCloudBase();
  const res = await db.collection('articles').doc(id).get();
  if (!res.data) return null;
  
  const author = await findUserById(res.data.author_id);
  return rowToArticle(res.data, author);
}

export async function getArticlesByAuthor(userId) {
  await initCloudBase();
  const res = await db.collection('articles').where({ author_id: userId }).orderBy('createdAt', 'desc').get();
  
  const articles = [];
  for (const article of res.data) {
    const author = await findUserById(userId);
    articles.push(rowToArticle(article, author));
  }
  
  return articles;
}

export async function createArticle({ title, content, summary, authorId, category, tags, status }) {
  await initCloudBase();
  const now = new Date().toISOString();
  const article = {
    id: await nextId('article'),
    title,
    content,
    summary,
    author_id: authorId,
    cover_image: '',
    category: category || '其他',
    tags: tags || [],
    status: status || 'published',
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('articles').add(article);
  return getArticleById(article.id);
}

export async function updateArticle(id, { title, content, summary, category, tags, status }) {
  await initCloudBase();
  const existing = await db.collection('articles').doc(id).get();
  if (!existing.data) return null;

  await db.collection('articles').doc(id).update({
    title,
    content,
    summary,
    category,
    tags: tags || [],
    status: status || 'published',
    updatedAt: new Date().toISOString(),
  });

  return getArticleById(id);
}

export async function deleteArticle(id) {
  await initCloudBase();
  await db.collection('articles').doc(id).remove();
  return true;
}

export async function getArticleAuthorId(id) {
  await initCloudBase();
  const res = await db.collection('articles').doc(id).get();
  return res.data ? res.data.author_id : null;
}

function rowToFeeRecord(row) {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    source: row.source || '',
    purpose: row.purpose || '',
    operator: row.operator,
    createdAt: row.createdAt || row.created_at || new Date().toISOString(),
  };
}

export async function getFeeRecords() {
  await initCloudBase();
  const res = await db.collection('fee_records').orderBy('createdAt', 'desc').get();
  return res.data.map(rowToFeeRecord);
}

export async function getFeeRecordById(id) {
  await initCloudBase();
  const res = await db.collection('fee_records').doc(id).get();
  return res.data ? rowToFeeRecord(res.data) : null;
}

export async function createFeeRecord({ type, amount, source, purpose, operator }) {
  await initCloudBase();
  const now = new Date().toISOString();
  const record = {
    id: await nextId('fee'),
    type,
    amount,
    source: source || '',
    purpose: purpose || '',
    operator,
    createdAt: now,
  };

  await db.collection('fee_records').add(record);
  return getFeeRecordById(record.id);
}

export async function deleteFeeRecord(id) {
  await initCloudBase();
  await db.collection('fee_records').doc(id).remove();
  return true;
}

export async function getFeeBalance() {
  await initCloudBase();
  const res = await db.collection('fee_records').get();
  
  let totalDeposit = 0;
  let totalWithdraw = 0;
  
  for (const record of res.data) {
    if (record.type === 'deposit') {
      totalDeposit += record.amount;
    } else if (record.type === 'withdraw') {
      totalWithdraw += record.amount;
    }
  }
  
  return {
    totalDeposit,
    totalWithdraw,
    balance: totalDeposit - totalWithdraw,
  };
}

export async function seedDemoData() {
  const demoUser = await findUserByEmail('demo@example.com');
  if (demoUser) return;

  const hashedPassword = await bcrypt.hash('demo123', 10);
  const user = await createUser({
    username: 'demo',
    email: 'demo@example.com',
    password: hashedPassword,
  });

  await db.collection('users').doc(user.id).update({ bio: '这是一个演示用户' });

  await createArticle({
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