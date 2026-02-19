import axios from 'axios'

const api = axios.create({
  // In dev, Vite proxy handles '/api' -> backend. In production, set VITE_API_BASE_URL to your backend URL.
  baseURL: import.meta.env?.VITE_API_BASE_URL || '/api',
})

export default api