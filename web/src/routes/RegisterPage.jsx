import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/auth/register', { email, password, name })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Register failed')
    }
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={submit} style={{maxWidth: 420}}>
        <label>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane" />
        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" />
        {error && <div className="badge" style={{color:'#fca5a5', borderColor:'#7f1d1d'}}>{error}</div>}
        <div className="row">
          <div className="spacer" />
          <button type="submit">Sign up</button>
        </div>
        <div className="row" style={{justifyContent:'space-between'}}>
          <span className="muted">Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  )
}