import express from 'express';
import sql from 'mssql';
import { getPool } from '../db/config';
import { verifyToken, verifyFarmer, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

// -------------------------------
// Get all products for logged-in farmer
// -------------------------------
router.get('/products/mine', verifyToken, verifyFarmer, async (req: AuthRequest, res) => {
  try {
    const pool = await getPool();
    const farmerId = req.user!.userId;

    const result = await pool
      .request()
      .input('farmerId', sql.Int, farmerId)
      .query('SELECT * FROM Products WHERE farmer_id = @farmerId');

    res.json(result.recordset);
  } catch (err) {
    console.error('Fetch farmer products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------------
// Add a new product
// -------------------------------
router.post('/products', verifyToken, verifyFarmer, async (req: AuthRequest, res) => {
  const { name, price, quantity, description } = req.body;

  if (!name || !price || !quantity) {
    return res.status(400).json({ message: 'Name, price, and quantity are required' });
  }

  try {
    const pool = await getPool();
    const farmerId = req.user!.userId;

    await pool
      .request()
      .input('farmerId', sql.Int, farmerId)
      .input('name', sql.VarChar, name)
      .input('price', sql.Decimal(10, 2), price)
      .input('quantity', sql.Int, quantity)
      .input('description', sql.VarChar, description || '')
      .query(
        `INSERT INTO Products (farmer_id, name, price, quantity, description)
         VALUES (@farmerId, @name, @price, @quantity, @description)`
      );

    res.status(201).json({ message: 'Product added successfully' });
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------------
// Edit a product
// -------------------------------
router.put('/products/:id', verifyToken, verifyFarmer, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { name, price, quantity, description } = req.body;

  try {
    const pool = await getPool();
    const farmerId = req.user!.userId;

    // Ensure the product belongs to this farmer
    const check = await pool
      .request()
      .input('id', sql.Int, id)
      .input('farmerId', sql.Int, farmerId)
      .query('SELECT * FROM Products WHERE id = @id AND farmer_id = @farmerId');

    if (check.recordset.length === 0) {
      return res.status(403).json({ message: 'You can only edit your own products' });
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('name', sql.VarChar, name)
      .input('price', sql.Decimal(10, 2), price)
      .input('quantity', sql.Int, quantity)
      .input('description', sql.VarChar, description || '')
      .query(
        `UPDATE Products
         SET name = @name, price = @price, quantity = @quantity, description = @description
         WHERE id = @id`
      );

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------------
// Delete a product
// -------------------------------
router.delete('/products/:id', verifyToken, verifyFarmer, async (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const farmerId = req.user!.userId;

    // Ensure the product belongs to this farmer
    const check = await pool
      .request()
      .input('id', sql.Int, id)
      .input('farmerId', sql.Int, farmerId)
      .query('SELECT * FROM Products WHERE id = @id AND farmer_id = @farmerId');

    if (check.recordset.length === 0) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    await pool.request().input('id', sql.Int, id).query('DELETE FROM Products WHERE id = @id');

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
