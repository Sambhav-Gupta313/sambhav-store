import { useEffect, useState } from 'react'

const empty = { name:'', description:'', brand:'', price:'', category:'', releaseDate:'', productAvailable:true, stockQuantity:0 }

export default function ProductForm({ initial, onSubmit, loading, onCancel }) {
  const [form, setForm] = useState(empty)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (initial) {
      setForm({ ...empty, ...initial, releaseDate: initial.releaseDate ? String(initial.releaseDate).slice(0, 10) : '' })
      setPreview(initial.imageUrl || '')
    } else {
      setForm(empty); setPreview(''); setFile(null)
    }
  }, [initial])

  function change(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function pickFile(e) {
    const selected = e.target.files?.[0]
    setFile(selected || null)
    if (selected) setPreview(URL.createObjectURL(selected))
  }

  async function submit(e) {
    e.preventDefault()
    if (!initial && !file) return
    await onSubmit({ ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity), releaseDate: form.releaseDate || null }, file)
  }

  return <form className="product-form" onSubmit={submit}>
    <div className="form-grid">
      <label>Name<input name="name" value={form.name} onChange={change} required /></label>
      <label>Brand<input name="brand" value={form.brand} onChange={change} /></label>
      <label>Price (₹)<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={change} required /></label>
      <label>Category<input name="category" value={form.category} onChange={change} /></label>
      <label>Stock quantity<input name="stockQuantity" type="number" min="0" value={form.stockQuantity} onChange={change} required /></label>
      <label>Release date<input name="releaseDate" type="date" value={form.releaseDate} onChange={change} /></label>
    </div>
    <label>Description<textarea name="description" rows="4" value={form.description} onChange={change} /></label>
    <div className="upload-row">
      <label className="file-field">Product image<input type="file" accept="image/*" onChange={pickFile} required={!initial} /></label>
      {preview && <img className="form-preview" src={preview} alt="Preview" />}
    </div>
    <label className="check"><input type="checkbox" name="productAvailable" checked={form.productAvailable} onChange={change} /> Product is available</label>
    <div className="form-actions"><button type="button" className="secondary-btn" onClick={onCancel}>Cancel</button><button className="primary-btn" disabled={loading}>{loading ? 'Saving…' : initial ? 'Update product' : 'Create product'}</button></div>
  </form>
}
