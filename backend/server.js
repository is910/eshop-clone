import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDB } from './data/db.js';

const app = express();
const PORT = 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to extract user and check roles from real SQLite records
async function extractUser(req) {
  const token = req.headers['authorization'] || (req.body && req.body.authToken);
  if (!token) return null;

  const db = await getDB();
  const user = await db.get('SELECT id, role FROM users WHERE token = ?', token);
  return user || null; // Returns { id, role } or null
}

// Security Middleware: Requires Admin Privileges
async function requireAdmin(req, res, next) {
  const user = await extractUser(req);
  if (!user || user.role !== 'admin') {
    console.warn('[Security Guard] Unauthorized admin action blocked.');
    return res.status(403).json({ error: "Forbidden: Admin access required." });
  }
  req.adminUser = user;
  next();
}

// Get fully formatted cart item array from DB
async function getHydratedCart(userId, guestId) {
  const db = await getDB();
  let query = `
    SELECT c.product_id, c.quantity, p.name, p.price, p.category, p.image_path 
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
  `;
  let params = [];

  if (userId) {
    query += ' WHERE c.user_id = ?';
    params.push(userId);
  } else {
    query += ' WHERE c.guest_id = ?';
    params.push(guestId);
  }

  const rows = await db.all(query, params);
  return rows.map(row => ({
    id: row.product_id,
    name: row.name,
    price: row.price,
    category: row.category,
    quantity: row.quantity,
    image: `http://localhost:${PORT}${row.image_path || ''}`
  }));
}

// Auth 1: User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = await getDB();
    const user = await db.get('SELECT id, role, token FROM users WHERE username = ? AND password = ?', username, password);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    return res.json({ success: true, authToken: user.token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth 2: User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const db = await getDB();
    
    // Generate a quick random token string for session lookup
    const generatedToken = `token_${Math.random().toString(36).substring(2, 15)}`;
    // Assign a default client ID
    const newUserId = `user_${Math.random().toString(36).substring(2, 7)}`;

    // Insert user into SQLite database with standard 'customer' role
    await db.run(
      'INSERT INTO users (id, username, password, role, token) VALUES (?, ?, ?, "customer", ?)',
      newUserId, username, password, generatedToken
    );

    console.log(`[Database Server]: Registered new account: ${username}`);
    return res.json({ success: true, authToken: generatedToken, role: 'customer' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: "Username already exists." });
    }
    return res.status(500).json({ error: err.message });
  }
});

