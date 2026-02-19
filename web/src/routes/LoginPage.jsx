import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function LoginPage() {
  const [email, setEmail] = useState('alice@example.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit} style={{maxWidth: 420}}>
        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" />
        {error && <div className="badge" style={{color:'#fca5a5', borderColor:'#7f1d1d'}}>{error}</div>}
        <div className="row">
          <div className="spacer" />
          <button type="submit">Sign in</button>
        </div>
        <div className="row" style={{justifyContent:'space-between'}}>
          <span className="muted">No account?</span>
          <Link to="/register">Create one</Link>
        </div>
      </form>
    </div>
  )
}