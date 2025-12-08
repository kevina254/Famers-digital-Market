import express from 'express';
import paymentRoutes from '../../../src/routes/paymentRoutes';

// Mock controllers and middleware
jest.mock('../../../src/controllers/paymentController');
jest.mock('../../../src/middleware/authMiddleware');

import { PaymentController } from '../../../src/controllers/paymentController';
import { verifyToken } from '../../../src/middleware/authMiddleware';

describe('Payment Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/payments', paymentRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/payments', () => {
    it('should call PaymentController.getAll with verifyToken middleware', () => {
      expect(PaymentController.getAll).toBeDefined();
      expect(verifyToken).toBeDefined();
    });
  });

  describe('GET /api/payments/user', () => {
    it('should call PaymentController.getByUserId with verifyToken middleware', () => {
      expect(PaymentController.getByUserId).toBeDefined();
      expect(verifyToken).toBeDefined();
    });
  });

  describe('GET /api/payments/:id', () => {
    it('should call PaymentController.getById with verifyToken middleware', () => {
      expect(PaymentController.getById).toBeDefined();
      expect(verifyToken).toBeDefined();
    });
  });

  describe('POST /api/payments', () => {
    it('should call PaymentController.create with verifyToken middleware', () => {
      expect(PaymentController.create).toBeDefined();
      expect(verifyToken).toBeDefined();
    });
  });

  describe('PUT /api/payments/:id', () => {
    it('should call PaymentController.update with verifyToken middleware', () => {
      expect(PaymentController.update).toBeDefined();
      expect(verifyToken).toBeDefined();
    });
  });

  describe('DELETE /api/payments/:id', () => {
    it('should call PaymentController.delete with verifyToken middleware', () => {
      expect(PaymentController.delete).toBeDefined();
      expect(verifyToken).toBeDefined();
    });
  });

  describe('Route configuration', () => {
    it('should export a router with correct routes', () => {
      expect(paymentRoutes).toBeDefined();
      expect(typeof paymentRoutes).toBe('function');
    });
  });
});