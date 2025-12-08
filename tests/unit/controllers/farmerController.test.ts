jest.mock('../../../src/repository/farmerRepository');

const mockFarmerRepo = {
  getAllFarmers: jest.fn(),
  addFarmer: jest.fn(),
  getFarmerById: jest.fn(),
  updateFarmer: jest.fn(),
  deleteFarmer: jest.fn(),
};

import { FarmerRepository } from '../../../src/repository/farmerRepository';
(FarmerRepository as jest.MockedClass<typeof FarmerRepository>).mockImplementation(() => mockFarmerRepo as any);

// Import after mocking
import { Request, Response } from 'express';
import { getAllFarmers, addFarmer, getFarmerById, updateFarmer, deleteFarmer } from '../../../src/controllers/farmerController';

describe('Farmer Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFarmers', () => {
    it('should return all farmers successfully', async () => {
      const mockFarmers = [
        { FarmerID: 1, FullName: 'John Doe', PhoneNumber: '1234567890', Location: 'Nakuru', FarmName: 'Green Farm' }
      ];

      mockFarmerRepo.getAllFarmers.mockResolvedValue(mockFarmers);

      await getAllFarmers(mockRequest as Request, mockResponse as Response);

      expect(mockFarmerRepo.getAllFarmers).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockFarmers);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockFarmerRepo.getAllFarmers.mockRejectedValue(error);

      await getAllFarmers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('Server error while fetching farmers');
    });
  });

  describe('addFarmer', () => {
    it('should add a farmer successfully', async () => {
      const farmerData = {
        FullName: 'John Doe',
        PhoneNumber: '1234567890',
        Location: 'Nakuru',
        FarmName: 'Green Farm'
      };
      mockRequest.body = farmerData;

      mockFarmerRepo.addFarmer.mockResolvedValue(undefined);

      await addFarmer(mockRequest as Request, mockResponse as Response);

      expect(mockFarmerRepo.addFarmer).toHaveBeenCalledWith(farmerData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith('Farmer added successfully');
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockRequest.body = { FullName: 'John Doe' };

      mockFarmerRepo.addFarmer.mockRejectedValue(error);

      await addFarmer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('Error adding farmer');
    });
  });

  describe('getFarmerById', () => {
    it('should return farmer by ID successfully', async () => {
      const mockFarmer = { FarmerID: 1, FullName: 'John Doe', PhoneNumber: '1234567890', Location: 'Nakuru', FarmName: 'Green Farm' };
      mockRequest.params = { id: '1' };

      mockFarmerRepo.getFarmerById.mockResolvedValue(mockFarmer);

      await getFarmerById(mockRequest as Request, mockResponse as Response);

      expect(mockFarmerRepo.getFarmerById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(mockFarmer);
    });

    it('should return 404 if farmer not found', async () => {
      mockRequest.params = { id: '1' };

      mockFarmerRepo.getFarmerById.mockResolvedValue(null);

      await getFarmerById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith('Farmer not found');
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockRequest.params = { id: '1' };

      mockFarmerRepo.getFarmerById.mockRejectedValue(error);

      await getFarmerById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('Error fetching farmer');
    });
  });

  describe('updateFarmer', () => {
    it('should update farmer successfully', async () => {
      const updateData = { FullName: 'Jane Doe' };
      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;

      mockFarmerRepo.updateFarmer.mockResolvedValue(undefined);

      await updateFarmer(mockRequest as Request, mockResponse as Response);

      expect(mockFarmerRepo.updateFarmer).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.send).toHaveBeenCalledWith('Farmer updated successfully');
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockRequest.params = { id: '1' };
      mockRequest.body = { FullName: 'Jane Doe' };

      mockFarmerRepo.updateFarmer.mockRejectedValue(error);

      await updateFarmer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('Error updating farmer');
    });
  });

  describe('deleteFarmer', () => {
    it('should delete farmer successfully', async () => {
      mockRequest.params = { id: '1' };

      mockFarmerRepo.deleteFarmer.mockResolvedValue(undefined);

      await deleteFarmer(mockRequest as Request, mockResponse as Response);

      expect(mockFarmerRepo.deleteFarmer).toHaveBeenCalledWith(1);
      expect(mockResponse.send).toHaveBeenCalledWith('Farmer deleted successfully');
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockRequest.params = { id: '1' };

      mockFarmerRepo.deleteFarmer.mockRejectedValue(error);

      await deleteFarmer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith('Error deleting farmer');
    });
  });
});