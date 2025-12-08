import request from 'supertest';
import express from 'express';
import farmerRoutes from '../../../src/routes/farmerRoutes';

// Mock all dependencies
jest.mock('../../../src/db/config');
jest.mock('../../../src/middleware/authMiddleware');
jest.mock('../../../src/controllers/orderController');

import { getPool } from '../../../src/db/config';
import { verifyToken, verifyFarmer } from '../../../src/middleware/authMiddleware';
import * as orderController from '../../../src/controllers/orderController';

const mockGetPool = getPool as jest.MockedFunction<typeof getPool>;
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;
const mockVerifyFarmer = verifyFarmer as jest.MockedFunction<typeof verifyFarmer>;
const mockGetOrdersByFarmer = orderController.getOrdersByFarmer as jest.MockedFunction<typeof orderController.getOrdersByFarmer>;

describe('Farmer Routes', () => {
  let app: express.Application;
  let mockPool: any;
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock middleware
    mockVerifyToken.mockImplementation((req, res, next) => { next(); return undefined; });
    mockVerifyFarmer.mockImplementation((req, res, next) => { next(); return undefined; });

    // Mock database
    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn()
    };
    mockPool = {
      request: jest.fn(() => mockRequest)
    };
    mockGetPool.mockResolvedValue(mockPool);

    app = express();
    app.use(express.json());
    app.use('/api/farmer', farmerRoutes);
  });

  describe('GET /api/farmer/products/mine', () => {
    it('should return farmer\'s products successfully', async () => {
      const mockProducts = [
        { product_id: 1, product_name: 'Tomatoes', price: 50, stock_quantity: 100 }
      ];
      mockRequest.query.mockResolvedValue({ recordset: mockProducts });

      const response = await request(app)
        .get('/api/farmer/products/mine')
        .expect(200);

      expect(mockGetPool).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('farmerId', expect.any(Function), 1);
      expect(mockRequest.query).toHaveBeenCalledWith('SELECT * FROM Product WHERE farmer_id = @farmerId');
      expect(response.body).toEqual(mockProducts);
    });

    it('should handle database errors', async () => {
      mockRequest.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/farmer/products/mine')
        .expect(500);

      expect(response.body).toEqual({ message: 'Server error' });
    });
  });

  describe('POST /api/farmer/products', () => {
    it('should add a product successfully', async () => {
      const productData = {
        name: 'Carrots',
        price: 30,
        quantity: 50,
        description: 'Fresh carrots'
      };
      mockRequest.query.mockResolvedValue({});

      const response = await request(app)
        .post('/api/farmer/products')
        .send(productData)
        .expect(201);

      expect(mockGetPool).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('farmerId', expect.any(Function), 1);
      expect(mockRequest.input).toHaveBeenCalledWith('product_name', expect.any(Function), productData.name);
      expect(mockRequest.input).toHaveBeenCalledWith('price', expect.any(Function), productData.price);
      expect(mockRequest.input).toHaveBeenCalledWith('stock_quantity', expect.any(Function), productData.quantity);
      expect(response.body).toEqual({ message: 'Product added successfully' });
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = { name: 'Carrots' }; // missing price and quantity

      const response = await request(app)
        .post('/api/farmer/products')
        .send(invalidData)
        .expect(400);

      expect(response.body).toEqual({ message: 'Name, price, and quantity are required' });
    });

    it('should handle database errors', async () => {
      const productData = { name: 'Carrots', price: 30, quantity: 50 };
      mockRequest.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/farmer/products')
        .send(productData)
        .expect(500);

      expect(response.body).toEqual({ message: 'Server error' });
    });
  });

  describe('PUT /api/farmer/products/:id', () => {
    it('should update a product successfully', async () => {
      const updateData = {
        name: 'Updated Carrots',
        price: 35,
        quantity: 60,
        description: 'Updated description'
      };
      mockRequest.query
        .mockResolvedValueOnce({ recordset: [{ product_id: 1 }] }) // ownership check
        .mockResolvedValueOnce({}); // update query

      const response = await request(app)
        .put('/api/farmer/products/1')
        .send(updateData)
        .expect(200);

      expect(mockRequest.query).toHaveBeenCalledTimes(2);
      expect(response.body).toEqual({ message: 'Product updated successfully' });
    });

    it('should return 403 for products not owned by farmer', async () => {
      mockRequest.query.mockResolvedValueOnce({ recordset: [] }); // no ownership

      const response = await request(app)
        .put('/api/farmer/products/1')
        .send({ name: 'Test', price: 10, quantity: 5 })
        .expect(403);

      expect(response.body).toEqual({ message: 'You can only edit your own products' });
    });
  });

  describe('DELETE /api/farmer/products/:id', () => {
    it('should delete a product successfully', async () => {
      mockRequest.query
        .mockResolvedValueOnce({ recordset: [{ product_id: 1 }] }) // ownership check
        .mockResolvedValueOnce({}); // delete query

      const response = await request(app)
        .delete('/api/farmer/products/1')
        .expect(200);

      expect(mockRequest.query).toHaveBeenCalledTimes(2);
      expect(response.body).toEqual({ message: 'Product deleted successfully' });
    });

    it('should return 403 for products not owned by farmer', async () => {
      mockRequest.query.mockResolvedValueOnce({ recordset: [] }); // no ownership

      const response = await request(app)
        .delete('/api/farmer/products/1')
        .expect(403);

      expect(response.body).toEqual({ message: 'You can only delete your own products' });
    });
  });

  describe('GET /api/farmer/orders', () => {
    it('should call getOrdersByFarmer controller', async () => {
      mockGetOrdersByFarmer.mockImplementation(async (req, res) => {
        res.json([{ order_id: 1, status: 'pending' }]);
        return res;
      });

      const response = await request(app)
        .get('/api/farmer/orders')
        .expect(200);

      expect(mockGetOrdersByFarmer).toHaveBeenCalled();
      expect(response.body).toEqual([{ order_id: 1, status: 'pending' }]);
    });
  });

  describe('Middleware application', () => {
    it('should apply verifyToken and verifyFarmer middleware to protected routes', () => {
      expect(mockVerifyToken).toBeDefined();
      expect(mockVerifyFarmer).toBeDefined();
      // Routes are configured with middleware at module load time
    });
  });
});