import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function ProductsPage() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(9)
  const [q, setQ] = useState('')
  const token = localStorage.getItem('token')

  async function load() {
    // Fetch products first
    const res = await api.get('/products', { params: { page, limit, q } })
    let nextItems = res.data.items
    setTotal(res.data.total)

    // If logged in, fetch favorites and mark them in the list
    const currentToken = localStorage.getItem('token')
    if (currentToken) {
      try {
        const headers = { Authorization: `Bearer ${currentToken}` }
        const favRes = await api.get('/me/favorites', { headers })
        const favIds = new Set(favRes.data.map(p => p.id))
        nextItems = nextItems.map(p => favIds.has(p.id) ? { ...p, _fav: true } : p)
      } catch (_) {
        // Silently ignore favorites fetch errors to not block product rendering
      }
    }

    setItems(nextItems)
  }

  useEffect(() => { load() }, [page, limit, q])

  const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  async function toggleFav(productId, exists) {
    if (!token) return alert('Please login to favorite')
    const headers = { Authorization: `Bearer ${token}` }
    if (exists) {
      await api.delete(`/favorites/${productId}`, { headers })
    } else {
      await api.post(`/favorites/${productId}`, null, { headers })
    }
    // micro-interaction: optimistic UI by toggling class
    setItems(items => items.map(p => p.id === productId ? { ...p, _fav: !exists } : p))
  }

  return (
    <div>
      <div className="row" style={{marginBottom:16}}>
        <input placeholder="Search products" value={q} onChange={e => { setPage(1); setQ(e.target.value) }} style={{flex:1}} />
        <span className="badge">{total} items</span>
      </div>
      <div className="grid">
        {items.map(p => (
          <div className="card" key={p.id}>
            <img src={p.image} alt="" />
            <div className="card-body">
              <div className="row" style={{justifyContent:'space-between'}}>
                <strong>{p.title}</strong>
                <span>${p.price.toFixed(2)}</span>
              </div>
              <div className="row" style={{justifyContent:'space-between'}}>
                <Link to={`/products/${p.id}`}>View</Link>
                <button className={`fav-btn ${p._fav ? 'active' : ''}`} onClick={() => toggleFav(p.id, !!p._fav)}>❤</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button disabled={page<=1} onClick={() => setPage(p => p-1)}>Prev</button>
        <span className="badge">Page {page} / {pages}</span>
        <button disabled={page>=pages} onClick={() => setPage(p => p+1)}>Next</button>
      </div>
    </div>
  )
}