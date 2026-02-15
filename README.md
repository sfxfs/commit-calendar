# commit-calendar

自定义你的 GitHub 贡献墙 | Customize your GitHub contribution wall

## 功能特点

- GitHub OAuth 登录（需要 `repo` 写权限）
- 查看 GitHub 贡献日历（热力图形式）
- 选择预设图案或自定义图案
- 自动生成 commits 来展示自定义贡献图案

## 技术栈

- React 19 + TypeScript
- Vite
- React Router (HashRouter)
- date-fns
- Axios

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/sfxfs/commit-calendar.git
cd commit-calendar
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 GitHub OAuth

1. 前往 [GitHub Developer Settings](https://github.com/settings/developers) 创建 OAuth App
2. 填写信息：
   - Application name: Commit Calendar
   - Homepage URL: `https://你的用户名.github.io/commit-calendar`
   - Authorization callback URL: `https://你的用户名.github.io/commit-calendar/#/callback`
3. 获取 Client ID
4. 添加 Secrets：
   - 前往仓库 Settings → Secrets and variables → Actions
   - 新建 secret: `VITE_GITHUB_CLIENT_ID`

### 4. 启用 GitHub Pages

1. 前往仓库 Settings → Pages
2. Source 选择 "Deploy from a branch"
3. Branch 选择 `gh-pages`，目录选择 `/ (root)`

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 6. 构建生产版本

```bash
npm run build
```

## 本地开发 OAuth 配置

本地开发时需要单独创建 OAuth App 或使用开发配置：

| 配置项 | 值 |
|--------|-----|
| Homepage URL | http://localhost:5173 |
| Authorization callback URL | http://localhost:5173/#/callback |

创建 `.env.local` 文件：

```env
VITE_GITHUB_CLIENT_ID=你的Client_ID
```

## 使用说明

### 登录

1. 点击"使用 GitHub 登录"按钮
2. 授权应用访问你的仓库（需要 `repo` 权限）

### 查看贡献日历

登录后自动显示过去一年的贡献热力图，包括：
- 总贡献次数
- 活跃天数
- 最高单日贡献

### 生成贡献图案

1. 点击顶部导航"生成"
2. 选择目标仓库（需要有写权限）
3. 选择图案（预设图案或自定义绘制）
4. 设置开始日期
5. 点击"开始生成"

### 注意事项

- 批量创建 commits 可能会触发 GitHub 速率限制
- 建议使用测试仓库进行操作
- 每个图案最多可生成 64 个 commits
- 使用 HashRouter，URL 包含 `#` 符号

## 项目结构

```
src/
├── main.tsx              # 入口文件
├── App.tsx              # 路由配置 (HashRouter)
├── index.css            # 全局样式
├── auth/
│   └── AuthContext.tsx  # OAuth 认证上下文
├── api/
│   └── github.ts        # GitHub API 调用
└── components/
    ├── Login.tsx              # 登录页面
    ├── OAuthCallback.tsx       # OAuth 回调处理
    ├── Layout.tsx             # 页面布局
    ├── Dashboard.tsx          # 贡献日历页面
    ├── ContributionCalendar.tsx  # 贡献热力图组件
    ├── PatternDesigner.tsx    # 图案设计器
    └── CommitGenerator.tsx    # Commit 生成器

.github/
└── workflows/
    └── deploy.yml         # GitHub Actions 自动部署
```

## 许可证

MIT
