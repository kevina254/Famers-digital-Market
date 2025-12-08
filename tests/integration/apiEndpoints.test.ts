import request from 'supertest';
import express from 'express';

// Mock all dependencies
jest.mock('../../src/db/config');
jest.mock('../../src/repository/farmerRepository');
jest.mock('../../src/repository/productRepository');
jest.mock('../../src/repository/orderRepository');
jest.mock('../../src/repository/paymentRepository');
jest.mock('../../src/repository/logisticsRepository');
jest.mock('../../src/repository/marketRepository');
jest.mock('../../src/services/paymentServices');
jest.mock('../../src/middleware/authMiddleware');

// Import after mocking
import farmerRoutes from '../../src/routes/farmerRoutes';
import productRoutes from '../../src/routes/productRoutes';
import orderRoutes from '../../src/routes/orderRoutes';
import paymentRoutes from '../../src/routes/paymentRoutes';
import adminRoutes from '../../src/routes/adminRoutes';
import { verifyToken, verifyFarmer, verifyAdmin } from '../../src/middleware/authMiddleware';
import * as productRepo from '../../src/repository/productRepository';
import * as orderRepo from '../../src/repository/orderRepository';
import { PaymentService } from '../../src/services/paymentServices';

describe('API Endpoints Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mock middleware
    (verifyToken as jest.Mock).mockImplementation((req: any, res, next) => {
      req.user = { userId: 1, role: 'farmer' };
      next();
    });
    (verifyFarmer as jest.Mock).mockImplementation((req: any, res, next) => next());
    (verifyAdmin as jest.Mock).mockImplementation((req: any, res, next) => next());

    // Mount routes
    app.use('/api/farmers', verifyToken, verifyFarmer, farmerRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', verifyToken, orderRoutes);
    app.use('/api/payments', verifyToken, paymentRoutes);
    app.use('/api/admin', verifyToken, verifyAdmin, adminRoutes);

    // Error handling middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(err.status || 500).json({ error: err.message });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Product Management API', () => {
    describe('POST /api/farmers/products', () => {
      it('should create a product successfully', async () => {
        const productData = {
          product_name: 'Organic Carrots',
          category: 'Vegetables',
          stock_quantity: 200,
          price: 60,
          description: 'Fresh organic carrots'
        };

        const mockProduct = { product_id: 1, ...productData, farmer_id: 1 };
        (productRepo.createProduct as jest.Mock).mockResolvedValue(mockProduct);

        const response = await request(app)
          .post('/api/farmers/products')
          .send(productData)
          .expect(201);

        expect(response.body).toHaveProperty('message', 'Product added successfully');
        expect(productRepo.createProduct).toHaveBeenCalledWith({
          ...productData,
          farmer_id: 1 // Should be set from authenticated user
        });
      });

      it('should validate required fields', async () => {
        const invalidProduct = {
          category: 'Vegetables',
          stock_quantity: 200
          // Missing product_name and price
        };

        const response = await request(app)
          .post('/api/farmers/products')
          .send(invalidProduct)
          .expect(500);

        expect(response.body).toHaveProperty('error');
      });

      it('should handle database errors', async () => {
        const productData = {
          product_name: 'Test Product',
          price: 100,
          stock_quantity: 50
        };

        (productRepo.createProduct as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

        const response = await request(app)
          .post('/api/farmers/products')
          .send(productData)
          .expect(500);

        expect(response.body).toHaveProperty('error', 'Database connection failed');
      });
    });

    describe('GET /api/products', () => {
      it('should retrieve all products', async () => {
        const mockProducts = [
          {
            product_id: 1,
            farmer_id: 1,
            product_name: 'Tomatoes',
            price: 80,
            stock_quantity: 100
          },
          {
            product_id: 2,
            farmer_id: 2,
            product_name: 'Potatoes',
            price: 40,
            stock_quantity: 200
          }
        ];

        (productRepo.getAllProducts as jest.Mock).mockResolvedValue(mockProducts);

        const response = await request(app)
          .get('/api/products')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toHaveLength(2);
        expect(response.body[0]).toHaveProperty('product_name', 'Tomatoes');
      });
    });

    describe('GET /api/products/:id', () => {
      it('should retrieve a specific product', async () => {
        const mockProduct = {
          product_id: 1,
          farmer_id: 1,
          product_name: 'Tomatoes',
          price: 80,
          stock_quantity: 100
        };

        (productRepo.getProduct as jest.Mock).mockResolvedValue(mockProduct);

        const response = await request(app)
          .get('/api/products/1')
          .expect(200);

        expect(response.body).toHaveProperty('product_name', 'Tomatoes');
        expect(response.body).toHaveProperty('price', 80);
      });

      it('should return 404 for non-existent product', async () => {
        (productRepo.getProduct as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
          .get('/api/products/999')
          .expect(404);

        expect(response.body).toHaveProperty('message', 'Product not found');
      });

      it('should validate product ID', async () => {
        const response = await request(app)
          .get('/api/products/invalid')
          .expect(400);

        expect(response.body).toHaveProperty('message', 'Invalid product ID. Must be a number.');
      });
    });
  });

  describe('Order Management API', () => {
    describe('POST /api/orders', () => {
      it('should create an order successfully', async () => {
        const orderData = {
          user_id: 1,
          product_id: 1,
          market_id: 1,
          quantity: 10,
          total_amount: 800,
          order_date: '2023-12-07',
          status: 'pending'
        };

        const mockOrder = { message: 'Order created successfully', order_id: 123 };
        (orderRepo.createOrder as jest.Mock).mockResolvedValue(mockOrder);

        const response = await request(app)
          .post('/api/orders')
          .send(orderData)
          .expect(201);

        expect(response.body).toHaveProperty('order_id', 123);
        expect(orderRepo.createOrder).toHaveBeenCalledWith(orderData);
      });
    });

    describe('GET /api/orders', () => {
      it('should retrieve user orders', async () => {
        const mockOrders = [
          {
            order_id: 1,
            user_id: 1,
            product_id: 1,
            quantity: 5,
            total_amount: 400,
            status: 'completed'
          }
        ];

        (orderRepo.getOrders as jest.Mock).mockResolvedValue(mockOrders);

        const response = await request(app)
          .get('/api/orders')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty('status', 'completed');
      });
    });
  });

  describe('Payment Management API', () => {
    describe('POST /api/payments', () => {
      it('should process payment successfully', async () => {
        const paymentData = {
          order_id: 1,
          payment_method: 'M-Pesa',
          reference: 'MP123456',
          payment_date: '2023-12-07',
          payment_status: 'completed'
        };

        (PaymentService.create as jest.Mock).mockResolvedValue(undefined);

        const response = await request(app)
          .post('/api/payments')
          .send(paymentData)
          .expect(201);

        expect(response.body).toHaveProperty('message', 'Payment created');
        expect(PaymentService.create).toHaveBeenCalledWith(paymentData);
      });
    });

    describe('GET /api/payments/user', () => {
      it('should retrieve user payments', async () => {
        const mockPayments = [
          {
            payment_id: 1,
            order_id: 1,
            payment_method: 'M-Pesa',
            payment_status: 'completed'
          }
        ];

        (PaymentService.getByUserId as jest.Mock).mockResolvedValue(mockPayments);

        const response = await request(app)
          .get('/api/payments/user')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty('payment_method', 'M-Pesa');
      });
    });
  });

  describe('Admin API', () => {
    beforeEach(() => {
      // Set admin user for admin routes
      (verifyAdmin as jest.Mock).mockImplementation((req: any, res, next) => {
        req.user = { userId: 99, role: 'admin' };
        next();
      });
    });

    describe('GET /api/admin/orders', () => {
      it('should retrieve all orders for admin', async () => {
        const mockOrders = [
          {
            order_id: 1,
            product_name: 'Tomatoes',
            customer_name: 'John Doe',
            status: 'pending'
          }
        ];

        // Mock SQL query
        const sql = require('../../src/db/config');
        sql.query = jest.fn().mockResolvedValue({ recordset: mockOrders });

        const response = await request(app)
          .get('/api/admin/orders')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty('customer_name', 'John Doe');
      });
    });

    describe('PATCH /api/admin/orders/:id/status', () => {
      it('should update order status', async () => {
        const sql = require('../../src/db/config');
        sql.query = jest.fn().mockResolvedValue({});

        const response = await request(app)
          .patch('/api/admin/orders/1/status')
          .send({ status: 'approved' })
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Order status updated successfully');
      });
    });
  });

  describe('Authentication & Authorization', () => {
    it('should require authentication for protected routes', async () => {
      // Temporarily make verifyToken fail
      (verifyToken as jest.Mock).mockImplementation((req, res, next) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app)
        .post('/api/farmers/products')
        .send({ product_name: 'Test', price: 100 })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should require farmer role for farmer routes', async () => {
      (verifyToken as jest.Mock).mockImplementation((req: any, res, next) => {
        req.user = { userId: 1, role: 'customer' }; // Wrong role
        next();
      });

      (verifyFarmer as jest.Mock).mockImplementation((req, res, next) => {
        res.status(403).json({ error: 'Forbidden: Farmer access required' });
      });

      const response = await request(app)
        .post('/api/farmers/products')
        .send({ product_name: 'Test', price: 100 })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Forbidden: Farmer access required');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      (productRepo.getAllProducts as jest.Mock).mockRejectedValue(new Error('Database connection lost'));

      const response = await request(app)
        .get('/api/products')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Database connection lost');
    });

    it('should handle validation errors', async () => {
      // Test with invalid data that should trigger service validation
      const response = await request(app)
        .post('/api/farmers/products')
        .send({
          product_name: '',
          price: -50,
          stock_quantity: -10
        })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });
});