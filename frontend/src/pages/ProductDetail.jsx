import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, ShoppingCart, Package, CalendarDays, Tag, BadgeIndianRupee } from 'lucide-react'
import { getImageUrl, productApi } from '../services/api'
import { useCart } from '../context/CartContext'
import { formatDate, formatPrice } from '../utils/format'
import { getErrorMessage } from '../utils/errors'

export default function ProductDetail() {
  const { id } = useParams(); const navigate = useNavigate(); const { add } = useCart()
  const [product, setProduct] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [qty, setQty] = useState(1)
  useEffect(() => { productApi.get(id).then((res) => setProduct({ ...res.data, imageUrl: getImageUrl(res.data) })).catch((err) => setError(getErrorMessage(err, 'Product not found.'))).finally(() => setLoading(false)) }, [id])
  if (loading) return <div className="page-loader"><div className="spinner"/><p>Loading product…</p></div>
  if (error || !product) return <div className="container state-page"><div className="state-card"><strong>Product unavailable</strong><p>{error || 'This product could not be found.'}</p><button className="secondary-btn" onClick={() => navigate('/')}>Back to shop</button></div></div>
  const out = !product.productAvailable || product.stockQuantity <= 0
  function addToCart() { for (let i = 0; i < qty; i++) add(product) }
  return <div className="container detail-page"><Link className="back-link" to="/"><ArrowLeft size={16}/> Back to shop</Link><div className="detail-layout"><div className="detail-image">{product.imageUrl ? <img src={product.imageUrl} alt={product.name}/> : <Package size={80}/>}</div><div className="detail-info"><p className="eyebrow">{product.brand || 'SAMBHAV STORE'} · {product.category || 'PRODUCT'}</p><h1>{product.name}</h1><p className="detail-price">{formatPrice(product.price)}</p><p className="detail-description">{product.description || 'No description available for this product.'}</p><div className="spec-list"><div><Tag/><span>Category<strong>{product.category || '—'}</strong></span></div><div><CalendarDays/><span>Released<strong>{formatDate(product.releaseDate)}</strong></span></div><div><Package/><span>Availability<strong>{out ? 'Out of stock' : `${product.stockQuantity} in stock`}</strong></span></div></div>{!out && <div className="purchase-row"><div className="qty"><button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16}/></button><strong>{qty}</strong><button onClick={() => setQty(Math.min(product.stockQuantity, qty + 1))}><Plus size={16}/></button></div><button className="primary-btn" onClick={addToCart}><ShoppingCart size={18}/> Add {qty} to cart</button></div>}<div className="secure-note"><BadgeIndianRupee size={18}/><span>Live product data is served by your Spring Boot backend.</span></div></div></div></div>
}
