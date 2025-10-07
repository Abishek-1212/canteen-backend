const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get all canteens
router.get('/', async (req, res) => {
  try {
    const canteens = await db.query('SELECT * FROM canteens');

    for (let canteen of canteens.rows) {
      const mealTypes = await db.query(
        'SELECT meal_type FROM canteen_meal_types WHERE canteen_id = $1',
        [canteen.id]
      );
      canteen.mealTypes = mealTypes.rows.map(m => m.meal_type);
    }

    res.json(canteens.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single canteen
router.get('/:id', async (req, res) => {
  try {
    const canteens = await db.query('SELECT * FROM canteens WHERE id = $1', [req.params.id]);

    if (canteens.rows.length === 0) {
      return res.status(404).json({ message: 'Canteen not found' });
    }

    const canteen = canteens.rows[0];
    const mealTypes = await db.query(
      'SELECT meal_type FROM canteen_meal_types WHERE canteen_id = $1',
      [canteen.id]
    );
    canteen.mealTypes = mealTypes.rows.map(m => m.meal_type);

    res.json(canteen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new canteen (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, image, mealTypes } = req.body;

    if (!name || !mealTypes || mealTypes.length === 0) {
      return res.status(400).json({ message: 'Name and meal types are required' });
    }

    const result = await db.query(
      'INSERT INTO canteens (name, description, image) VALUES ($1, $2, $3) RETURNING id',
      [name, description, image]
    );

    const canteenId = result.rows[0].id;

    for (let mealType of mealTypes) {
      await db.query(
        'INSERT INTO canteen_meal_types (canteen_id, meal_type) VALUES ($1, $2)',
        [canteenId, mealType]
      );
    }

    res.status(201).json({ 
      message: 'Canteen added successfully',
      canteenId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update canteen (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, image, mealTypes } = req.body;

    await db.query(
      'UPDATE canteens SET name = $1, description = $2, image = $3 WHERE id = $4',
      [name, description, image, req.params.id]
    );

    await db.query('DELETE FROM canteen_meal_types WHERE canteen_id = $1', [req.params.id]);

    for (let mealType of mealTypes) {
      await db.query(
        'INSERT INTO canteen_meal_types (canteen_id, meal_type) VALUES ($1, $2)',
        [req.params.id, mealType]
      );
    }

    res.json({ message: 'Canteen updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete canteen (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM canteens WHERE id = $1', [req.params.id]);
    res.json({ message: 'Canteen deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
