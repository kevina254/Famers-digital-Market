import * as orderRepo from '../../../src/repository/orderRepository';
import { getPool } from '../../../src/db/config';
import sql from '../../../src/db/config';

jest.mock('../../../src/db/config');

describe('Order Repository', () => {
  let mockPool: any;
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn()
    };
    mockPool = {
      request: jest.fn(() => mockRequest)
    };
    (getPool as jest.Mock).mockResolvedValue(mockPool);
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const order: orderRepo.NewOrder = {
        user_id: 1,
        product_id: 1,
        market_id: 1,
        quantity: 10,
        total_amount: 500,
        order_date: '2023-01-01',
        status: 'pending'
      };
      const mockResult = { recordset: [{ order_id: 1 }] };
      mockRequest.query.mockResolvedValue(mockResult);

      const result = await orderRepo.createOrder(order);

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('user_id', order.user_id);
      expect(mockRequest.input).toHaveBeenCalledWith('product_id', order.product_id);
      expect(mockRequest.input).toHaveBeenCalledWith('market_id', order.market_id);
      expect(mockRequest.input).toHaveBeenCalledWith('quantity', order.quantity);
      expect(mockRequest.input).toHaveBeenCalledWith('total_amount', order.total_amount);
      expect(mockRequest.input).toHaveBeenCalledWith('order_date', order.order_date);
      expect(mockRequest.input).toHaveBeenCalledWith('status', order.status);
      expect(result).toEqual({ message: 'Order created successfully', order_id: 1 });
    });
  });

  describe('getOrders', () => {
    it('should return orders for a user', async () => {
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
      mockRequest.query.mockResolvedValue({ recordset: mockOrders });

      const result = await orderRepo.getOrders(1);

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('userId', 1);
      expect(mockRequest.query).toHaveBeenCalledWith('SELECT * FROM OrderTable WHERE user_id = @userId');
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getOrdersByFarmer', () => {
    it('should return orders for farmer\'s products', async () => {
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
      mockRequest.query.mockResolvedValue({ recordset: mockOrders });

      const result = await orderRepo.getOrdersByFarmer(1);

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('farmerId', 1);
      expect(mockRequest.query).toHaveBeenCalledWith(`
      SELECT o.*, p.product_name
      FROM OrderTable o
      JOIN Product p ON o.product_id = p.product_id
      WHERE p.farmer_id = @farmerId
    `);
      expect(result).toEqual(mockOrders);
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
      mockRequest.query.mockResolvedValue({ recordset: [mockOrder] });

      const result = await orderRepo.getOrderById(1);

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('id', 1);
      expect(mockRequest.query).toHaveBeenCalledWith('SELECT * FROM OrderTable WHERE order_id = @id');
      expect(result).toEqual(mockOrder);
    });
  });

  describe('updateOrder', () => {
    it('should update an order', async () => {
      const updateData = {
        status: 'completed',
        quantity: 15,
        total_amount: 750
      };
      mockRequest.query.mockResolvedValue({});

      const result = await orderRepo.updateOrder(1, updateData);

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('id', 1);
      expect(mockRequest.input).toHaveBeenCalledWith('status', updateData.status);
      expect(mockRequest.input).toHaveBeenCalledWith('quantity', updateData.quantity);
      expect(mockRequest.input).toHaveBeenCalledWith('total_amount', updateData.total_amount);
      expect(result).toEqual({ message: 'Order updated successfully' });
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order', async () => {
      mockRequest.query.mockResolvedValue({});

      const result = await orderRepo.deleteOrder(1);

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('id', 1);
      expect(mockRequest.query).toHaveBeenCalledWith('DELETE FROM OrderTable WHERE order_id = @id');
      expect(result).toEqual({ message: 'Order deleted successfully' });
    });
  });
});