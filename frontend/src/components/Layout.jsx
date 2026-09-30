import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, UserRound, LogOut, Package, Menu, X, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useState } from 'react'
import Logo from './Logo'

export default function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  function submitSearch(e) {
    e.preventDefault()
    navigate(query.trim() ? `/?search=${encodeURIComponent(query.trim())}` : '/')
    setMenuOpen(false)
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return <div className="app-shell">
    <header className="site-header">
      <div className="header-inner">
        <button className="mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu /></button>
        <Link to="/" className="logo-link"><Logo /></Link>
        <nav className="desktop-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Shop</NavLink>
          {isAuthenticated && <NavLink to="/manage" className={({ isActive }) => isActive ? 'active' : ''}><LayoutDashboard size={16} /> Manage</NavLink>}
        </nav>
        <form className="search-box" onSubmit={submitSearch}>
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, brands…" aria-label="Search products" />
        </form>
        <div className="header-actions">
          {isAuthenticated ? <>
            <span className="welcome desktop-only">{user?.email}</span>
            <button className="icon-btn" title="Logout" onClick={handleLogout}><LogOut size={19} /></button>
          </> : <Link className="account-link" to="/login"><UserRound size={19} /><span className="desktop-only">Sign in</span></Link>}
          <Link className="cart-btn" to="/cart" aria-label="Shopping cart"><ShoppingCart size={20} /><span>{count}</span></Link>
        </div>
      </div>
    </header>

    {menuOpen && <div className="mobile-menu-backdrop" onClick={() => setMenuOpen(false)}>
      <aside className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head"><Logo /><button className="icon-btn" onClick={() => setMenuOpen(false)}><X /></button></div>
        <form className="search-box drawer-search" onSubmit={submitSearch}><Search size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" /></form>
        <NavLink onClick={() => setMenuOpen(false)} to="/">Shop</NavLink>
        {isAuthenticated && <NavLink onClick={() => setMenuOpen(false)} to="/manage">Manage products</NavLink>}
        {isAuthenticated && <button className="drawer-logout" onClick={handleLogout}><LogOut size={17}/> Logout</button>}
      </aside>
    </div>}

    <main>{children}</main>
    <footer className="footer"><div><Logo /><p>Simple shopping, built around your store backend.</p></div><div><strong>Store</strong><Link to="/">All products</Link><Link to="/cart">Cart</Link></div><div><strong>Backend</strong><span>Spring Boot API</span><span>Secure JWT auth</span></div></footer>
  </div>
}
