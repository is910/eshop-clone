// AdminDashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ id: '', name: '', price: '', category: '', stock: '', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [toasts, setToasts] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const toastId = useRef(0);

  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const fetchCatalog = useCallback(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        addToast('Failed to load products', 'error');
      });
  }, [addToast]);

  useEffect(() => { fetchCatalog(); }, [fetchCatalog]);

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (Number(p.price) * Number(p.stock || 0)), 0);
  const lowStockCount = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).length;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleInputChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('authToken');
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `http://localhost:5000/api/products/${form.id}`
      : 'http://localhost:5000/api/products';

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('category', form.category);
    formData.append('stock', form.stock);
    formData.append('description', form.description);
    formData.append('authToken', token);

    if (selectedFile) {
      formData.append('productImage', selectedFile);
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': token },
        body: formData
      });

      if (res.ok) {
        setForm({ id: '', name: '', price: '', category: '', stock: '', description: '' });
        setSelectedFile(null);
        setFilePreview(null);
        const fileInput = document.getElementById('productImageInput');
        if (fileInput) fileInput.value = '';
        setIsEditing(false);
        fetchCatalog();
        addToast(isEditing ? 'Product updated successfully' : 'Product added successfully', 'success');
      } else {
        addToast('Action rejected by the server', 'error');
      }
    } catch {
      addToast('Network error — please try again', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (prod) => {
    setIsEditing(true);
    setForm({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      category: prod.category,
      stock: prod.stock,
      description: prod.description || ''
    });
    setSelectedFile(null);
    setFilePreview(null);
    document.querySelector('.admin__form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setForm({ id: '', name: '', price: '', category: '', stock: '', description: '' });
    setSelectedFile(null);
    setFilePreview(null);
    const fileInput = document.getElementById('productImageInput');
    if (fileInput) fileInput.value = '';
  };

  const handleDelete = (p) => {
    if (deleteConfirm === p.id) {
      const token = localStorage.getItem('authToken');
      fetch(`http://localhost:5000/api/products/${p.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      }).then(res => {
        if (res.ok) {
          fetchCatalog();
          addToast('Product deleted', 'success');
        } else {
          addToast('Failed to delete product', 'error');
        }
      }).catch(() => addToast('Network error', 'error'));
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(p.id);
      setTimeout(() => {
        setDeleteConfirm(prev => prev === p.id ? null : prev);
      }, 3000);
    }
  };

  const getStockStatus = (stock) => {
    const s = Number(stock);
    if (s <= 0) return 'out';
    if (s <= 5) return 'low';
    return 'ok';
  };

  const getProductImage = (p) => {
    return p.image || p.imageUrl || p.productImage || null;
  };

  return (
    <div className="admin__container">
      {/* Toast Notifications */}
      <div className="admin__toasts" aria-live="polite">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`admin__toast admin__toast--${t.type} animate-slide-in-right`}
            onClick={() => removeToast(t.id)}
            role="alert"
          >
            <span className="admin__toast-icon">
              {t.type === 'success' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              )}
            </span>
            <span className="admin__toast-msg">{t.message}</span>
            <button className="admin__toast-close" aria-label="Dismiss notification">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="admin__header animate-fade-in-up">
        <div className="admin__header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <div>
          <h1 className="admin__title">Admin Dashboard</h1>
          <p className="admin__subtitle">Manage your product inventory</p>
        </div>
      </header>

      {/* Stats Row */}
      <section className="admin__stats" aria-label="Inventory statistics">
        <div className="admin__stat animate-fade-in-up delay-1">
          <div className="admin__stat-icon admin__stat-icon--blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div className="admin__stat-info">
            <span className="admin__stat-value">{totalProducts}</span>
            <span className="admin__stat-label">Total Products</span>
          </div>
        </div>
        <div className="admin__stat animate-fade-in-up delay-2">
          <div className="admin__stat-icon admin__stat-icon--green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="admin__stat-info">
            <span className="admin__stat-value">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="admin__stat-label">Inventory Value</span>
          </div>
        </div>
        <div className="admin__stat animate-fade-in-up delay-3">
          <div className="admin__stat-icon admin__stat-icon--amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="admin__stat-info">
            <span className="admin__stat-value">{lowStockCount}</span>
            <span className="admin__stat-label">Low Stock Alerts</span>
          </div>
        </div>
      </section>

      {/* Main Grid: Form + Table */}
      <div className="admin__grid">
        {/* ── Form Card ── */}
        <aside className={`admin__form-card animate-fade-in-up delay-3 ${isEditing ? 'admin__form-card--editing' : ''}`}>
          <div className="admin__form-header">
            <h3 className="admin__form-title">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h3>
            {isEditing && (
              <span className="admin__editing-badge animate-fade-in-scale">
                Editing: {form.name}
              </span>
            )}
          </div>

          <form className="admin__form" onSubmit={handleSubmit} noValidate>
            <div className="admin__field">
              <label htmlFor="prod-name">Product Name</label>
              <input
                id="prod-name"
                type="text"
                name="name"
                placeholder="e.g. Leather Weekender Bag"
                value={form.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="admin__form-row">
              <div className="admin__field admin__field--grow">
                <label htmlFor="prod-category">Category</label>
                <input
                  id="prod-category"
                  type="text"
                  name="category"
                  placeholder="e.g. Bags"
                  value={form.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="admin__field admin__field--price">
                <label htmlFor="prod-price">Price ($)</label>
                <input
                  id="prod-price"
                  type="number"
                  name="price"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="admin__field">
              <label htmlFor="prod-stock">Stock Quantity</label>
              <input
                id="prod-stock"
                type="number"
                name="stock"
                placeholder="0"
                min="0"
                value={form.stock}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="admin__field">
              <label htmlFor="prod-desc">Description</label>
              <textarea
                id="prod-desc"
                name="description"
                placeholder="Brief product description…"
                value={form.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="admin__field">
              <label>Product Image</label>
              <div className={`admin__file-upload ${filePreview ? 'admin__file-upload--has-preview' : ''}`}>
                {filePreview ? (
                  <div className="admin__file-preview">
                    <img src={filePreview} alt="Upload preview" />
                    <button
                      type="button"
                      className="admin__file-preview-remove"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                        const fi = document.getElementById('productImageInput');
                        if (fi) fi.value = '';
                      }}
                      aria-label="Remove selected image"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ) : (
                  <div className="admin__file-upload-area">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.35">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span className="admin__file-upload-text">Click to upload an image</span>
                    <span className="admin__file-upload-hint">PNG, JPG, WebP up to 5MB</span>
                  </div>
                )}
                <input
                  id="productImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              {isEditing && !filePreview && (
                <span className="admin__field-hint">Leave blank to retain the current image</span>
              )}
            </div>

            <div className="admin__form-actions">
              <button
                type="submit"
                className="admin__btn admin__btn--primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg className="admin__spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {isEditing ? 'Update Product' : 'Add Product'}
                  </>
                )}
              </button>
              {isEditing && (
                <button type="button" className="admin__btn admin__btn--ghost" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </aside>

        {/* ── Table Card ── */}
        <section className="admin__table-card animate-fade-in-up delay-4">
          <div className="admin__table-header">
            <h3 className="admin__table-title">Product Inventory</h3>
            <span className="admin__table-count">
              {loading ? 'Loading…' : `${filteredProducts.length} of ${totalProducts}`}
            </span>
          </div>

          {/* Search Bar */}
          {!loading && products.length > 0 && (
            <div className="admin__search-wrap animate-fade-in-down">
              <svg className="admin__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="admin__search-input"
                placeholder="Search by name or category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="admin__search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="admin__table-scroll">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th style={{ width: '80px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td>
                        <div className="admin__product-cell">
                          <div className="skeleton skeleton-image admin__product-thumb" style={{ width: 44, height: 44 }}></div>
                          <div style={{ flex: 1 }}>
                            <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '40%', height: '0.7em' }}></div>
                          </div>
                        </div>
                      </td>
                      <td><div className="skeleton skeleton-text" style={{ width: 60 }}></div></td>
                      <td><div className="skeleton skeleton-text" style={{ width: 40 }}></div></td>
                      <td><div className="skeleton skeleton-text" style={{ width: 60 }}></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State — No Products */}
          {!loading && products.length === 0 && (
            <div className="admin__table-empty animate-fade-in-scale">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              <p>No products yet</p>
              <span>Add your first product using the form</span>
            </div>
          )}

          {/* Empty State — No Search Results */}
          {!loading && products.length > 0 && filteredProducts.length === 0 && (
            <div className="admin__table-empty animate-fade-in-scale">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              <p>No matching products</p>
              <span>Try a different search term</span>
            </div>
          )}

          {/* Product Table */}
          {!loading && filteredProducts.length > 0 && (
            <div className="admin__table-scroll">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th style={{ width: '80px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p, i) => {
                    const stockStatus = getStockStatus(p.stock);
                    const imgUrl = getProductImage(p);
                    return (
                      <tr
                        key={p.id}
                        className={`admin__row admin__row--enter ${stockStatus === 'out' ? 'admin__row--out' : ''}`}
                        style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                      >
                        <td>
                          <div className="admin__product-cell">
                            <div className="admin__product-thumb">
                              {imgUrl ? (
                                <img src={imgUrl} alt={p.name} loading="lazy" />
                              ) : (
                                <div className="admin__product-thumb-placeholder">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="admin__product-text">
                              <span className="admin__product-name" title={p.name}>{p.name}</span>
                              <span className="admin__product-cat">{p.category}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="admin__cell-price">${Number(p.price).toFixed(2)}</span>
                        </td>
                        <td>
                          <span className={`admin__stock-badge admin__stock-badge--${stockStatus}`}>
                            {Number(p.stock) <= 0 ? 'Out' : `${p.stock} units`}
                          </span>
                        </td>
                        <td>
                          <div className="admin__actions">
                            <button
                              className="admin__action-btn admin__action-btn--edit"
                              onClick={() => startEdit(p)}
                              title="Edit product"
                              aria-label={`Edit ${p.name}`}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            {deleteConfirm === p.id ? (
                              <button
                                className="admin__action-btn admin__action-btn--delete admin__action-btn--confirming"
                                onClick={() => handleDelete(p)}
                                title="Click again to confirm deletion"
                                aria-label="Confirm delete"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                              </button>
                            ) : (
                              <button
                                className="admin__action-btn admin__action-btn--delete"
                                onClick={() => handleDelete(p)}
                                title="Delete product"
                                aria-label={`Delete ${p.name}`}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                  <line x1="10" y1="11" x2="10" y2="17"/>
                                  <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;