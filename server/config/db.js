const path = require('path');
const fs = require('fs');

let pool = null;
let sqliteDb = null;
let jsDb = null;
let dbMode = 'jsdb'; // 'mysql', 'sqlite', 'jsdb'
let initPromise = null;

const defaultCategories = [
  // Expense
  { id: 1, name: 'Food', type: 'expense', icon: 'utensils', color: '#ff6384' },
  { id: 2, name: 'Transport', type: 'expense', icon: 'bus', color: '#36a2eb' },
  { id: 3, name: 'Fuel', type: 'expense', icon: 'fuel', color: '#ff9f40' },
  { id: 4, name: 'Medical', type: 'expense', icon: 'hospital', color: '#4bc0c0' },
  { id: 5, name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#9966ff' },
  { id: 6, name: 'Rent', type: 'expense', icon: 'home', color: '#ff6384' },
  { id: 7, name: 'Electricity', type: 'expense', icon: 'zap', color: '#ffcd56' },
  { id: 8, name: 'Water Bill', type: 'expense', icon: 'droplet', color: '#36a2eb' },
  { id: 9, name: 'Internet', type: 'expense', icon: 'wifi', color: '#4bc0c0' },
  { id: 10, name: 'Mobile Recharge', type: 'expense', icon: 'smartphone', color: '#9966ff' },
  { id: 11, name: 'Entertainment', type: 'expense', icon: 'film', color: '#ff9f40' },
  { id: 12, name: 'Education', type: 'expense', icon: 'book', color: '#36a2eb' },
  { id: 13, name: 'Investment', type: 'expense', icon: 'trending-up', color: '#4bc0c0' },
  { id: 14, name: 'Loan', type: 'expense', icon: 'landmark', color: '#ff6384' },
  { id: 15, name: 'Insurance', type: 'expense', icon: 'shield', color: '#9966ff' },
  { id: 16, name: 'Travel', type: 'expense', icon: 'plane', color: '#ffcd56' },
  { id: 17, name: 'Swiggy', type: 'expense', icon: 'shopping-cart', color: '#ffb234' },
  { id: 18, name: 'Others', type: 'expense', icon: 'more-horizontal', color: '#6c757d' },
  // Income
  { id: 19, name: 'Salary', type: 'income', icon: 'wallet', color: '#28a745' },
  { id: 20, name: 'Freelancing', type: 'income', icon: 'laptop', color: '#17a2b8' },
  { id: 21, name: 'Business', type: 'income', icon: 'building', color: '#ffc107' },
  { id: 22, name: 'Commission', type: 'income', icon: 'percent', color: '#20c997' },
  { id: 23, name: 'Interest', type: 'income', icon: 'landmark', color: '#6f42c1' },
  { id: 24, name: 'Investment Return', type: 'income', icon: 'trending-up', color: '#fd7e14' },
  { id: 25, name: 'Rental Income', type: 'income', icon: 'home', color: '#0dcaf0' },
  { id: 26, name: 'Bonus', type: 'income', icon: 'gift', color: '#d63384' },
  { id: 27, name: 'Gift', type: 'income', icon: 'package', color: '#198754' },
  { id: 28, name: 'Swiggy', type: 'income', icon: 'shopping-cart', color: '#ffb234' },
  { id: 29, name: 'Others', type: 'income', icon: 'more-horizontal', color: '#6c757d' }
];

async function initDB() {
  const dbHost = process.env.DB_HOST || '';
  const dbUser = process.env.DB_USER || 'root';
  const dbPass = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'finance_dashboard';
  const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV;

  // 1. Try MySQL if host configured
  if (dbHost && dbHost !== 'localhost') {
    try {
      const mysql = require('mysql2/promise');
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
      dbMode = 'mysql';
      return;
    } catch (mysqlErr) {
      console.log('⚠️ MySQL connection failed:', mysqlErr.message);
    }
  }

  // 2. If running on Vercel Serverless, use Pure JS Storage Engine directly
  if (isVercel) {
    dbMode = 'jsdb';
    const jsonPath = path.join('/tmp', 'db.json');
    initJsDb(jsonPath);
    console.log('✅ Vercel Serverless Pure JS Storage Engine ready at:', jsonPath);
    return;
  }

  // 3. Try native SQLite3 locally
  try {
    const sqlite3 = require('sqlite3').verbose();
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
    }

    const userCount = await getSqlite('SELECT COUNT(*) as count FROM users');
    if (!userCount || userCount.count === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPass = await bcrypt.hash('password123', 10);
      await runSqlite(
        `INSERT INTO users (full_name, email, password, currency, monthly_budget) VALUES (?, ?, ?, ?, ?)`,
        ['Demo User', 'demo@example.com', hashedPass, '₹', 50000]
      );
      console.log('✅ Default demo user seeded in SQLite: demo@example.com / password123');
    }

    dbMode = 'sqlite';
    console.log('✅ SQLite database initialized successfully.');
    return;
  } catch (sqliteErr) {
    console.log('⚠️ Native SQLite3 failed, using JS DB fallback:', sqliteErr.message);
  }

  // 4. Local JS DB Fallback
  dbMode = 'jsdb';
  const jsonPath = path.join(__dirname, '../db.json');
  initJsDb(jsonPath);
}

