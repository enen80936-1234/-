# 王耀庄年轻人 - Zeabur部署指南

## 部署步骤

### 方法1：通过 Zeabur 网页部署（推荐）

1. **访问 Zeabur**
   打开浏览器访问：https://zeabur.com

2. **登录/注册账号**
   - 使用 GitHub 账号登录（推荐）
   - 或使用邮箱注册

3. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub"

4. **连接 GitHub**
   - 如果还没连接，点击 "Connect GitHub Account"
   - 授权访问你的仓库

5. **选择项目**
   - 在列表中找到 `wangyaozhuang` 项目
   - 点击 "Deploy"

6. **等待部署完成**
   - 部署通常需要 1-3 分钟
   - 部署完成后会显示访问地址

7. **自定义域名（可选）**
   - 在项目设置中添加自定义域名

### 方法2：通过 Zeabur CLI 部署

```bash
# 安装 Zeabur CLI
npm install -g zeabur

# 登录
zeabur login

# 部署
zeabur deploy
```

## 部署后访问

部署成功后，你将获得一个类似 `https://wangyaozhuang-xxxx.zeabur.app` 的访问地址。

## 演示账号

- 邮箱: demo@example.com
- 密码: demo123

## 常见问题

### Q: 部署失败怎么办？
A: 检查控制台错误信息，常见问题包括：
- 依赖安装失败 - 检查 package.json
- 端口冲突 - 确保 server.js 中的端口配置正确

### Q: 如何更新网站？
A: 只需将代码推送到 GitHub，Zeabur 会自动检测并重新部署。

### Q: 如何绑定自定义域名？
A: 在 Zeabur 项目设置中，选择 "Domains" -> "Add Domain"，然后按照提示添加你的域名。
