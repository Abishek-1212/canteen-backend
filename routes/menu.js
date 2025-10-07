const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const items = await db.query('SELECT * FROM menu_items');
    res.json(items.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get menu items by canteen
router.get('/canteen/:canteenId', async (req, res) => {
  try {
    const items = await db.query(
      'SELECT * FROM menu_items WHERE canteen_id = $1',
      [req.params.canteenId]
    );
    res.json(items.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add menu item (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { canteen_id, name, description, price, rating, image } = req.body;

    if (!canteen_id || !name || !price) {
      return res.status(400).json({ message: 'Canteen, name, and price are required' });
    }

    const result = await db.query(
      'INSERT INTO menu_items (canteen_id, name, description, price, rating, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [canteen_id, name, description, price, rating || 0, image]
    );

    res.status(201).json({ 
      message: 'Item added successfully',
      itemId: result.rows[0].id 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update menu item (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { canteen_id, name, description, price, rating, image } = req.body;

    await db.query(
      'UPDATE menu_items SET canteen_id = $1, name = $2, description = $3, price = $4, rating = $5, image = $6 WHERE id = $7',
      [canteen_id, name, description, price, rating, image, req.params.id]
    );

    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete menu item (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
