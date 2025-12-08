import { Request, Response } from 'express';
import { getAllOrders, getPendingOrdersForPayment, updateOrderStatus, approvePayment, assignDriver, getLogisticsByOrder, getAllLogistics, getAllDrivers } from '../../../src/controllers/adminController';
import sql from '../../../src/db/config';
import { PaymentService } from '../../../src/services/paymentServices';

jest.mock('../../../src/db/config');
jest.mock('../../../src/services/paymentServices');

describe('Admin Controller', () => {
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

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      const mockOrders = [
        {
          order_id: 1,
          product_name: 'Tomatoes',
          customer_name: 'John Doe',
          status: 'pending'
        }
      ];

      const mockQueryResult = { recordset: mockOrders };
      (sql.query as jest.Mock).mockResolvedValue(mockQueryResult);

      await getAllOrders(mockRequest as Request, mockResponse as Response);

      expect(sql.query).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrders);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      (sql.query as jest.Mock).mockRejectedValue(error);

      await getAllOrders(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Failed to fetch orders', error });
    });
  });

  describe('approvePayment', () => {
    it('should approve payment successfully', async () => {
      mockRequest.params = { id: '1' };

      (sql.query as jest.Mock).mockResolvedValue({});
      (PaymentService.create as jest.Mock).mockResolvedValue(undefined);

      await approvePayment(mockRequest as Request, mockResponse as Response);

      expect(sql.query).toHaveBeenCalledTimes(1); // Only one sql.query call (update order)
      expect(PaymentService.create).toHaveBeenCalledWith({
        order_id: 1,
        payment_method: 'Admin Approved',
        reference: '',
        payment_date: expect.any(String),
        payment_status: 'completed',
      });
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Payment approved successfully' });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockRequest.params = { id: '1' };

      (sql.query as jest.Mock).mockRejectedValue(error);

      await approvePayment(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Failed to approve payment', error });
    });
  });

  // Add basic tests for other functions
  describe('getPendingOrdersForPayment', () => {
    it('should return pending orders', async () => {
      const mockOrders = [{ order_id: 1, status: 'pending' }];
      const mockQueryResult = { recordset: mockOrders };
      (sql as any).query = jest.fn().mockResolvedValue(mockQueryResult);

      await getPendingOrdersForPayment(mockRequest as Request, mockResponse as Response);

      expect((sql as any).query).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrders);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { status: 'completed' };

      (sql.query as jest.Mock).mockResolvedValue({});

      await updateOrderStatus(mockRequest as Request, mockResponse as Response);

      expect(sql.query).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Order status updated successfully' });
    });
  });

  describe('assignDriver', () => {
    it('should assign driver successfully', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        vehicle_number_plate: 'ABC123',
        transport_mode: 'truck',
        pickup_location: 'Farm A',
        dropoff_location: 'Market B'
      };

      (sql.query as jest.Mock).mockResolvedValue({});

      await assignDriver(mockRequest as Request, mockResponse as Response);

      expect(sql.query).toHaveBeenCalledTimes(2); // Insert logistics + update order
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Driver assigned successfully' });
    });
  });

  describe('getLogisticsByOrder', () => {
    it('should return logistics for order', async () => {
      const mockLogistics = { logistics_id: 1, order_id: 1 };
      const mockQueryResult = { recordset: [mockLogistics] };
      mockRequest.params = { id: '1' };

      (sql.query as jest.Mock).mockResolvedValue(mockQueryResult);

      await getLogisticsByOrder(mockRequest as Request, mockResponse as Response);

      expect(sql.query).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockLogistics);
    });
  });

  describe('getAllLogistics', () => {
    it('should return all logistics', async () => {
      const mockLogistics = [{ logistics_id: 1, order_status: 'shipped' }];
      const mockQueryResult = { recordset: mockLogistics };
      (sql.query as jest.Mock).mockResolvedValue(mockQueryResult);

      await getAllLogistics(mockRequest as Request, mockResponse as Response);

      expect(sql.query).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockLogistics);
    });
  });

  describe('getAllDrivers', () => {
    it('should return all drivers', async () => {
      const mockDrivers = [{ user_id: 1, role: 'driver' }];
      const mockQueryResult = { recordset: mockDrivers };
      (sql.query as jest.Mock).mockResolvedValue(mockQueryResult);

      await getAllDrivers(mockRequest as Request, mockResponse as Response);

      expect(sql.query).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockDrivers);
    });
  });
});