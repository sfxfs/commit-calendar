import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #30363d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.5em', margin: 0 }}>GitHub 贡献墙</h1>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/">日历</Link>
            <Link to="/generate">生成</Link>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img
                src={user.avatar_url}
                alt={user.login}
                style={{ width: 32, height: 32, borderRadius: '50%' }}
              />
              <span>{user.name || user.login}</span>
            </div>
          )}
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid #30363d' }}>
            退出
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
