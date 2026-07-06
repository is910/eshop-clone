import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'ecommerce.db');

let dbConnection = null;

export async function getDB() {
  if (dbConnection) return dbConnection;

  dbConnection = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await dbConnection.get('PRAGMA foreign_keys = ON');

  // Initialize Tables
  await dbConnection.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      token TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      image_path TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      guest_id TEXT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      guest_id TEXT,
      full_name TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      total_amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_purchase REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // Seed default items if the catalog is empty
  const productCount = await dbConnection.get('SELECT COUNT(*) as count FROM products');
  if (productCount.count === 0) {
    await dbConnection.run(`
      INSERT INTO products (name, price, category, stock, image_path, description) VALUES
      ('Classic White T-Shirt', 19.99, 'Apparel', 25, '/images/tshirt.jpg', 'A comfortable classic white t-shirt made from 100% organic cotton.'),
      ('Denim Jeans', 49.99, 'Apparel', 14, '/images/jeans.jpg', 'High-quality denim jeans with a comfortable straight-leg fit.'),
      ('Running Sneakers', 89.99, 'Footwear', 8, '/images/sneakers.jpg', 'Lightweight running sneakers with responsive cushioning.');
    `);
  }

  // Seed default structural profiles if empty
  const userCount = await dbConnection.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    // In production, use bcrypt to hash these passwords. For your school project, we store strings directly.
    await dbConnection.run(`
      INSERT INTO users (id, username, password, role, token) VALUES
      ('user_customer_1', 'customer@eshop.com', 'pass123', 'customer', 'token_customer_xyz'),
      ('user_admin_1', 'admin@eshop.com', 'admin456', 'admin', 'token_admin_abc')
    `);
  }

  return dbConnection;
}