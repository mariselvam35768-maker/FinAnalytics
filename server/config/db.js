const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let pool = null;
let sqliteDb = null;
let isSqlite = false;

const defaultCategories = [
  // Expense
  { name: 'Food', type: 'expense', icon: 'utensils', color: '#ff6384' },
  { name: 'Transport', type: 'expense', icon: 'bus', color: '#36a2eb' },
  { name: 'Fuel', type: 'expense', icon: 'fuel', color: '#ff9f40' },
  { name: 'Medical', type: 'expense', icon: 'hospital', color: '#4bc0c0' },
  { name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#9966ff' },
  { name: 'Rent', type: 'expense', icon: 'home', color: '#ff6384' },
  { name: 'Electricity', type: 'expense', icon: 'zap', color: '#ffcd56' },
  { name: 'Water Bill', type: 'expense', icon: 'droplet', color: '#36a2eb' },
  { name: 'Internet', type: 'expense', icon: 'wifi', color: '#4bc0c0' },
  { name: 'Mobile Recharge', type: 'expense', icon: 'smartphone', color: '#9966ff' },
  { name: 'Entertainment', type: 'expense', icon: 'film', color: '#ff9f40' },
  { name: 'Education', type: 'expense', icon: 'book', color: '#36a2eb' },
  { name: 'Investment', type: 'expense', icon: 'trending-up', color: '#4bc0c0' },
  { name: 'Loan', type: 'expense', icon: 'landmark', color: '#ff6384' },
  { name: 'Insurance', type: 'expense', icon: 'shield', color: '#9966ff' },
  { name: 'Travel', type: 'expense', icon: 'plane', color: '#ffcd56' },
  { name: 'Swiggy', type: 'expense', icon: 'shopping-cart', color: '#ffb234' },
  { name: 'Others', type: 'expense', icon: 'more-horizontal', color: '#6c757d' },
  // Income
  { name: 'Salary', type: 'income', icon: 'wallet', color: '#28a745' },
  { name: 'Freelancing', type: 'income', icon: 'laptop', color: '#17a2b8' },
  { name: 'Business', type: 'income', icon: 'building', color: '#ffc107' },
  { name: 'Commission', type: 'income', icon: 'percent', color: '#20c997' },
  { name: 'Interest', type: 'income', icon: 'landmark', color: '#6f42c1' },
  { name: 'Investment Return', type: 'income', icon: 'trending-up', color: '#fd7e14' },
  { name: 'Rental Income', type: 'income', icon: 'home', color: '#0dcaf0' },
  { name: 'Bonus', type: 'income', icon: 'gift', color: '#d63384' },
  { name: 'Gift', type: 'income', icon: 'package', color: '#198754' },
  { name: 'Swiggy', type: 'income', icon: 'shopping-cart', color: '#ffb234' },
  { name: 'Others', type: 'income', icon: 'more-horizontal', color: '#6c757d' }
];

async function initDB() {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPass = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'finance_dashboard';

  try {
    pool = mysql.createPool({
      host: dbHost,
      user: dbUser,
      password: dbPass,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    await pool.query('SELECT 1');
    console.log('✅ Connected to MySQL database:', dbName);
    isSqlite = false;
  } catch (mysqlErr) {
    console.log('⚠️ MySQL connection failed. Falling back to SQLite file database...');
    isSqlite = true;

    const dbPath = path.join(__dirname, '../database.sqlite');
    sqliteDb = new sqlite3.Database(dbPath);

    await runSqlite(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        phone TEXT DEFAULT NULL,
        avatar TEXT DEFAULT NULL,
        currency TEXT NOT NULL DEFAULT '₹',
        language TEXT NOT NULL DEFAULT 'en',
        theme TEXT NOT NULL DEFAULT 'dark',
        monthly_budget REAL NOT NULL DEFAULT 0.00,
        reset_token TEXT DEFAULT NULL,
        reset_expires TEXT DEFAULT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runSqlite(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT 'tag',
        color TEXT NOT NULL DEFAULT '#6c757d',
        is_default INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runSqlite(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT DEFAULT NULL,
        transaction_date TEXT NOT NULL,
        payment_method TEXT DEFAULT 'Cash',
        reference TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    await runSqlite(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER DEFAULT NULL,
        amount REAL NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await runSqlite(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL DEFAULT 'info',
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    const catCount = await getSqlite('SELECT COUNT(*) as count FROM categories');
    if (!catCount || catCount.count === 0) {
      for (const cat of defaultCategories) {
        await runSqlite(
          'INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)',
          [cat.name, cat.type, cat.icon, cat.color]
        );
      }
      console.log('✅ Seeded default categories into SQLite database.');
    }

    console.log('✅ SQLite database initialized successfully at database.sqlite');
  }
}

function runSqlite(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ insertId: this.lastID, changes: this.changes });
    });
  });
}

function getSqlite(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allSqlite(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function query(sql, params = []) {
  if (isSqlite) {
    let adaptedSql = sql
      .replace(/MONTH\(CURDATE\(\)\)/gi, "cast(strftime('%m', 'now', 'localtime') as integer)")
      .replace(/YEAR\(CURDATE\(\)\)/gi, "cast(strftime('%Y', 'now', 'localtime') as integer)")
      .replace(/DATE_SUB\s*\(\s*CURDATE\(\)\s*,\s*INTERVAL\s*1\s*MONTH\s*\)/gi, "date('now', '-1 month', 'localtime')")
      .replace(/DATE_SUB\s*\(\s*CURDATE\(\)\s*,\s*INTERVAL\s*1\s*DAY\s*\)/gi, "date('now', '-1 day', 'localtime')")
      .replace(/DATE_SUB\s*\(\s*CURDATE\(\)\s*,\s*INTERVAL\s*\?\s*DAY\s*\)/gi, "date('now', '-' || ? || ' day', 'localtime')")
      .replace(/CURDATE\(\)/gi, "date('now', 'localtime')")
      .replace(/NOW\(\)/gi, "datetime('now', 'localtime')")
      .replace(/DATE_FORMAT\(([^,]+),\s*['"]%Y-%m['"]\)/gi, "strftime('%Y-%m', $1)")
      .replace(/DATE_FORMAT\(([^,]+),\s*['"]%Y-%m-%d['"]\)/gi, "strftime('%Y-%m-%d', $1)")
      .replace(/MONTH\(([a-zA-Z0-9_\.]+)\)/gi, "cast(strftime('%m', $1) as integer)")
      .replace(/YEAR\(([a-zA-Z0-9_\.]+)\)/gi, "cast(strftime('%Y', $1) as integer)");

    const trimmed = adaptedSql.trim().toUpperCase();
    if (trimmed.startsWith('SELECT')) {
      return await allSqlite(adaptedSql, params);
    } else {
      const res = await runSqlite(adaptedSql, params);
      return [{ insertId: res.insertId, affectedRows: res.changes }];
    }
  } else {
    const [rows] = await pool.query(sql, params);
    return rows;
  }
}

module.exports = { initDB, query };
