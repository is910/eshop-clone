import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'ecommerce.db');

let dbConnection = null;

// 📝 THIS IS YOUR MASTER CATALOG LIST. 
// You can add, remove, or modify items here whenever you want!
const initialProducts = [
  {
    name: "Classic White T-Shirt",
    price: 19.99,
    category: "Apparel",
    stock: 25,
    image_path: "/images/tshirt.jpg",
    description: "A comfortable classic white t-shirt made from 100% organic cotton."
  },
  {
    name: "Denim Jeans",
    price: 49.99,
    category: "Apparel",
    stock: 14,
    image_path: "/images/jeans.jpg",
    description: "High-quality denim jeans with a comfortable straight-leg fit."
  },
  {
    name: "Running Sneakers",
    price: 89.99,
    category: "Footwear",
    stock: 8,
    image_path: "/images/sneakers.jpg",
    description: "Lightweight running sneakers with responsive cushioning."
  },
  // ✨ Simply add your 4th, 5th, or 6th items here when you're ready:
  {
    name: "Leather Wallet",
    price: 29.99,
    category: "Accessories",
    stock: 50,
    image_path: "/images/wallet.jpg",
    description: "Genuine leather bi-fold wallet with RFID protection."
  },
  {
    name: "Leather Jacket",
    price: 29.99,
    category: "Apparel",
    stock: 50,
    image_path: "/images/jacket.jpg",
    description: "Genuine leather bi-fold wallet with RFID protection."
  }
];

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
      name TEXT UNIQUE NOT NULL, -- 🔑 CHANGE 1: Added UNIQUE constraint here
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
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);

  // 🔄 CHANGE 2: Smart loop that runs on every single startup.
  // It inserts new entries but avoids throwing errors for duplicates.
  for (const prod of initialProducts) {
    await dbConnection.run(`
      INSERT OR IGNORE INTO products (name, price, category, stock, image_path, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `, prod.name, prod.price, prod.category, prod.stock, prod.image_path, prod.description);
  }

  // Seed default structural profiles if empty
  const userCount = await dbConnection.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    await dbConnection.run(`
      INSERT INTO users (id, username, password, role, token) VALUES
      ('user_customer_1', 'customer@eshop.com', 'pass123', 'customer', 'token_customer_xyz'),
      ('user_admin_1', 'admin@eshop.com', 'admin456', 'admin', 'token_admin_abc')
    `);
  }

  return dbConnection;
}