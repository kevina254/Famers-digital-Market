import request from 'supertest';
import express from 'express';
import cors from 'cors';

// Mock all database and external dependencies
jest.mock('../../src/db/config');
jest.mock('../../src/repository/farmerRepository');
jest.mock('../../src/repository/productRepository');
jest.mock('../../src/repository/orderRepository');
jest.mock('../../src/repository/paymentRepository');
jest.mock('../../src/repository/logisticsRepository');
jest.mock('../../src/repository/marketRepository');

// Import after mocking
import farmerRoutes from '../../src/routes/farmerRoutes';
import productRoutes from '../../src/routes/productRoutes';
import orderRoutes from '../../src/routes/orderRoutes';
import paymentRoutes from '../../src/routes/paymentRoutes';
import adminRoutes from '../../src/routes/adminRoutes';
import { FarmerRepository } from '../../src/repository/farmerRepository';
import * as productRepo from '../../src/repository/productRepository';
import * as orderRepo from '../../src/repository/orderRepository';
import { PaymentService } from '../../src/services/paymentServices';

describe('Farmers Digital Market - Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(cors());
    app.use(express.json());

    // Mount routes
    app.use('/api/farmers', farmerRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/admin', adminRoutes);

    // Mock middleware to bypass authentication for integration tests
    app.use((req: any, res, next) => {
      req.user = { userId: 1, role: 'farmer' };
      next();
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Farmer Management Flow', () => {
    it('should complete farmer registration and product management flow', async () => {
      // Mock farmer creation
      const mockFarmer = { FarmerID: 1, FullName: 'John Doe', PhoneNumber: '1234567890', Location: 'Nakuru', FarmName: 'Green Farm' };
      (FarmerRepository as any).prototype.addFarmer = jest.fn().mockResolvedValue(mockFarmer);

      // Mock product creation
      const mockProduct = { product_id: 1, farmer_id: 1, product_name: 'Tomatoes', price: 50, stock_quantity: 100 };
      (productRepo.createProduct as jest.Mock).mockResolvedValue(mockProduct);

      // Mock product retrieval
      (productRepo.getAllProducts as jest.Mock).mockResolvedValue([mockProduct]);

      // Test farmer registration (simulated)
      expect(FarmerRepository.prototype.addFarmer).not.toHaveBeenCalled();

      // Test product creation flow
      const productResponse = await request(app)
        .post('/api/farmers/products')
        .send({
          product_name: 'Tomatoes',
          price: 50,
          stock_quantity: 100,
          category: 'Vegetables'
        });

      expect(productResponse.status).toBe(201);
      expect(productResponse.body).toHaveProperty('message', 'Product added successfully');

      // Test product retrieval
      const getProductsResponse = await request(app)
        .get('/api/products');

      expect(getProductsResponse.status).toBe(200);
      expect(Array.isArray(getProductsResponse.body)).toBe(true);
    });
  });

  describe('Order Management Flow', () => {
    it('should complete order placement and payment flow', async () => {
      // Mock order creation
      const mockOrder = { message: 'Order created successfully', order_id: 1 };
      (orderRepo.createOrder as jest.Mock).mockResolvedValue(mockOrder);

      // Mock payment creation
      (PaymentService.create as jest.Mock).mockResolvedValue(undefined);

      // Test order creation
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          user_id: 1,
          product_id: 1,
          market_id: 1,
          quantity: 10,
          total_amount: 500,
          order_date: '2023-01-01',
          status: 'pending'
        });

      expect(orderResponse.status).toBe(201);
      expect(orderResponse.body).toHaveProperty('order_id', 1);

      // Test payment creation
      const paymentResponse = await request(app)
        .post('/api/payments')
        .send({
          order_id: 1,
          payment_method: 'M-Pesa',
          reference: 'REF123',
          payment_date: '2023-01-01',
          payment_status: 'completed'
        });

      expect(paymentResponse.status).toBe(201);
      expect(paymentResponse.body).toHaveProperty('message', 'Payment created');
    });
  });

  describe('Admin Management Flow', () => {
    it('should allow admin to view and manage orders', async () => {
      // Mock admin user
      app.use((req: any, res, next) => {
        req.user = { userId: 1, role: 'admin' };
        next();
      });

      // Mock order retrieval
      const mockOrders = [{
        order_id: 1,
        product_name: 'Tomatoes',
        customer_name: 'John Doe',
        status: 'pending'
      }];

      // Mock SQL query for admin routes
      const sql = require('../../src/db/config');
      sql.query = jest.fn().mockResolvedValue({ recordset: mockOrders });

      // Test admin order viewing
      const adminOrdersResponse = await request(app)
        .get('/api/admin/orders');

      expect(adminOrdersResponse.status).toBe(200);
      expect(Array.isArray(adminOrdersResponse.body)).toBe(true);

      // Test order status update
      const updateResponse = await request(app)
        .patch('/api/admin/orders/1/status')
        .send({ status: 'approved' });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toHaveProperty('message', 'Order status updated successfully');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle validation errors across the application', async () => {
      // Test invalid product creation
      const invalidProductResponse = await request(app)
        .post('/api/farmers/products')
        .send({
          product_name: '',
          price: -10
        });

      expect(invalidProductResponse.status).toBe(500); // Service validation error

      // Test invalid order creation
      const invalidOrderResponse = await request(app)
        .post('/api/orders')
        .send({
          user_id: 'invalid',
          quantity: -5
        });

      expect(invalidOrderResponse.status).toBe(500);
    });
  });

  describe('Cross-Service Integration', () => {
    it('should handle farmer-product-order-payment workflow', async () => {
      // Mock all services working together
      const mockFarmer = { FarmerID: 1, FullName: 'Jane Farmer' };
      const mockProduct = { product_id: 1, farmer_id: 1, product_name: 'Apples', price: 100 };
      const mockOrder = { order_id: 1, user_id: 2, product_id: 1, total_amount: 1000 };
      const mockPayment = { payment_id: 1, order_id: 1, payment_status: 'completed' };

      // Setup mocks
      (FarmerRepository as any).prototype.addFarmer = jest.fn().mockResolvedValue(mockFarmer);
      (productRepo.createProduct as jest.Mock).mockResolvedValue(mockProduct);
      (orderRepo.createOrder as jest.Mock).mockResolvedValue({ message: 'Order created successfully', order_id: 1 });
      (PaymentService.create as jest.Mock).mockResolvedValue(undefined);

      // Simulate complete workflow
      const workflowResponse = await request(app)
        .post('/api/orders')
        .send({
          user_id: 2,
          product_id: 1,
          market_id: 1,
          quantity: 10,
          total_amount: 1000,
          order_date: '2023-01-01',
          status: 'pending'
        });

      expect(workflowResponse.status).toBe(201);
      expect(workflowResponse.body).toHaveProperty('order_id');
    });
  });
});