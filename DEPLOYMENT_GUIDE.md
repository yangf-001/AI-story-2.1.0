# AI故事生成器部署指南（GitHub Pages）

本指南将帮助您将 AI 故事生成器应用部署到 GitHub Pages，实现平板离线访问功能。

## 前提条件

- GitHub 账号
- Git 安装在您的电脑上
- 基本的 Git 操作知识

## 部署步骤

### 步骤 1：创建 GitHub 仓库

1. 登录您的 GitHub 账号
2. 点击右上角的 "+", 选择 "New repository"
3. 填写仓库信息：
   - Repository name: 例如 "ai-story-generator"
   - Description: 可选，描述您的应用
   - 选择 "Public"（公开）
   - 勾选 "Add a README file"
   - 点击 "Create repository"

### 步骤 2：克隆仓库到本地

1. 复制仓库的 SSH 或 HTTPS URL
2. 在命令行中执行：
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

### 步骤 3：复制应用文件

1. 将 `c:\Users\yf217\Desktop\aichat\开发\10.0` 目录中的所有文件复制到克隆的仓库目录中
2. 确保所有文件都已复制，包括：
   - HTML 文件
   - CSS 文件
   - JavaScript 文件
   - manifest.json
   - service-worker.js

### 步骤 4：配置 GitHub Pages

1. 打开仓库的 Settings 页面
2. 滚动到 "GitHub Pages" 部分
3. 在 "Source" 下拉菜单中选择：
   - 分支：`main` 或 `master`
   - 目录：`/(root)`
4. 点击 "Save"
5. 等待几分钟，GitHub 会构建并部署您的应用

### 步骤 5：获取部署 URL

1. 部署完成后，在 "GitHub Pages" 部分会显示您的应用 URL
2. 例如：`https://<username>.github.io/<repository-name>`

### 步骤 6：在平板上访问应用

1. 在平板的浏览器中输入部署 URL
2. 首次访问时，确保平板连接到网络
3. 浏览应用的所有页面，让 Service Worker 缓存所有必要的资源
4. 点击浏览器的 "添加到主屏幕" 或 "安装应用" 选项
5. 现在应用已经安装到平板上，可以离线使用

## 验证离线功能

1. 打开应用并确保所有页面都已加载
2. 断开平板的网络连接
3. 从主屏幕打开应用
4. 尝试创建一个故事，确认应用可以正常运行
5. 重新连接网络，确认数据同步正常

## 故障排除

### 404 错误
- 确保您选择了正确的分支和目录
- 等待几分钟让 GitHub Pages 完成部署
- 检查文件路径是否正确

### 离线功能不工作
- 确保 Service Worker 正确注册
- 首次访问时确保网络连接正常
- 检查浏览器控制台是否有错误信息

### API 调用失败
- 确保您在 API 配置页面设置了正确的 API 密钥
- 注意：API 调用需要网络连接，离线时无法生成新内容

## 维护

- 当您修改应用后，只需将更改推送到 GitHub 仓库
- GitHub Pages 会自动重新部署应用
- 平板上的应用会在下次联网时更新

## 注意事项

- GitHub Pages 是静态网站托管服务，不支持服务器端代码
- 应用的所有数据存储在浏览器的 localStorage 中
- API 调用需要网络连接，离线时只能查看已生成的内容
- GitHub Pages 有带宽限制，对于大型应用可能不够用

如果您遇到任何问题，请参考 GitHub Pages 官方文档或联系 GitHub 支持。