import { FarmerRepository, Farmer } from '../../../src/repository/farmerRepository';
import sql from '../../../src/db/config';

jest.mock('../../../src/db/config');

describe('Farmer Repository', () => {
  let repository: FarmerRepository;
  let mockPool: any;
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn()
    };
    mockPool = {
      request: jest.fn(() => mockRequest),
      close: jest.fn()
    };

    (sql.connect as jest.Mock).mockResolvedValue(mockPool);
    repository = new FarmerRepository();
  });

  afterEach(async () => {
    await repository.close();
  });

  describe('connect', () => {
    it('should connect to database', async () => {
      await repository.connect();
      expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
      expect(repository['pool']).toBe(mockPool);
    });

    it('should not reconnect if already connected', async () => {
      await repository.connect();
      await repository.connect();
      expect(sql.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('close', () => {
    it('should close database connection', async () => {
      await repository.connect();
      await repository.close();
      expect(mockPool.close).toHaveBeenCalled();
      expect(repository['pool']).toBeNull();
    });

    it('should not close if not connected', async () => {
      await repository.close();
      expect(mockPool.close).not.toHaveBeenCalled();
    });
  });

  describe('getAllFarmers', () => {
    it('should return all farmers', async () => {
      const mockFarmers = [
        { FarmerID: 1, FullName: 'John Doe', PhoneNumber: '1234567890', Location: 'Nakuru', FarmName: 'Green Farm' }
      ];
      mockRequest.query.mockResolvedValue({ recordset: mockFarmers });

      const result = await repository.getAllFarmers();

      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.query).toHaveBeenCalledWith('SELECT * FROM Farmers');
      expect(result).toEqual(mockFarmers);
    });
  });

  describe('getFarmerById', () => {
    it('should return farmer by ID', async () => {
      const mockFarmer = { FarmerID: 1, FullName: 'John Doe', PhoneNumber: '1234567890', Location: 'Nakuru', FarmName: 'Green Farm' };
      mockRequest.query.mockResolvedValue({ recordset: [mockFarmer] });

      const result = await repository.getFarmerById(1);

      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('FarmerID', sql.Int, 1);
      expect(mockRequest.query).toHaveBeenCalledWith('SELECT * FROM Farmers WHERE FarmerID = @FarmerID');
      expect(result).toEqual(mockFarmer);
    });

    it('should return null if farmer not found', async () => {
      mockRequest.query.mockResolvedValue({ recordset: [] });

      const result = await repository.getFarmerById(1);

      expect(result).toBeNull();
    });
  });

  describe('addFarmer', () => {
    it('should add a new farmer', async () => {
      const farmer: Farmer = {
        FullName: 'John Doe',
        PhoneNumber: '1234567890',
        Location: 'Nakuru',
        FarmName: 'Green Farm'
      };

      mockRequest.query.mockResolvedValue({});

      await repository.addFarmer(farmer);

      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('FullName', sql.NVarChar, farmer.FullName);
      expect(mockRequest.input).toHaveBeenCalledWith('PhoneNumber', sql.NVarChar, farmer.PhoneNumber);
      expect(mockRequest.input).toHaveBeenCalledWith('Location', sql.NVarChar, farmer.Location);
      expect(mockRequest.input).toHaveBeenCalledWith('FarmName', sql.NVarChar, farmer.FarmName);
      expect(mockRequest.query).toHaveBeenCalled();
    });
  });

  describe('updateFarmer', () => {
    it('should update an existing farmer', async () => {
      const farmer: Farmer = {
        FullName: 'Jane Doe',
        PhoneNumber: '0987654321',
        Location: 'Nairobi',
        FarmName: 'Blue Farm'
      };

      mockRequest.query.mockResolvedValue({});

      await repository.updateFarmer(1, farmer);

      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('FarmerID', sql.Int, 1);
      expect(mockRequest.input).toHaveBeenCalledWith('FullName', sql.NVarChar, farmer.FullName);
      expect(mockRequest.input).toHaveBeenCalledWith('PhoneNumber', sql.NVarChar, farmer.PhoneNumber);
      expect(mockRequest.input).toHaveBeenCalledWith('Location', sql.NVarChar, farmer.Location);
      expect(mockRequest.input).toHaveBeenCalledWith('FarmName', sql.NVarChar, farmer.FarmName);
      expect(mockRequest.query).toHaveBeenCalled();
    });
  });

  describe('deleteFarmer', () => {
    it('should delete a farmer', async () => {
      mockRequest.query.mockResolvedValue({});

      await repository.deleteFarmer(1);

      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('FarmerID', sql.Int, 1);
      expect(mockRequest.query).toHaveBeenCalledWith('DELETE FROM Farmers WHERE FarmerID = @FarmerID');
    });
  });
});