import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Truck, Sparkles, SearchX } from 'lucide-react'
import { productApi, getImageUrl } from '../services/api'
import ProductCard from '../components/ProductCard'
import { getErrorMessage } from '../utils/errors'

function normalize(p) { return { ...p, imageUrl: getImageUrl(p) } }

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const query = searchParams.get('search') || ''
  const [category, setCategory] = useState('All')

  useEffect(() => {
    let alive = true
    setLoading(true); setError('')
    const request = query ? productApi.search(query) : productApi.list()
    request.then((res) => { if (alive) setProducts((res.data || []).map(normalize)) })
      .catch((err) => { if (alive) setError(getErrorMessage(err, 'Unable to load products.')) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [query])

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category).filter(Boolean))], [products])
  const visible = category === 'All' ? products : products.filter((p) => p.category === category)

  return <>
    <section className="hero">
      <div className="hero-content">
        <span className="hero-kicker"><Sparkles size={15}/> Sambhav Store</span>
        <h1>Everyday products.<br/><em>Made easy.</em></h1>
        <p>Explore the catalogue, discover something useful, and get it into your cart in seconds.</p>
        <div className="hero-buttons"><a href="#products" className="primary-btn">Explore products <ArrowRight size={17}/></a><Link to="/cart" className="secondary-btn hero-secondary">View cart</Link></div>
      </div>
      <div className="hero-orb"><div className="hero-card"><span>Curated for you</span><strong>{products.length || '—'}</strong><small>products available</small></div></div>
    </section>

    <section className="trust-strip"><div><ShieldCheck/><span><strong>Secure access</strong><small>JWT authentication</small></span></div><div><Truck/><span><strong>Simple shopping</strong><small>Fast cart experience</small></span></div><div><Sparkles/><span><strong>Fresh catalogue</strong><small>Live from your backend</small></span></div></section>

    <section id="products" className="catalogue container">
      <div className="section-heading"><div><p className="eyebrow">THE CATALOGUE</p><h2>{query ? `Results for “${query}”` : 'Find your next favourite'}</h2></div><span className="result-count">{visible.length} items</span></div>
      {categories.length > 1 && <div className="filter-row">{categories.map((item) => <button key={item} className={category === item ? 'filter active' : 'filter'} onClick={() => setCategory(item)}>{item}</button>)}</div>}
      {loading && <div className="product-grid">{Array.from({ length: 6 }).map((_, i) => <div className="skeleton-card" key={i}><div className="skeleton image"/><div className="skeleton line"/><div className="skeleton line short"/><div className="skeleton line tiny"/></div>)}</div>}
      {!loading && error && <div className="state-card error-state"><strong>Couldn’t load the catalogue</strong><p>{error}</p><button className="secondary-btn" onClick={() => setSearchParams({})}>Try again</button></div>}
      {!loading && !error && visible.length === 0 && <div className="state-card"><SearchX size={35}/><strong>No products found</strong><p>Try another search or clear the filters.</p><button className="secondary-btn" onClick={() => { setCategory('All'); setSearchParams({}) }}>Clear search</button></div>}
      {!loading && !error && visible.length > 0 && <div className="product-grid">{visible.map((product) => <ProductCard key={product.id} product={product}/>)}</div>}
    </section>
  </>
}
