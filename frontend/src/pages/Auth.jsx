import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/errors'

export default function Auth({ mode = 'login' }) {
  const isLogin = mode === 'login'
  const { login, register } = useAuth()
  const navigate = useNavigate(); const location = useLocation()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [show, setShow] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState('')

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError(''); setSuccess('')
    try {
      if (isLogin) { await login(email.trim(), password); navigate(location.state?.from || '/', { replace: true }) }
      else { await register(email.trim(), password); setSuccess('Registration successful. You can now sign in.'); setTimeout(() => navigate('/login'), 700) }
    } catch (err) { setError(getErrorMessage(err, isLogin ? 'Invalid email or password.' : 'Could not create your account.')) }
    finally { setLoading(false) }
  }

  return <div className="auth-page"><div className="auth-art"><div className="auth-art-content"><p className="eyebrow">SAMBHAV STORE</p><h1>Shopping that<br/><em>feels simple.</em></h1><p>A clean storefront connected directly to your Spring Boot commerce API.</p><div className="auth-benefit"><ShieldCheck/><span><strong>Secure session design</strong><small>Access token in memory + HttpOnly refresh cookie</small></span></div></div></div><div className="auth-panel"><div className="auth-card"><div className="mobile-auth-logo"><Link to="/">Sambhav<span>Store</span></Link></div><p className="eyebrow">YOUR ACCOUNT</p><h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2><p className="muted">{isLogin ? 'Sign in to continue shopping.' : 'Register with your email and password.'}</p>
    <form onSubmit={submit} className="auth-form"><label>Email address<div className="input-icon"><Mail size={18}/><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div></label><label>Password<div className="input-icon"><LockKeyhole size={18}/><input type={show ? 'text' : 'password'} autoComplete={isLogin ? 'current-password' : 'new-password'} minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /><button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>{error && <div className="form-error">{error}</div>}{success && <div className="form-success">{success}</div>}<button className="primary-btn full" disabled={loading}>{loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}</button></form>
    <p className="auth-switch">{isLogin ? 'New to Sambhav Store?' : 'Already have an account?'} <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create account' : 'Sign in'}</Link></p>
  </div></div></div>
}
