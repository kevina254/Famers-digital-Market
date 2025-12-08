import { Request, Response } from 'express';
import { logisticsController } from '../../../src/controllers/logisticsController';
import { logisticsService } from '../../../src/services/logisticsServices';

jest.mock('../../../src/services/logisticsServices');

describe('Logistics Controller', () => {
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

      (logisticsService.getAllLogistics as jest.Mock).mockResolvedValue(mockLogistics);

      await logisticsController.getAll(mockRequest as Request, mockResponse as Response);

      expect(logisticsService.getAllLogistics).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockLogistics);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');

      (logisticsService.getAllLogistics as jest.Mock).mockRejectedValue(error);

      await logisticsController.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getById', () => {
    it('should return logistics record by ID', async () => {
      const mockRecord = {
        logistics_id: 1,
        order_id: 1,
        driver_name: 'John Driver',
        truck_number: 'ABC123',
        status: 'in_transit',
        delivery_date: new Date('2023-01-01')
      };
      mockRequest.params = { id: '1' };

      (logisticsService.getLogisticsById as jest.Mock).mockResolvedValue(mockRecord);

      await logisticsController.getById(mockRequest as Request, mockResponse as Response);

      expect(logisticsService.getLogisticsById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockRecord);
    });

    it('should return 404 if record not found', async () => {
      mockRequest.params = { id: '1' };

      (logisticsService.getLogisticsById as jest.Mock).mockResolvedValue(null);

      await logisticsController.getById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Logistics not found' });
    });
  });

  describe('create', () => {
    it('should create a logistics record', async () => {
      const recordData = {
        order_id: 1,
        driver_name: 'John Driver',
        truck_number: 'ABC123',
        status: 'pending',
        delivery_date: new Date('2023-01-01')
      };
      const expectedResult = { message: 'Logistics record created successfully' };

      mockRequest.body = recordData;
      (logisticsService.createLogistics as jest.Mock).mockResolvedValue(expectedResult);

      await logisticsController.create(mockRequest as Request, mockResponse as Response);

      expect(logisticsService.createLogistics).toHaveBeenCalledWith(recordData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should handle validation errors', async () => {
      const error = new Error('Missing required fields');
      mockRequest.body = { order_id: 1 };

      (logisticsService.createLogistics as jest.Mock).mockRejectedValue(error);

      await logisticsController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('update', () => {
    it('should update a logistics record', async () => {
      const updateData = { status: 'delivered' };
      const expectedResult = { message: 'Logistics record updated successfully' };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      (logisticsService.updateLogistics as jest.Mock).mockResolvedValue(expectedResult);

      await logisticsController.update(mockRequest as Request, mockResponse as Response);

      expect(logisticsService.updateLogistics).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });
  });

  describe('delete', () => {
    it('should delete a logistics record', async () => {
      const expectedResult = { message: 'Logistics record deleted successfully' };

      mockRequest.params = { id: '1' };
      (logisticsService.deleteLogistics as jest.Mock).mockResolvedValue(expectedResult);

      await logisticsController.delete(mockRequest as Request, mockResponse as Response);

      expect(logisticsService.deleteLogistics).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });
  });
});