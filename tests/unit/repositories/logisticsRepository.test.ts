import { logisticsRepository } from '../../../src/repository/logisticsRepository';
import { getPool } from '../../../src/db/config';
import sql from '../../../src/db/config';

jest.mock('../../../src/db/config');

describe('Logistics Repository', () => {
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

  describe('getAllLogistics', () => {
    it('should return all logistics records', async () => {
      const mockLogistics = [
        {
          logistics_id: 1,
          order_id: 1,
          driver_name: 'John Driver',
          truck_number: 'ABC123',
          status: 'in_transit',
          delivery_date: new Date('2023-01-01')
        }
      ];
      mockRequest.query.mockResolvedValue({ recordset: mockLogistics });

      const result = await logisticsRepository.getAllLogistics();

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.query).toHaveBeenCalledWith('SELECT * FROM Logistics');
      expect(result).toEqual(mockLogistics);
    });
  });

  describe('getLogisticsById', () => {
    it('should return logistics record by ID', async () => {
      const mockLogistics = {
        logistics_id: 1,
        order_id: 1,
        driver_name: 'John Driver',
        truck_number: 'ABC123',
        status: 'in_transit',
        delivery_date: new Date('2023-01-01')
      };
      mockRequest.query.mockResolvedValue({ recordset: [mockLogistics] });

      const result = await logisticsRepository.getLogisticsById(1);

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('logistics_id', 1);
      expect(mockRequest.query).toHaveBeenCalledWith('SELECT * FROM Logistics WHERE logistics_id = @logistics_id');
      expect(result).toEqual(mockLogistics);
    });
  });

  describe('createLogistics', () => {
    it('should create a logistics record', async () => {
      const logistics = {
        order_id: 1,
        driver_name: 'John Driver',
        truck_number: 'ABC123',
        status: 'pending',
        delivery_date: new Date('2023-01-01')
      };
      mockRequest.query.mockResolvedValue({});

      const result = await logisticsRepository.createLogistics(logistics);

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('order_id', logistics.order_id);
      expect(mockRequest.input).toHaveBeenCalledWith('driver_name', logistics.driver_name);
      expect(mockRequest.input).toHaveBeenCalledWith('truck_number', logistics.truck_number);
      expect(mockRequest.input).toHaveBeenCalledWith('status', logistics.status);
      expect(mockRequest.input).toHaveBeenCalledWith('delivery_date', logistics.delivery_date);
      expect(result).toEqual({ message: 'Logistics record created successfully' });
    });
  });

  describe('updateLogistics', () => {
    it('should update a logistics record', async () => {
      const logistics = {
        order_id: 1,
        driver_name: 'Jane Driver',
        truck_number: 'XYZ789',
        status: 'delivered',
        delivery_date: new Date('2023-01-02')
      };
      mockRequest.query.mockResolvedValue({});

      const result = await logisticsRepository.updateLogistics(1, logistics);

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('logistics_id', 1);
      expect(mockRequest.input).toHaveBeenCalledWith('order_id', logistics.order_id);
      expect(mockRequest.input).toHaveBeenCalledWith('driver_name', logistics.driver_name);
      expect(mockRequest.input).toHaveBeenCalledWith('truck_number', logistics.truck_number);
      expect(mockRequest.input).toHaveBeenCalledWith('status', logistics.status);
      expect(mockRequest.input).toHaveBeenCalledWith('delivery_date', logistics.delivery_date);
      expect(result).toEqual({ message: 'Logistics record updated successfully' });
    });
  });

  describe('deleteLogistics', () => {
    it('should delete a logistics record', async () => {
      mockRequest.query.mockResolvedValue({});

      const result = await logisticsRepository.deleteLogistics(1);

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('logistics_id', 1);
      expect(mockRequest.query).toHaveBeenCalledWith('DELETE FROM Logistics WHERE logistics_id = @logistics_id');
      expect(result).toEqual({ message: 'Logistics record deleted successfully' });
    });
  });
});