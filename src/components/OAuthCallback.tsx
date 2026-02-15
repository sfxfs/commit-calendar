import { useEffect, useState } from 'react'
import axios from 'axios'

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Iv1.8e55d7dd8f6a9fff'

export default function OAuthCallback() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get code from URL search params
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const codeVerifier = localStorage.getItem('code_verifier')

    if (code && codeVerifier && !localStorage.getItem('github_token')) {
      const exchangeCode = async () => {
        try {
          const response = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
              client_id: GITHUB_CLIENT_ID,
              code,
              code_verifier: codeVerifier,
            },
            {
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            }
          )

          if (response.data.access_token) {
            const accessToken = response.data.access_token
            localStorage.setItem('github_token', accessToken)

            const userResponse = await axios.get('https://api.github.com/user', {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })

            localStorage.setItem('github_user', JSON.stringify(userResponse.data))

            // Clear code verifier
            localStorage.removeItem('code_verifier')

            // Redirect to home with HashRouter
            window.location.href = '/#/'
          } else {
            setError('No access token received')
          }
        } catch (err: unknown) {
          console.error('OAuth error:', err)
          setError(err instanceof Error ? err.message : 'OAuth failed')
        }
      }

      exchangeCode()
    }
  }, [])

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>OAuth Error</h2>
        <p style={{ color: '#f85149' }}>{error}</p>
        <a href="/#/login" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Back to Login
        </a>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Completing authentication...</p>
    </div>
  )
}
