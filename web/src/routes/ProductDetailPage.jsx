import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const token = localStorage.getItem('token')

  useEffect(() => {
    api.get(`/products/${id}`).then(res => setProduct(res.data))
  }, [id])

  if (!product) return <div>Loading...</div>

  async function fav() {
    if (!token) return alert('Please login to favorite')
    const headers = { Authorization: `Bearer ${token}` }
    try {
      await api.post(`/favorites/${product.id}`, null, { headers })
      alert('Added to favorites')
    } catch {
      alert('Already in favorites')
    }
  }

  return (
    <div className="card" style={{maxWidth: 720, margin:'0 auto'}}>
      <img src={product.image} alt="" style={{height: 320}} />
      <div className="card-body">
        <h2>{product.title}</h2>
        <p>{product.description}</p>
        <div className="row" style={{justifyContent:'space-between'}}>
          <strong>${product.price.toFixed(2)}</strong>
          <button onClick={fav}>❤ Favorite</button>
        </div>
      </div>
    </div>
  )
}