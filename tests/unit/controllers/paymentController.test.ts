import { Request, Response } from 'express';
import { PaymentController } from '../../../src/controllers/paymentController';
import { PaymentService } from '../../../src/services/paymentServices';

jest.mock('../../../src/services/paymentServices');

describe('Payment Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all payments', async () => {
      const mockPayments = [
        {
          payment_id: 1,
          order_id: 1,
          payment_method: 'M-Pesa',
          reference: 'REF123',
          payment_date: '2023-01-01',
          payment_status: 'completed'
        }
      ];

      (PaymentService.getAll as jest.Mock).mockResolvedValue(mockPayments);

      await PaymentController.getAll(mockRequest as Request, mockResponse as Response);

      expect(PaymentService.getAll).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockPayments);
    });
  });

  describe('getById', () => {
    it('should return payment by ID', async () => {
      const mockPayment = {
        payment_id: 1,
        order_id: 1,
        payment_method: 'M-Pesa',
        reference: 'REF123',
        payment_date: '2023-01-01',
        payment_status: 'completed'
      };
      mockRequest.params = { id: '1' };

      (PaymentService.getById as jest.Mock).mockResolvedValue(mockPayment);

      await PaymentController.getById(mockRequest as Request, mockResponse as Response);

      expect(PaymentService.getById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPayment);
    });

    it('should return 404 if payment not found', async () => {
      mockRequest.params = { id: '1' };

      (PaymentService.getById as jest.Mock).mockResolvedValue(null);

      await PaymentController.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith('Payment not found');
    });
  });

  describe('getByUserId', () => {
    it('should return payments by user ID', async () => {
      const mockPayments = [
        {
          payment_id: 1,
          order_id: 1,
          payment_method: 'M-Pesa',
          reference: 'REF123',
          payment_date: '2023-01-01',
          payment_status: 'completed'
        }
      ];
      mockRequest = { user: { userId: 1 } } as any;

      (PaymentService.getByUserId as jest.Mock).mockResolvedValue(mockPayments);

      await PaymentController.getByUserId(mockRequest as Request, mockResponse as Response);

      expect(PaymentService.getByUserId).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPayments);
    });

    it('should return 401 if user not authenticated', async () => {
      mockRequest = {};

      await PaymentController.getByUserId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });
  });

  describe('create', () => {
    it('should create a payment', async () => {
      const paymentData = {
        order_id: 1,
        payment_method: 'M-Pesa',
        reference: 'REF123',
        payment_date: '2023-01-01',
        payment_status: 'pending'
      };
      mockRequest.body = paymentData;

      (PaymentService.create as jest.Mock).mockResolvedValue(undefined);

      await PaymentController.create(mockRequest as Request, mockResponse as Response);

      expect(PaymentService.create).toHaveBeenCalledWith(paymentData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith('Payment created');
    });
  });

  describe('update', () => {
    it('should update a payment', async () => {
      const updateData = { payment_status: 'completed' };
      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;

      (PaymentService.update as jest.Mock).mockResolvedValue(undefined);

      await PaymentController.update(mockRequest as Request, mockResponse as Response);

      expect(PaymentService.update).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.send).toHaveBeenCalledWith('Payment updated');
    });
  });

  describe('delete', () => {
    it('should delete a payment', async () => {
      mockRequest.params = { id: '1' };

      (PaymentService.delete as jest.Mock).mockResolvedValue(undefined);

      await PaymentController.delete(mockRequest as Request, mockResponse as Response);

      expect(PaymentService.delete).toHaveBeenCalledWith(1);
      expect(mockResponse.send).toHaveBeenCalledWith('Payment deleted');
    });
  });
});