function initJsDb(jsonPath) {
  let initialData = {
    users: [],
    categories: defaultCategories,
    transactions: [],
    notifications: []
  };

  if (fs.existsSync(jsonPath)) {
    try {
      const raw = fs.readFileSync(jsonPath, 'utf8');
      jsDb = JSON.parse(raw);
    } catch (e) {
      jsDb = initialData;
    }
  } else {
    jsDb = initialData;
    try { fs.writeFileSync(jsonPath, JSON.stringify(jsDb, null, 2)); } catch (e) {}
  }

  if (!jsDb.users || jsDb.users.length === 0) {
    const bcrypt = require('bcryptjs');
    const hashedPass = bcrypt.hashSync('password123', 10);
    jsDb.users = [{
      id: 1,
      full_name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPass,
      currency: '₹',
      monthly_budget: 50000,
      phone: null,
      avatar: null,
      language: 'en',
      theme: 'dark',
      is_active: 1,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }];
    saveJsDb();
    console.log('✅ Default demo user seeded in JS DB: demo@example.com / password123');
  }
}

function saveJsDb() {
  if (dbMode !== 'jsdb' || !jsDb) return;
  const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV;
  const jsonPath = isVercel ? path.join('/tmp', 'db.json') : path.join(__dirname, '../db.json');
  try {
    fs.writeFileSync(jsonPath, JSON.stringify(jsDb, null, 2));
  } catch (e) {
    console.error('saveJsDb write error:', e.message);
  }
}

function ensureDB() {
  if (!initPromise) {
    initPromise = initDB().catch(err => {
      console.error('initDB error:', err);
      initPromise = null;
    });
  }
  return initPromise;
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
  await ensureDB();

  if (dbMode === 'mysql') {
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  if (dbMode === 'sqlite') {
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
  }

  // JS DB Engine (Zero Native Binary dependencies)
  if (dbMode === 'jsdb') {
    if (!jsDb) {
      const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV;
      const jsonPath = isVercel ? path.join('/tmp', 'db.json') : path.join(__dirname, '../db.json');
      initJsDb(jsonPath);
    }

    const s = sql.trim();
    
    // Select users by email
    if (s.includes('SELECT') && s.includes('FROM users WHERE email = ?')) {
      const email = params[0];
      const found = jsDb.users.filter(u => u.email === email);
      return found;
    }

    // Select user by ID
    if (s.includes('SELECT') && s.includes('FROM users WHERE id = ?')) {
      const id = params[0];
      const found = jsDb.users.filter(u => u.id === id);
      return found;
    }

    // Insert into users
    if (s.includes('INSERT INTO users')) {
      const id = jsDb.users.length + 1;
      const newUser = {
        id,
        full_name: params[0],
        email: params[1],
        password: params[2],
        currency: params[3] || '₹',
        monthly_budget: params[4] || 0,
        phone: null,
        avatar: null,
        language: 'en',
        theme: 'dark',
        is_active: 1,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      jsDb.users.push(newUser);
      saveJsDb();
      return [{ insertId: id, affectedRows: 1 }];
    }

    // Select categories
    if (s.includes('FROM categories')) {
      if (params[0]) {
        return jsDb.categories.filter(c => c.type === params[0]);
      }
      return jsDb.categories;
    }

    // Insert notification
    if (s.includes('INSERT INTO notifications')) {
      const id = jsDb.notifications.length + 1;
      const notif = {
        id,
        user_id: params[0],
        type: params[1] || 'info',
        title: params[2],
        message: params[3],
        is_read: 0,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      jsDb.notifications.push(notif);
      saveJsDb();
      return [{ insertId: id, affectedRows: 1 }];
    }

    // Insert transaction
    if (s.includes('INSERT INTO transactions')) {
      const id = jsDb.transactions.length + 1;
      const tx = {
        id,
        user_id: params[0],
        category_id: params[1],
        type: params[2],
        amount: params[3],
        description: params[4],
        transaction_date: params[5],
        payment_method: params[6],
        reference: params[7],
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      jsDb.transactions.push(tx);
      saveJsDb();
      return [{ insertId: id, affectedRows: 1 }];
    }

    // Dashboard & Reports Fallbacks for JS DB
    if (s.includes('FROM transactions') && s.includes('SUM')) {
      const userId = params[0];
      const userTxs = jsDb.transactions.filter(t => t.user_id === userId);
      const inc = userTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const exp = userTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      return [{
        income: inc,
        expense: exp,
        net_balance: inc - exp,
        total_income: inc,
        total_expense: exp,
        total_transactions: userTxs.length,
        active_days: 1
      }];
    }

    // Select transactions list
    if (s.includes('FROM transactions')) {
      const userId = params[0];
      const userTxs = jsDb.transactions.filter(t => t.user_id === userId).map(t => {
        const cat = jsDb.categories.find(c => c.id === t.category_id) || {};
        return {
          ...t,
          category_name: cat.name || 'Category',
          category_icon: cat.icon || 'tag',
          category_color: cat.color || '#6366f1'
        };
      });
      return userTxs;
    }

    // Select notifications list
    if (s.includes('FROM notifications')) {
      const userId = params[0];
      return jsDb.notifications.filter(n => n.user_id === userId);
    }

    // Update user profile
    if (s.includes('UPDATE users')) {
      const userId = params[params.length - 1];
      const user = jsDb.users.find(u => u.id === userId);
      if (user) {
        if (params[0]) user.full_name = params[0];
        if (params[1]) user.phone = params[1];
        if (params[2]) user.currency = params[2];
        if (params[3]) user.language = params[3];
        if (params[4]) user.theme = params[4];
        if (params[5]) user.monthly_budget = params[5];
        saveJsDb();
      }
      return [{ affectedRows: 1 }];
    }

    // Default fallback array
    return [];
  }

  return [];
}

module.exports = { initDB, ensureDB, query };
