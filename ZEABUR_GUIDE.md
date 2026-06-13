# 王耀庄年轻人 - Zeabur 部署指南

## 🎯 部署步骤

### 第一步：推送代码到GitHub（如果没有）

```bash
# 在项目目录中初始化Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "准备部署到Zeabur"

# 创建GitHub仓库并推送
git remote add origin https://github.com/你的用户名/wangyaozhuang.git
git branch -M main
git push -u origin main
```

### 第二步：在Zeabur上部署

1. **访问 Zeabur**
   打开浏览器访问：**https://zeabur.com**

2. **登录账号**
   - 点击 "Sign in"
   - 使用 **GitHub** 账号登录（最简单）

3. **创建项目**
   - 点击 **"New Project"**
   - 选择 **"Deploy from GitHub"**

4. **连接GitHub**
   - 首次使用需要连接GitHub账号
   - 点击 "Connect GitHub Account"
   - 选择要授权的仓库（选择 `wangyaozhuang`）

5. **部署项目**
   - 在项目列表中找到 `wangyaozhuang`
   - 点击它开始部署
   - 等待部署完成（通常1-3分钟）

6. **获取访问地址**
   - 部署成功后，你会看到类似：
     ```
     https://wangyaozhuang-abc123.zeabur.app
     ```
   - 这就是你的网站访问地址！

## 📝 重要说明

### API配置
由于Zeabur部署的是Node.js服务器，它会：
- ✅ 同时提供前端页面
- ✅ 处理API请求
- ✅ 无需额外的API配置

### 数据存储
当前使用的是内存存储，重启后会重置数据。如果需要持久化存储，后续可以添加数据库。

## 🔑 演示账号
- 邮箱: `demo@example.com`
- 密码: `demo123`

## ❓ 常见问题

**Q: 部署失败怎么办？**
A: 检查GitHub仓库是否正确，代码是否有语法错误。常见问题：
- package.json 配置错误
- 依赖安装失败

**Q: 如何更新网站？**
A: 只需将新代码推送到GitHub，Zeabur会自动重新部署。

**Q: 可以绑定自己的域名吗？**
A: 可以！在项目设置中点击 "Domains" -> "Add Domain"，然后按照提示添加你的域名。

---

**准备好了吗？开始部署吧！** 🚀
