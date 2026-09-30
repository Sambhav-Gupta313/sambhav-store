import { Navigate, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Auth from './pages/Auth'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import ManageProducts from './pages/ManageProducts'

export default function App() {
  return <Layout><Routes>
    <Route path="/login" element={<Auth mode="login" />} />
    <Route path="/register" element={<Auth mode="register" />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/manage" element={<ManageProducts />} />
    </Route>
    <Route path="/cart" element={<Cart />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Layout>
}
