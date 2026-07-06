import React, { useState, useEffect } from 'react';
import './ProductList.css';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ id: '', name: '', price: '', category: '', stock: '', description: '', imagePath: '' });
  const [isEditing, setIsEditing] = useState(false);

  const fetchCatalog = () => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  useEffect(() => { fetchCatalog(); }, []);

  const handleInputChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `http://localhost:5000/api/products/${form.id}` : 'http://localhost:5000/api/products';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      setForm({ id: '', name: '', price: '', category: '', stock: '', description: '', imagePath: '' });
      setIsEditing(false);
      fetchCatalog();
    } else {
      alert("Action rejected by the database safety manager.");
    }
  };

  const startEdit = (prod) => {
    setIsEditing(true);
    setForm({ id: prod.id, name: prod.name, price: prod.price, category: prod.category, stock: prod.stock, description: '', imagePath: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const token = localStorage.getItem('authToken');
    const res = await fetch(`http://localhost:5000/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    });
    if (res.ok) fetchCatalog();
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Admin Dashboard — Product CRUD</h2>
      
      <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
        <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleInputChange} required style={{ display: 'block', width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }} />
        <input type="number" name="price" placeholder="Price" step="0.01" value={form.price} onChange={handleInputChange} required style={{ display: 'block', width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }} />
        <input type="text" name="category" placeholder="Category" value={form.category} onChange={handleInputChange} required style={{ display: 'block', width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }} />
        <input type="number" name="stock" placeholder="Stock Quantity" value={form.stock} onChange={handleInputChange} required style={{ display: 'block', width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }} />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleInputChange} style={{ display: 'block', width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }} />
        <button type="submit" style={{ padding: '0.5rem 1rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>Save Product</button>
        {isEditing && <button type="button" onClick={() => { setIsEditing(false); setForm({ id: '', name: '', price: '', category: '', stock: '', description: '', imagePath: '' }); }} style={{ marginLeft: '10px' }}>Cancel</button>}
      </form>

      <h3>Product Inventory</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th style={{ padding: '0.5rem' }}>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '0.5rem' }}>{p.id}</td>
              <td>{p.name}</td>
              <td>${p.price.toFixed(2)}</td>
              <td>{p.stock} units</td>
              <td>
                <button onClick={() => startEdit(p)} style={{ marginRight: '5px' }}>Edit</button>
                <button onClick={() => handleDelete(p.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', padding: '2px 6px' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;