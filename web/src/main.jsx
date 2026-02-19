import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import RootLayout from './routes/RootLayout.jsx'
import LoginPage from './routes/LoginPage.jsx'
import RegisterPage from './routes/RegisterPage.jsx'
import ProductsPage from './routes/ProductsPage.jsx'
import ProductDetailPage from './routes/ProductDetailPage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <ProductsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)