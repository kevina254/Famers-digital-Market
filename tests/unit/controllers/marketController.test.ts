import { Request, Response } from 'express';
import { getMarkets } from '../../../src/controllers/marketController';
import * as marketService from '../../../src/services/marketServices';

jest.mock('../../../src/services/marketServices');

describe('Market Controller', () => {
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

  describe('getMarkets', () => {
    it('should return markets successfully', async () => {
      const mockMarkets = [
        { id: 1, name: 'Central Market', location: 'Nairobi' }
      ];

      (marketService.getallMarket as jest.Mock).mockResolvedValue(mockMarkets);

      await getMarkets(mockRequest as Request, mockResponse as Response);

      expect(marketService.getallMarket).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMarkets);
    });

    it('should handle errors', async () => {
      const error = new Error('Function not implemented');

      (marketService.getallMarket as jest.Mock).mockRejectedValue(error);

      await getMarkets(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});