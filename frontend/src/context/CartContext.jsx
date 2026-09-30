import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const KEY = 'sambhav-store-cart'

function readCart() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items])

  const value = useMemo(() => ({
    items,
    add(product) {
      setItems((current) => {
        const existing = current.find((item) => item.id === product.id)
        if (existing) return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        return [...current, { id: product.id, name: product.name, price: Number(product.price), image: product.imageUrl, quantity: 1, stockQuantity: product.stockQuantity }]
      })
    },
    update(id, quantity) {
      setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stockQuantity || quantity)) } : item))
    },
    remove(id) { setItems((current) => current.filter((item) => item.id !== id)) },
    clear() { setItems([]) },
  }), [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() { return useContext(CartContext) }
