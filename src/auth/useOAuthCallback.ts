import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Iv1.8e55d7dd8f6a9fff'
const GITHUB_CLIENT_SECRET = import.meta.env.VITE_GITHUB_CLIENT_SECRET || ''

export function useOAuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const codeVerifier = localStorage.getItem('code_verifier')

      if (code && codeVerifier) {
        try {
          // In production, this should be done server-side
          // For demo, we'll use a personal access token flow or device flow
          // The code verifier is for PKCE but GitHub requires client_secret for web flow

          // For now, we'll simulate by storing code and using a different approach
          // In a real app, you'd have a backend to exchange the code

          // Let's use the token exchange via proxy or direct
          const response = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
              client_id: GITHUB_CLIENT_ID,
              client_secret: GITHUB_CLIENT_SECRET,
              code,
              code_verifier: codeVerifier,
            },
            {
              headers: {
                Accept: 'application/json',
              },
            }
          )

          const accessToken = response.data.access_token

          if (accessToken) {
            localStorage.setItem('github_token', accessToken)

            // Fetch user info
            const userResponse = await axios.get('https://api.github.com/user', {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })

            localStorage.setItem('github_user', JSON.stringify(userResponse.data))

            // Update auth state
            window.location.href = '/'
          }
        } catch (error) {
          console.error('OAuth callback error:', error)
          navigate('/login')
        }
      }
    }

    handleCallback()
  }, [navigate])
}
