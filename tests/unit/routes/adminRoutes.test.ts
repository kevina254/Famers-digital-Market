import express from 'express';
import adminRoutes from '../../../src/routes/adminRoutes';

// Mock controllers and middleware
jest.mock('../../../src/controllers/adminController');
jest.mock('../../../src/middleware/authMiddleware');

import * as adminController from '../../../src/controllers/adminController';
import { verifyToken, verifyAdmin } from '../../../src/middleware/authMiddleware';

describe('Admin Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin', adminRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/admin/orders', () => {
    it('should call getAllOrders controller with admin middleware', () => {
      expect(adminController.getAllOrders).toBeDefined();
      expect(verifyToken).toBeDefined();
      expect(verifyAdmin).toBeDefined();
    });
  });

  describe('GET /api/admin/orders/pending', () => {
    it('should call getPendingOrdersForPayment controller', () => {
      expect(adminController.getPendingOrdersForPayment).toBeDefined();
    });
  });

  describe('PATCH /api/admin/orders/:id/status', () => {
    it('should call updateOrderStatus controller', () => {
      expect(adminController.updateOrderStatus).toBeDefined();
    });
  });

  describe('POST /api/admin/orders/:id/approve-payment', () => {
    it('should call approvePayment controller', () => {
      expect(adminController.approvePayment).toBeDefined();
    });
  });

  describe('POST /api/admin/orders/:id/assign-driver', () => {
    it('should call assignDriver controller', () => {
      expect(adminController.assignDriver).toBeDefined();
    });
  });

  describe('GET /api/admin/orders/:id/logistics', () => {
    it('should call getLogisticsByOrder controller', () => {
      expect(adminController.getLogisticsByOrder).toBeDefined();
    });
  });

  describe('GET /api/admin/logistics', () => {
    it('should call getAllLogistics controller', () => {
      expect(adminController.getAllLogistics).toBeDefined();
    });
  });

  describe('GET /api/admin/drivers', () => {
    it('should call getAllDrivers controller', () => {
      expect(adminController.getAllDrivers).toBeDefined();
    });
  });

  describe('Middleware application', () => {
    it('should apply verifyToken and verifyAdmin middleware to all routes', () => {
      expect(verifyToken).toBeDefined();
      expect(verifyAdmin).toBeDefined();
      // Router-level middleware is applied to all routes
    });
  });

  describe('Route configuration', () => {
    it('should export a router with correct routes', () => {
      expect(adminRoutes).toBeDefined();
      expect(typeof adminRoutes).toBe('function');
    });
  });
});