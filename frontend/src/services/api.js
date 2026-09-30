import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

let accessToken = null
let refreshPromise = null
let onAuthFailure = null

export function setAccessToken(token) {
  accessToken = token || null
}

export function getAccessToken() {
  return accessToken
}

export function setAuthFailureHandler(handler) {
  onAuthFailure = handler
}

function readCookie(name) {
  const encoded = encodeURIComponent(name)
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${encoded}=`) || row.startsWith(`${name}=`))
  if (!match) return null
  return decodeURIComponent(match.substring(match.indexOf('=') + 1))
}

function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1]
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(decodeURIComponent(atob(normalized).split('').map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`).join('')))
  } catch {
    return null
  }
}

export function getAccessTokenExpiry(token = accessToken) {
  return decodeJwtPayload(token)?.exp ? Number(decodeJwtPayload(token).exp) * 1000 : null
}

export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise

  refreshPromise = api.post('/auth/refresh')
    .then((response) => {
      setAccessToken(response.data)
      return response.data
    })
    .catch((error) => {
      setAccessToken(null)
      throw error
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  const method = (config.method || 'get').toLowerCase()
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const csrf = readCookie('XSRF-TOKEN')
    if (csrf) config.headers['X-XSRF-TOKEN'] = csrf
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const url = original?.url || ''
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh') || url.includes('/auth/logout')

    if (status === 401 && original && !original._retry && !isAuthRoute && accessToken) {
      original._retry = true
      try {
        await refreshAccessToken()
        return api(original)
      } catch (refreshError) {
        onAuthFailure?.()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: async (payload) => {
    const response = await api.post('/auth/login', payload)
    setAccessToken(response.data)
    return response
  },
  refresh: refreshAccessToken,
  logout: async () => {
    try {
      return await api.post('/auth/logout')
    } finally {
      setAccessToken(null)
    }
  },
}

export const productApi = {
  list: () => api.get('/products'),
  get: (id) => api.get(`/product/${id}`),
  search: (keyword) => api.get('/products/search', { params: { keyword } }),
  create: (product, imageFile) => {
    const form = new FormData()
    form.append('product', new Blob([JSON.stringify(product)], { type: 'application/json' }))
    form.append('imageFile', imageFile)
    return api.post('/product', form)
  },
  update: (id, product, imageFile) => {
    const form = new FormData()
    form.append('product', new Blob([JSON.stringify(product)], { type: 'application/json' }))
    if (imageFile) form.append('imageFile', imageFile)
    return api.put(`/product/${id}`, form)
  },
  remove: (id) => api.delete(`/product/${id}`),
}

export function getImageUrl(product) {
  if (!product) return null
  if (product.imageData && product.imageType) {
    return `data:${product.imageType};base64,${product.imageData}`
  }
  return `${API_BASE_URL}/product/${product.id}/image`
}
