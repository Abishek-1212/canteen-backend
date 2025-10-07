const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Place new order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, total_amount, tax, delivery_fee, payment_method } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const orderResult = await db.query(
      'INSERT INTO orders (user_id, total_amount, tax, delivery_fee, payment_method, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [req.userId, total_amount, tax, delivery_fee, payment_method, 'confirmed']
    );

    const orderId = orderResult.rows[0].id;

    for (let item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.id, item.quantity, item.price]
      );
    }

    res.status(201).json({ 
      message: 'Order placed successfully',
      orderId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders
router.get('/user', verifyToken, async (req, res) => {
  try {
    const orders = await db.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    for (let order of orders.rows) {
      const items = await db.query(
        `SELECT oi.*, mi.name, mi.image 
         FROM order_items oi 
         JOIN menu_items mi ON oi.menu_item_id = mi.id 
         WHERE oi.order_id = $1`,
        [order.id]
      );
      order.items = items.rows;
    }

    res.json(orders.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (admin only)
router.get('/all', verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await db.query(
      'SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC'
    );

    res.json(orders.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
