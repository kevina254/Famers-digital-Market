import * as farmerService from "../../../src/services/farmerServices";
import sql from "../../../src/db/config";

jest.mock("../../../src/db/config");

describe("Farmer Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addFarmer", () => {
    it("should add a farmer successfully", async () => {
      const mockFarmer = {
        FullName: "John Doe",
        PhoneNumber: "1234567890",
        Location: "Nakuru",
        FarmName: "Green Farm"
      };

      const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({})
      };

      (sql as any).Request = jest.fn(() => mockRequest);

      const result = await farmerService.addFarmer(mockFarmer);

      expect(mockRequest.input).toHaveBeenCalledWith("FullName", mockFarmer.FullName);
      expect(mockRequest.input).toHaveBeenCalledWith("PhoneNumber", mockFarmer.PhoneNumber);
      expect(mockRequest.input).toHaveBeenCalledWith("Location", mockFarmer.Location);
      expect(mockRequest.input).toHaveBeenCalledWith("FarmName", mockFarmer.FarmName);
      expect(mockRequest.query).toHaveBeenCalled();
      expect(result).toEqual({ message: "Farmer added successfully" });
    });
  });

  describe("getAllFarmers", () => {
    it("should return all farmers", async () => {
      const mockFarmers = [
        { FarmerID: 1, FullName: "John Doe", PhoneNumber: "1234567890", Location: "Nakuru", FarmName: "Green Farm" }
      ];

      const mockRequest = {
        query: jest.fn().mockResolvedValue({ recordset: mockFarmers })
      };

      (sql as any).Request = jest.fn(() => mockRequest);

      const result = await farmerService.getAllFarmers();

      expect(mockRequest.query).toHaveBeenCalledWith("SELECT * FROM Farmers");
      expect(result).toEqual(mockFarmers);
    });
  });

  describe("getFarmerById", () => {
    it("should return a farmer by ID", async () => {
      const mockFarmer = { FarmerID: 1, FullName: "John Doe", PhoneNumber: "1234567890", Location: "Nakuru", FarmName: "Green Farm" };

      const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [mockFarmer] })
      };

      (sql as any).Request = jest.fn(() => mockRequest);

      const result = await farmerService.getFarmerById(1);

      expect(mockRequest.input).toHaveBeenCalledWith("FarmerID", 1);
      expect(mockRequest.query).toHaveBeenCalledWith("SELECT * FROM Farmers WHERE FarmerID = @FarmerID");
      expect(result).toEqual(mockFarmer);
    });

    it("should return null if farmer not found", async () => {
      const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [] })
      };

      (sql as any).Request = jest.fn(() => mockRequest);

      const result = await farmerService.getFarmerById(1);

      expect(result).toBeNull();
    });
  });

  describe("updateFarmer", () => {
    it("should update a farmer successfully", async () => {
      const mockFarmer = {
        FullName: "Jane Doe",
        PhoneNumber: "0987654321",
        Location: "Nairobi",
        FarmName: "Blue Farm"
      };

      const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({})
      };

      (sql as any).Request = jest.fn(() => mockRequest);

      const result = await farmerService.updateFarmer(1, mockFarmer);

      expect(mockRequest.input).toHaveBeenCalledWith("FarmerID", 1);
      expect(mockRequest.input).toHaveBeenCalledWith("FullName", mockFarmer.FullName);
      expect(mockRequest.input).toHaveBeenCalledWith("PhoneNumber", mockFarmer.PhoneNumber);
      expect(mockRequest.input).toHaveBeenCalledWith("Location", mockFarmer.Location);
      expect(mockRequest.input).toHaveBeenCalledWith("FarmName", mockFarmer.FarmName);
      expect(mockRequest.query).toHaveBeenCalled();
      expect(result).toEqual({ message: "Farmer updated successfully" });
    });
  });

  describe("deleteFarmer", () => {
    it("should delete a farmer successfully", async () => {
      const mockRequest = {
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({})
      };

      (sql as any).Request = jest.fn(() => mockRequest);

      const result = await farmerService.deleteFarmer(1);

      expect(mockRequest.input).toHaveBeenCalledWith("FarmerID", 1);
      expect(mockRequest.query).toHaveBeenCalledWith("DELETE FROM Farmers WHERE FarmerID = @FarmerID");
      expect(result).toEqual({ message: "Farmer deleted successfully" });
    });
  });
});
