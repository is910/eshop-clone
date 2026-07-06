import React, { useState } from 'react';

const CheckoutPage = ({ cartItems, onCheckoutSuccess }) => {
  const [shipping, setShipping] = useState({ fullName: '', address: '', phone: '' });
  const [orderReceipt, setOrderReceipt] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => setShipping({ ...shipping, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem('authToken');
    const guestId = localStorage.getItem('guestId');

    try {
      const res = await fetch('http://localhost:5000/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token || '' },
        body: JSON.stringify({
          fullName: shipping.fullName,
          shippingAddress: shipping.address,
          contactPhone: shipping.phone,
          guestId: token ? null : guestId
        })
      });

      const data = await res.json();

      if (res.ok) {
        setOrderReceipt(data);
        onCheckoutSuccess(); // Clear cart visibility in parent layout
      } else {
        setError(data.error || "Order execution failed.");
      }
    } catch (err) {
      setError("Cannot sync with checkout transaction node.");
    }
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  if (orderReceipt) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', border: '1px solid #28a745', borderRadius: '8px', textAlign: 'center', background: '#f8fff9' }}>
        <h2 style={{ color: '#28a745' }}>🎉 Order Placed Successfully!</h2>
        <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>Thank you for your purchase.</p>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: '4px', border: '1px solid #ddd', textAlign: 'left', margin: '1.5rem 0' }}>
          <p><strong>Order ID Reference:</strong> #{orderReceipt.orderId}</p>
          <p><strong>Total Charged amount:</strong> ${orderReceipt.total.toFixed(2)}</p>
          <p>Status: <span style={{ color: '#007bff', fontWeight: 'bold' }}>Processing Inventory Packing</span></p>
        </div>
        <button onClick={() => window.location.href = '/'} style={{ padding: '0.5rem 1rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Return to Storefront</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem', display: 'grid', gridTemplateColumns: cartItems.length > 0 ? '1fr 1fr' : '1fr', gap: '2rem' }}>
      <div>
        <h2>Checkout Details</h2>
        {error && <div style={{ color: 'red', margin: '1rem 0', fontWeight: 'bold' }}>{error}</div>}
        
        {cartItems.length === 0 ? (
          <p>Your cart is empty. Add products to configure checkout routines.</p>
        ) : (
          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Full Name</label>
              <input type="text" name="fullName" value={shipping.fullName} onChange={handleInputChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Shipping Address</label>
              <input type="text" name="address" value={shipping.address} onChange={handleInputChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Contact Phone</label>
              <input type="text" name="phone" value={shipping.phone} onChange={handleInputChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <button type="submit" style={{ padding: '0.75rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
              Confirm & Pay ${cartTotal.toFixed(2)}
            </button>
          </form>
        )}
      </div>

      {cartItems.length > 0 && (
        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
          <h3>Order Summary</h3>
          <div style={{ margin: '1rem 0', maxHeight: '300px', overflowY: 'auto' }}>
            {cartItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', padding: '0.5rem 0', borderBottom: '1px solid #ddd', alignItems: 'center' }}>
                <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0 }}>{item.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Qty: {item.quantity || 1} &times; ${item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <h3 style={{ borderTop: '2px solid #ddd', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </h3>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;