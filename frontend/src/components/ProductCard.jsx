import { Link } from 'react-router-dom'
import { ShoppingCart, ArrowUpRight, PackageCheck } from 'lucide-react'
import { formatPrice } from '../utils/format'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { add } = useCart()
  const out = !product.productAvailable || Number(product.stockQuantity) <= 0
  return <article className="product-card">
    <Link to={`/product/${product.id}`} className="product-image-wrap">
      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" /> : <div className="image-placeholder"><PackageCheck /></div>}
      <span className="category-chip">{product.category || 'Product'}</span>
    </Link>
    <div className="product-card-body">
      <p className="eyebrow">{product.brand || 'Sambhav Store'}</p>
      <Link to={`/product/${product.id}`} className="product-title">{product.name}</Link>
      <p className="product-desc">{product.description || 'Quality product from Sambhav Store.'}</p>
      <div className="card-bottom"><strong>{formatPrice(product.price)}</strong><span className={out ? 'stock out' : 'stock'}>{out ? 'Out of stock' : `${product.stockQuantity} left`}</span></div>
      <div className="card-actions"><Link to={`/product/${product.id}`} className="text-link">View details <ArrowUpRight size={15}/></Link><button className="add-btn" disabled={out} onClick={() => add(product)}><ShoppingCart size={16}/>{out ? 'Unavailable' : 'Add'}</button></div>
    </div>
  </article>
}