// Cart 1: Fetch items
app.get('/api/cart', async (req, res) => {
  try {
    const user = await extractUser(req);
    const guestId = req.query.guestId;
    const items = await getHydratedCart(user?.id, guestId);
    return res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cart 2: Add item
app.post('/api/cart/add', async (req, res) => {
  try {
    const { productId, guestId, authToken } = req.body;
    const user = await extractUser(req);
    const db = await getDB();

    if (!user && !guestId) {
      return res.status(400).json({ error: "Missing identity reference context." });
    }

    const userId = user?.id || null;
    const gId = user ? null : guestId;

    // Check if item already exists in this cart session
    const existing = await db.get(
      'SELECT id, quantity FROM cart_items WHERE (user_id IS ? AND guest_id IS ?) AND product_id = ?',
      userId, gId, productId
    );

    if (existing) {
      await db.run('UPDATE cart_items SET quantity = quantity + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', existing.id);
    } else {
      await db.run(
        'INSERT INTO cart_items (user_id, guest_id, product_id, quantity) VALUES (?, ?, ?, 1)',
        userId, gId, productId
      );
    }

    const updatedCart = await getHydratedCart(userId, gId);
    return res.json({ success: true, cart: updatedCart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cart 3: Remove item (deletes the row entirely from the database)
app.post('/api/cart/remove', async (req, res) => {
  try {
    const { productId, guestId } = req.body;
    const user = await extractUser(req);
    const db = await getDB();

    if (!user && !guestId) {
      return res.status(400).json({ error: "Missing identity reference context." });
    }

    const userId = user?.id || null;
    const gId = user ? null : guestId;

    const result = await db.run(
      'DELETE FROM cart_items WHERE (user_id IS ? AND guest_id IS ?) AND product_id = ?',
      userId, gId, productId
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Item not found in cart." });
    }

    const updatedCart = await getHydratedCart(userId, gId);
    return res.json({ success: true, cart: updatedCart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Checkout: Process Order and Save to Database
app.post('/api/orders/checkout', async (req, res) => {
  console.log('\n--- Incoming POST Request: /api/orders/checkout ---');
  try {
    const { fullName, shippingAddress, contactPhone } = req.body;
    
    if (!fullName || !shippingAddress || !contactPhone) {
      return res.status(400).json({ error: "All checkout shipping fields are strictly required." });
    }

    // ── Auth Guard: Require authenticated user ──
    const user = await extractUser(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required to place an order. Please sign in." });
    }
    const userId = user.id;

    const db = await getDB();

    // 1. Fetch current items inside this user's cart
    const cartItems = await db.all(`
      SELECT c.product_id, c.quantity, p.name, p.price, p.stock 
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, userId);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cannot checkout an empty shopping cart configuration." });
    }

    // 2. Stock Verification Safety Check
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(409).json({ 
          error: `Insufficient stock for ${item.name}. Available items remaining: ${item.stock}` 
        });
      }
    }

    // 3. Compute running totals cleanly
    const orderTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 4. Begin Database Transaction Simulation (Sequential executions)
    const orderResult = await db.run(
      'INSERT INTO orders (user_id, guest_id, full_name, shipping_address, contact_phone, total_amount) VALUES (?, NULL, ?, ?, ?, ?)',
      userId, fullName, shippingAddress, contactPhone, orderTotal
    );
    const newOrderId = orderResult.lastID;

    for (const item of cartItems) {
      // Save item purchase snapshots
      await db.run(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
        newOrderId, item.product_id, item.quantity, item.price
      );

      // Decrement the active product stock values inside your inventory tables
      await db.run(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        item.quantity, item.product_id
      );
    }

    // 5. Clear cart contents entirely upon successful transaction completion
    await db.run('DELETE FROM cart_items WHERE user_id = ?', userId);

    console.log(`[Checkout Server]: Successfully created Order #${newOrderId} for user ${userId} — $${orderTotal.toFixed(2)}`);
    return res.json({ success: true, orderId: newOrderId, total: orderTotal });

  } catch (err) {
    console.error('[Fatal Checkout Error]:', err);
    return res.status(500).json({ error: "Internal Server Error during checkout routing.", details: err.message });
  }
});

// Cart 4: Migrate items
app.post('/api/cart/migrate', async (req, res) => {
  try {
    const { guestId, authToken } = req.body;
    const user = await extractUser(req);

    if (!user) return res.status(401).json({ error: "Unauthorized migration context." });

    const db = await getDB();
    const guestItems = await db.all('SELECT product_id, quantity FROM cart_items WHERE guest_id = ?', guestId);

    for (const item of guestItems) {
      const existing = await db.get('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?', user.id, item.product_id);
      if (existing) {
        await db.run('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', item.quantity, existing.id);
      } else {
        await db.run('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', user.id, item.product_id, item.quantity);
      }
    }

    // Delete guest cart items
    await db.run('DELETE FROM cart_items WHERE guest_id = ?', guestId);

    const updatedCart = await getHydratedCart(user.id, null);
    return res.json({ success: true, cart: updatedCart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Products 1: Lightweight collection endpoint
app.get('/api/products', async (req, res) => {
  try {
    const db = await getDB();
    const rows = await db.all('SELECT id, name, price, category, stock, image_path FROM products');
    const catalog = rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      category: row.category,
      stock: row.stock,
      image: `http://localhost:${PORT}${row.image_path || ''}`
    }));
    return res.json(catalog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Products 2: Detailed single item endpoint
app.get('/api/products/:id', async (req, res) => {
  try {
    const db = await getDB();
    const row = await db.get('SELECT * FROM products WHERE id = ?', req.params.id);
    if (!row) return res.status(404).json({ error: "Product not found" });
    
    return res.json({
      ...row,
      image: `http://localhost:${PORT}${row.image_path || ''}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin CRUD 1: Add Product
app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    const { name, price, category, stock, description, imagePath } = req.body;
    const db = await getDB();
    const result = await db.run(
      'INSERT INTO products (name, price, category, stock, description, image_path) VALUES (?, ?, ?, ?, ?, ?)',
      name, price, category, stock, description, imagePath || '/images/tshirt.jpg'
    );
    return res.json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin CRUD 2: Edit Product
app.put('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const { name, price, category, stock, description, imagePath } = req.body;
    const db = await getDB();
    await db.run(
      'UPDATE products SET name = ?, price = ?, category = ?, stock = ?, description = ?, image_path = ? WHERE id = ?',
      name, price, category, stock, description, imagePath, req.params.id
    );
    return res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin CRUD 3: Delete Product
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const db = await getDB();
    await db.run('DELETE FROM products WHERE id = ?', req.params.id);
    return res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Backend database server running on http://localhost:${PORT}`));