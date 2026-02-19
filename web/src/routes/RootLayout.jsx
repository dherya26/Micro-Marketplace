import { Link, Outlet, useNavigate } from 'react-router-dom'

export default function RootLayout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div>
      <div className="container">
        <div className="header">
          <h1>Micro Marketplace</h1>
          <div className="spacer" />
          <div className="actions">
            {user ? (
              <>
                <span className="badge">{user.email}</span>
                <button onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  )
}