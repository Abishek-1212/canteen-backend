const db = require('./config/db');

async function initializeDatabase() {
  console.log('🔧 Initializing database tables...');

  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table ready');

    // Create canteens table
    await db.query(`
      CREATE TABLE IF NOT EXISTS canteens (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Canteens table ready');

    // Create canteen_meal_types table
    await db.query(`
      CREATE TABLE IF NOT EXISTS canteen_meal_types (
        id SERIAL PRIMARY KEY,
        canteen_id INT NOT NULL,
        meal_type VARCHAR(20),
        FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Canteen meal types table ready');

    // Create menu_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        canteen_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        rating DECIMAL(3, 2) DEFAULT 0,
        image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Menu items table ready');

    // Create orders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        tax DECIMAL(10, 2) DEFAULT 0,
        delivery_fee DECIMAL(10, 2) DEFAULT 0,
        payment_method VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Orders table ready');

    // Create order_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT NOT NULL,
        menu_item_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
      )
    `);
    console.log('✅ Order items table ready');

    console.log('🎉 All database tables initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

module.exports = initializeDatabase;
