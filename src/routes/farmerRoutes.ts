import express from 'express';
import sql from 'mssql';
import { getPool } from '../db/config';
import { verifyToken, verifyFarmer, AuthRequest } from '../middleware/authMiddleware';
import * as orderController from '../controllers/orderController';

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
      .query('SELECT * FROM Product WHERE farmer_id = @farmerId');

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
      .input('product_name', sql.NVarChar(200), name)
      .input('price', sql.Decimal(18, 2), price)
      .input('stock_quantity', sql.Int, quantity)
      .input('description', sql.NVarChar(1000), description || '')
      .query(
        `INSERT INTO Product (farmer_id, product_name, price, stock_quantity, description)
         VALUES (@farmerId, @product_name, @price, @stock_quantity, @description)`
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
      .query('SELECT * FROM Product WHERE product_id = @id AND farmer_id = @farmerId');

    if (check.recordset.length === 0) {
      return res.status(403).json({ message: 'You can only edit your own products' });
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('product_name', sql.NVarChar(200), name)
      .input('price', sql.Decimal(18, 2), price)
      .input('stock_quantity', sql.Int, quantity)
      .input('description', sql.NVarChar(1000), description || '')
      .query(
        `UPDATE Product
         SET product_name = @product_name, price = @price, stock_quantity = @stock_quantity, description = @description
         WHERE product_id = @id`
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
      .query('SELECT * FROM Product WHERE product_id = @id AND farmer_id = @farmerId');

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

// -------------------------------
// Get orders for farmer's products
// -------------------------------
router.get('/orders', verifyToken, verifyFarmer, orderController.getOrdersByFarmer);

export default router;
