import { PaymentService } from "../../../src/services/paymentServices";
import { PaymentRepository } from "../../../src/repository/paymentRepository";
import { Payment } from "../../../src/types/paymentTypes";

jest.mock("../../../src/repository/paymentRepository");

describe("Payment Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return all payments", async () => {
      const mockPayments: Payment[] = [
        {
          payment_id: 1,
          order_id: 1,
          payment_method: "M-Pesa",
          reference: "REF123",
          payment_date: "2023-01-01",
          payment_status: "completed"
        }
      ];

      (PaymentRepository.getAll as jest.Mock).mockResolvedValue(mockPayments);

      const result = await PaymentService.getAll();

      expect(PaymentRepository.getAll).toHaveBeenCalled();
      expect(result).toEqual(mockPayments);
    });
  });

  describe("getById", () => {
    it("should return payment by ID", async () => {
      const mockPayment: Payment = {
        payment_id: 1,
        order_id: 1,
        payment_method: "M-Pesa",
        reference: "REF123",
        payment_date: "2023-01-01",
        payment_status: "completed"
      };

      (PaymentRepository.getById as jest.Mock).mockResolvedValue(mockPayment);

      const result = await PaymentService.getById(1);

      expect(PaymentRepository.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPayment);
    });

    it("should return null if payment not found", async () => {
      (PaymentRepository.getById as jest.Mock).mockResolvedValue(null);

      const result = await PaymentService.getById(1);

      expect(result).toBeNull();
    });
  });

  describe("getByUserId", () => {
    it("should return payments by user ID", async () => {
      const mockPayments: Payment[] = [
        {
          payment_id: 1,
          order_id: 1,
          payment_method: "M-Pesa",
          reference: "REF123",
          payment_date: "2023-01-01",
          payment_status: "completed"
        }
      ];

      (PaymentRepository.getByUserId as jest.Mock).mockResolvedValue(mockPayments);

      const result = await PaymentService.getByUserId(1);

      expect(PaymentRepository.getByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPayments);
    });
  });

  describe("create", () => {
    it("should create a new payment", async () => {
      const newPayment = {
        order_id: 1,
        payment_method: "M-Pesa",
        reference: "REF123",
        payment_date: "2023-01-01",
        payment_status: "pending"
      };

      (PaymentRepository.create as jest.Mock).mockResolvedValue(undefined);

      await PaymentService.create(newPayment);

      expect(PaymentRepository.create).toHaveBeenCalledWith(newPayment);
    });
  });

  describe("update", () => {
    it("should update a payment", async () => {
      const updateData = {
        payment_status: "completed"
      };

      (PaymentRepository.update as jest.Mock).mockResolvedValue(undefined);

      await PaymentService.update(1, updateData);

      expect(PaymentRepository.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe("delete", () => {
    it("should delete a payment", async () => {
      (PaymentRepository.delete as jest.Mock).mockResolvedValue(undefined);

      await PaymentService.delete(1);

      expect(PaymentRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});