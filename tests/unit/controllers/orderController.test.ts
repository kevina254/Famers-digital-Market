import { Request, Response } from 'express';
import { createOrder, getOrders, getOrdersByFarmer, getOrderById, updateOrder, deleteOrder } from '../../../src/controllers/orderController';
import * as orderService from '../../../src/services/orderServices';

jest.mock('../../../src/services/orderServices');

describe('Order Controller', () => {
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

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const orderData = {
        user_id: 1,
        product_id: 1,
        market_id: 1,
        quantity: 10,
        total_amount: 500,
        order_date: '2023-01-01',
        status: 'pending'
      };
      const expectedResult = { message: 'Order created successfully', order_id: 1 };

      mockRequest.body = orderData;
      (orderService.createOrder as jest.Mock).mockResolvedValue(expectedResult);

      await createOrder(mockRequest as Request, mockResponse as Response);

      expect(orderService.createOrder).toHaveBeenCalledWith(orderData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockRequest.body = { user_id: 1 };

      (orderService.createOrder as jest.Mock).mockRejectedValue(error);

      await createOrder(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getOrders', () => {
    it('should return orders for authenticated user', async () => {
      const mockOrders = [
        {
          order_id: 1,
          user_id: 1,
          product_id: 1,
          market_id: 1,
          quantity: 10,
          total_amount: 500,
          order_date: '2023-01-01',
          status: 'pending'
        }
      ];
      mockRequest = { user: { userId: 1 } } as any;

      (orderService.getOrders as jest.Mock).mockResolvedValue(mockOrders);

      await getOrders(mockRequest as Request, mockResponse as Response);

      expect(orderService.getOrders).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrders);
    });

    it('should return 401 if user not authenticated', async () => {
      mockRequest = {};

      await getOrders(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });
  });

  describe('getOrdersByFarmer', () => {
    it('should return orders for farmer', async () => {
      const mockOrders = [
        {
          order_id: 1,
          user_id: 1,
          product_id: 1,
          market_id: 1,
          quantity: 10,
          total_amount: 500,
          order_date: '2023-01-01',
          status: 'pending',
          product_name: 'Tomatoes'
        }
      ];
      mockRequest = { user: { userId: 1 } } as any;

      (orderService.getOrdersByFarmer as jest.Mock).mockResolvedValue(mockOrders);

      await getOrdersByFarmer(mockRequest as Request, mockResponse as Response);

      expect(orderService.getOrdersByFarmer).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrders);
    });

    it('should return 401 if user not authenticated', async () => {
      mockRequest = {};

      await getOrdersByFarmer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
    });
  });

  describe('getOrderById', () => {
    it('should return order by ID', async () => {
      const mockOrder = {
        order_id: 1,
        user_id: 1,
        product_id: 1,
        market_id: 1,
        quantity: 10,
        total_amount: 500,
        order_date: '2023-01-01',
        status: 'pending'
      };
      mockRequest.params = { id: '1' };

      (orderService.getOrderById as jest.Mock).mockResolvedValue(mockOrder);

      await getOrderById(mockRequest as Request, mockResponse as Response);

      expect(orderService.getOrderById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockOrder);
    });

    it('should return 404 if order not found', async () => {
      mockRequest.params = { id: '1' };

      (orderService.getOrderById as jest.Mock).mockResolvedValue(null);

      await getOrderById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Order not found' });
    });
  });

  describe('updateOrder', () => {
    it('should update an order', async () => {
      const updateData = { status: 'completed' };
      const expectedResult = { message: 'Order updated successfully' };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      (orderService.updateOrder as jest.Mock).mockResolvedValue(expectedResult);

      await updateOrder(mockRequest as Request, mockResponse as Response);

      expect(orderService.updateOrder).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order', async () => {
      const expectedResult = { message: 'Order deleted successfully' };

      mockRequest.params = { id: '1' };
      (orderService.deleteOrder as jest.Mock).mockResolvedValue(expectedResult);

      await deleteOrder(mockRequest as Request, mockResponse as Response);

      expect(orderService.deleteOrder).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });
  });
});