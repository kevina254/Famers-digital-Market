import * as marketRepo from '../../../src/repository/marketRepository';
import { getPool } from '../../../src/db/config';
import sql from '../../../src/db/config';

jest.mock('../../../src/db/config');

describe('Market Repository', () => {
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

  describe('getallmarkets', () => {
    it('should return all markets', async () => {
      const mockMarkets = [
        { id: 1, name: 'Central Market', location: 'Nairobi' }
      ];
      mockRequest.query.mockResolvedValue({ recordset: mockMarkets });

      const result = await marketRepo.getallmarkets();

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.query).toHaveBeenCalledWith('select *from market');
      expect(result).toEqual(mockMarkets);
    });
  });

  describe('getmarketbyid', () => {
    it('should return market by ID', async () => {
      const mockMarket = { id: 1, name: 'Central Market', location: 'Nairobi' };
      mockRequest.query.mockResolvedValue({ recordset: [mockMarket] });

      const result = await marketRepo.getmarketbyid(1);

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('id', sql.Int, 1);
      expect(mockRequest.query).toHaveBeenCalledWith('SELECT * FROM market Where id = @id');
      expect(result).toEqual(mockMarket);
    });
  });
});