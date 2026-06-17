# 王耀庄年轻人 - 部署指南（中国大陆可用）

## 为什么不要继续用 Vercel？

Vercel 的服务器主要在海外，国内用户经常出现：

- 浏览器报错 `-118`（连接超时）
- 登录/注册请求失败
- 即使能打开页面，API 也经常连不上

另外，Vercel 的 Serverless 函数**无法持久保存用户数据**（内存会清空），不适合做多用户登录。

**推荐改用 Zeabur 部署**，并选择 **香港 / 台湾** 区域，国内访问会稳定很多。

---

## 推荐部署：Zeabur（国内访问友好）

### 1. 准备

- GitHub 账号
- [Zeabur](https://zeabur.com) 账号（可用 GitHub 登录）

### 2. 部署步骤

1. 将最新代码推送到 GitHub
2. 打开 [Zeabur 控制台](https://zeabur.com)
3. 点击 **New Project** → **Deploy from GitHub**
4. 选择本项目仓库
5. **Region（区域）选择 Hong Kong 或 Taiwan**（重要！）
6. 等待自动构建完成（会执行 `npm run build`，然后 `node server.js` 启动）

### 3. 配置持久化存储（重要）

用户和文章数据保存在 SQLite 数据库文件中。请在 Zeabur 为服务挂载持久化卷：

1. 进入你的服务 → **Volumes**
2. 添加 Volume，挂载路径设为 `/data`
3. 在环境变量中添加：`DATA_DIR=/data`

不配置卷的话，重启服务后新注册用户可能丢失。

### 4. 环境变量（可选）

| 变量名 | 说明 |
|--------|------|
| `DATA_DIR` | 数据库目录，推荐 `/data` |
| `JWT_SECRET` | 登录 token 密钥，生产环境请改成随机长字符串 |
| `PORT` | 端口，Zeabur 会自动设置，无需手动改 |

### 5. 自定义域名（可选）

在 Zeabur 项目 → **Domains** 添加你的域名，按提示配置 DNS。

若域名在国内备案，可配合国内 CDN 进一步加速。

---

## 本地开发

```bash
npm install
npm run dev
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:5000（由 Vite 代理 `/api`）

---

## 演示账号

- 邮箱：`demo@example.com`
- 密码：`demo123`

首次启动会自动创建演示账号和欢迎文章。

---

## 从 Vercel 迁移

1. 在 Zeabur 按上面步骤重新部署
2. 获得新的 Zeabur 访问地址
3. 把域名从 Vercel 改绑到 Zeabur（或在 Zeabur 使用新域名）
4. 通知朋友使用新地址注册账号（Vercel 上的旧账号无法迁移，因为数据从未持久化保存）

---

## 常见问题

### Q: 朋友还是登录不了？

1. 确认网站已部署在 Zeabur（不是 Vercel）
2. 确认区域选的是香港/台湾
3. 让朋友先注册新账号，再用新账号登录
4. 打开浏览器 F12 → Network，看 `/api/auth/login` 是否返回 200

### Q: 注册成功但重启后账号没了？

说明没有挂载持久化卷，请按上面「配置持久化存储」步骤操作。

### Q: 还能用 Vercel 吗？

不建议。Vercel 在国内不稳定，且 Serverless 不适合本项目的 SQLite 数据库方案。
