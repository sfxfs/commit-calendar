import { useAuth } from '../auth/AuthContext'
import { AuthProvider } from '../auth/AuthContext'
import OAuthCallback from './OAuthCallback'

function LoginContent() {
  const { login, isAuthenticated } = useAuth()

  if (isAuthenticated) {
    window.location.href = '/'
    return null
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }}>
      <h1>GitHub 贡献墙</h1>
      <p style={{ color: '#8b949e', marginBottom: '2rem' }}>
        自定义你的 GitHub 贡献日历，让你的贡献墙更有意义
      </p>
      <button onClick={login} style={{ padding: '1rem 2rem', fontSize: '1.1em' }}>
        使用 GitHub 登录
      </button>
      <p style={{ marginTop: '1rem', fontSize: '0.9em', color: '#6e7681' }}>
        需要 repo 写权限来创建 commits
      </p>
    </div>
  )
}

export default function Login() {
  return (
    <AuthProvider>
      <OAuthCallback />
      <LoginContent />
    </AuthProvider>
  )
}
