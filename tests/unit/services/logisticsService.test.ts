import { logisticsService } from "../../../src/services/logisticsServices";
import { logisticsRepository } from "../../../src/repository/logisticsRepository";

jest.mock("../../../src/repository/logisticsRepository");

describe("Logistics Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllLogistics", () => {
    it("should return all logistics records", async () => {
      const mockLogistics = [
        {
          logistics_id: 1,
          order_id: 1,
          driver_name: "John Driver",
          truck_number: "ABC123",
          status: "in_transit",
          delivery_date: new Date("2023-01-01")
        }
      ];

      (logisticsRepository.getAllLogistics as jest.Mock).mockResolvedValue(mockLogistics);

      const result = await logisticsService.getAllLogistics();

      expect(logisticsRepository.getAllLogistics).toHaveBeenCalled();
      expect(result).toEqual(mockLogistics);
    });
  });

  describe("getLogisticsById", () => {
    it("should return logistics record by ID", async () => {
      const mockLogistics = {
        logistics_id: 1,
        order_id: 1,
        driver_name: "John Driver",
        truck_number: "ABC123",
        status: "in_transit",
        delivery_date: new Date("2023-01-01")
      };

      (logisticsRepository.getLogisticsById as jest.Mock).mockResolvedValue(mockLogistics);

      const result = await logisticsService.getLogisticsById(1);

      expect(logisticsRepository.getLogisticsById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockLogistics);
    });
  });

  describe("createLogistics", () => {
    it("should create a logistics record successfully", async () => {
      const newLogistics = {
        order_id: 1,
        driver_name: "John Driver",
        truck_number: "ABC123",
        status: "pending",
        delivery_date: new Date("2023-01-01")
      };

      (logisticsRepository.createLogistics as jest.Mock).mockResolvedValue({ message: "Logistics record created successfully" });

      const result = await logisticsService.createLogistics(newLogistics);

      expect(logisticsRepository.createLogistics).toHaveBeenCalledWith(newLogistics);
      expect(result).toEqual({ message: "Logistics record created successfully" });
    });

    it("should throw error if required fields are missing", async () => {
      const invalidLogistics = {
        order_id: 1,
        driver_name: "",
        truck_number: "ABC123",
        status: "",
        delivery_date: new Date("2023-01-01")
      };

      await expect(logisticsService.createLogistics(invalidLogistics)).rejects.toThrow("Missing required logistics fields");
    });
  });

  describe("updateLogistics", () => {
    it("should update logistics record successfully", async () => {
      const existingLogistics = {
        logistics_id: 1,
        order_id: 1,
        driver_name: "John Driver",
        truck_number: "ABC123",
        status: "in_transit",
        delivery_date: new Date("2023-01-01")
      };

      const updateData = {
        order_id: 1,
        driver_name: "Jane Driver",
        truck_number: "XYZ789",
        status: "delivered",
        delivery_date: new Date("2023-01-02")
      };

      (logisticsRepository.getLogisticsById as jest.Mock).mockResolvedValue(existingLogistics);
      (logisticsRepository.updateLogistics as jest.Mock).mockResolvedValue({ message: "Logistics record updated successfully" });

      const result = await logisticsService.updateLogistics(1, updateData);

      expect(logisticsRepository.getLogisticsById).toHaveBeenCalledWith(1);
      expect(logisticsRepository.updateLogistics).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual({ message: "Logistics record updated successfully" });
    });

    it("should throw error if logistics record not found", async () => {
      (logisticsRepository.getLogisticsById as jest.Mock).mockResolvedValue(null);

      const updateData = {
        order_id: 1,
        driver_name: "Jane Driver",
        truck_number: "XYZ789",
        status: "delivered",
        delivery_date: new Date("2023-01-02")
      };

      await expect(logisticsService.updateLogistics(1, updateData)).rejects.toThrow("Logistics record not found");
    });
  });

  describe("deleteLogistics", () => {
    it("should delete logistics record successfully", async () => {
      const existingLogistics = {
        logistics_id: 1,
        order_id: 1,
        driver_name: "John Driver",
        truck_number: "ABC123",
        status: "in_transit",
        delivery_date: new Date("2023-01-01")
      };

      (logisticsRepository.getLogisticsById as jest.Mock).mockResolvedValue(existingLogistics);
      (logisticsRepository.deleteLogistics as jest.Mock).mockResolvedValue({ message: "Logistics record deleted successfully" });

      const result = await logisticsService.deleteLogistics(1);

      expect(logisticsRepository.getLogisticsById).toHaveBeenCalledWith(1);
      expect(logisticsRepository.deleteLogistics).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: "Logistics record deleted successfully" });
    });

    it("should throw error if logistics record not found", async () => {
      (logisticsRepository.getLogisticsById as jest.Mock).mockResolvedValue(null);

      await expect(logisticsService.deleteLogistics(1)).rejects.toThrow("Logistics record not found");
    });
  });
});