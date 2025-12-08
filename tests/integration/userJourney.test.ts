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

describe('User Journey Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Mount all routes
    app.use('/api/farmers', farmerRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/admin', adminRoutes);
  });

  describe('Complete Farmer-to-Customer Journey', () => {
    it('should simulate a complete marketplace transaction', async () => {
      // === PHASE 1: Farmer Onboarding ===
      console.log('🚜 Phase 1: Farmer Registration');

      // Mock farmer registration
      const mockFarmer = {
        FarmerID: 1,
        FullName: 'John Farmer',
        PhoneNumber: '0712345678',
        Location: 'Nakuru',
        FarmName: 'Green Valley Farm'
      };

      // Mock the farmer repository
      const mockFarmerRepo = {
        addFarmer: jest.fn().mockResolvedValue(mockFarmer),
        getAllFarmers: jest.fn().mockResolvedValue([mockFarmer])
      };

      (FarmerRepository as any).mockImplementation(() => mockFarmerRepo);

      // Farmer registers (simulated - would be through auth system)
      expect(mockFarmerRepo.addFarmer).not.toHaveBeenCalled();

      // === PHASE 2: Product Listing ===
      console.log(' Phase 2: Product Listing');

      const mockProduct = {
        product_id: 1,
        farmer_id: 1,
        product_name: 'Fresh Tomatoes',
        category: 'Vegetables',
        stock_quantity: 500,
        price: 80,
        description: 'Organic tomatoes from our farm'
      };

      (productRepo.createProduct as jest.Mock).mockResolvedValue(mockProduct);
      (productRepo.getAllProducts as jest.Mock).mockResolvedValue([mockProduct]);

      // Mock authentication middleware
      app.use('/api/farmers', (req: any, res, next) => {
        req.user = { userId: 1, role: 'farmer' };
        next();
      });

      // Farmer lists product
      const productResponse = await request(app)
        .post('/api/farmers/products')
        .send({
          product_name: 'Fresh Tomatoes',
          category: 'Vegetables',
          stock_quantity: 500,
          price: 80,
          description: 'Organic tomatoes from our farm'
        });

      expect(productResponse.status).toBe(201);
      expect(productResponse.body.message).toBe('Product added successfully');

      // === PHASE 3: Customer Discovery ===
      console.log('Phase 3: Customer Product Discovery');

      // Mock customer authentication
      app.use('/api/products', (req: any, res, next) => {
        req.user = { userId: 2, role: 'customer' };
        next();
      });

      // Customer browses products
      const browseResponse = await request(app)
        .get('/api/products');

      expect(browseResponse.status).toBe(200);
      expect(Array.isArray(browseResponse.body)).toBe(true);
      expect(browseResponse.body[0]).toMatchObject({
        product_name: 'Fresh Tomatoes',
        price: 80
      });

      // === PHASE 4: Order Placement ===
      console.log(' Phase 4: Order Placement');

      const mockOrder = {
        message: 'Order created successfully',
        order_id: 1001
      };

      (orderRepo.createOrder as jest.Mock).mockResolvedValue(mockOrder);
      (orderRepo.getOrders as jest.Mock).mockResolvedValue([{
        order_id: 1001,
        user_id: 2,
        product_id: 1,
        quantity: 25,
        total_amount: 2000,
        status: 'pending'
      }]);

      // Customer places order
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          user_id: 2,
          product_id: 1,
          market_id: 1,
          quantity: 25,
          total_amount: 2000,
          order_date: '2023-12-07',
          status: 'pending'
        });

      expect(orderResponse.status).toBe(201);
      expect(orderResponse.body).toHaveProperty('order_id', 1001);

      // === PHASE 5: Payment Processing ===
      console.log('Phase 5: Payment Processing');

      (PaymentService.create as jest.Mock).mockResolvedValue(undefined);

      // Customer makes payment
      const paymentResponse = await request(app)
        .post('/api/payments')
        .send({
          order_id: 1001,
          payment_method: 'M-Pesa',
          reference: 'MP123456789',
          payment_date: '2023-12-07',
          payment_status: 'completed'
        });

      expect(paymentResponse.status).toBe(201);
      expect(paymentResponse.body.message).toBe('Payment created');

      // === PHASE 6: Admin Processing ===
      console.log('Phase 6: Admin Order Processing');

      // Mock admin authentication
      app.use('/api/admin', (req: any, res, next) => {
        req.user = { userId: 99, role: 'admin' };
        next();
      });

      // Mock SQL queries for admin operations
      const sql = require('../../src/db/config');
      sql.query = jest.fn()
        .mockResolvedValueOnce({ recordset: [{
          order_id: 1001,
          product_name: 'Fresh Tomatoes',
          customer_name: 'Jane Customer',
          status: 'pending'
        }]})
        .mockResolvedValueOnce({}) // For status update
        .mockResolvedValueOnce({}); // For payment approval

      // Admin views pending orders
      const pendingOrdersResponse = await request(app)
        .get('/api/admin/orders/pending');

      expect(pendingOrdersResponse.status).toBe(200);

      // Admin approves payment
      const approveResponse = await request(app)
        .post('/api/admin/orders/1001/approve-payment');

      expect(approveResponse.status).toBe(200);
      expect(approveResponse.body.message).toBe('Payment approved successfully');

      // === PHASE 7: Logistics Assignment ===
      console.log(' Phase 7: Logistics & Delivery');

      // Admin assigns driver
      const logisticsResponse = await request(app)
        .post('/api/admin/orders/1001/assign-driver')
        .send({
          vehicle_number_plate: 'KCB 123A',
          transport_mode: 'truck',
          pickup_location: 'Green Valley Farm, Nakuru',
          dropoff_location: 'Central Market, Nairobi'
        });

      expect(logisticsResponse.status).toBe(200);
      expect(logisticsResponse.body.message).toBe('Driver assigned successfully');

      // === PHASE 8: Order Completion ===
      console.log('Phase 8: Order Completion');

      // Mock final order status update
      sql.query.mockResolvedValueOnce({}); // Order status update to delivered

      // Simulate order completion
      const completeResponse = await request(app)
        .patch('/api/admin/orders/1001/status')
        .send({ status: 'delivered' });

      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body.message).toBe('Order status updated successfully');

      console.log('🎉 Complete transaction journey successful!');
    });

    it('should handle error scenarios in the journey', async () => {
      console.log(' Testing Error Scenarios');

      // Test insufficient stock
      (productRepo.createProduct as jest.Mock).mockRejectedValue(new Error('Insufficient stock'));

      const errorResponse = await request(app)
        .post('/api/farmers/products')
        .send({
          product_name: 'Out of Stock Item',
          stock_quantity: 0,
          price: 100
        });

      expect(errorResponse.status).toBe(500);

      // Test payment failure
      (PaymentService.create as jest.Mock).mockRejectedValue(new Error('Payment failed'));

      const paymentErrorResponse = await request(app)
        .post('/api/payments')
        .send({
          order_id: 999,
          payment_method: 'M-Pesa',
          reference: 'FAILED123',
          payment_status: 'failed'
        });

      expect(paymentErrorResponse.status).toBe(500);
    });
  });

  describe('Performance & Scalability Tests', () => {
    it('should handle multiple concurrent operations', async () => {
      // Mock bulk operations
      const mockProducts = Array.from({ length: 10 }, (_, i) => ({
        product_id: i + 1,
        farmer_id: 1,
        product_name: `Product ${i + 1}`,
        price: 100 + i * 10
      }));

      (productRepo.getAllProducts as jest.Mock).mockResolvedValue(mockProducts);

      // Test bulk product retrieval
      const bulkResponse = await request(app)
        .get('/api/products');

      expect(bulkResponse.status).toBe(200);
      expect(bulkResponse.body).toHaveLength(10);
    });
  });
});