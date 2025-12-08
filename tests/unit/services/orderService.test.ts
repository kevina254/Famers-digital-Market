import * as orderService from "../../../src/services/orderServices";
import * as orderRepository from "../../../src/repository/orderRepository";

jest.mock("../../../src/repository/orderRepository");

describe("Order Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("should create an order successfully", async () => {
      const newOrder: orderRepository.NewOrder = {
        user_id: 1,
        product_id: 1,
        market_id: 1,
        quantity: 10,
        total_amount: 500,
        order_date: "2023-01-01",
        status: "pending"
      };

      const expectedResult = { message: "Order created successfully", order_id: 1 };

      (orderRepository.createOrder as jest.Mock).mockResolvedValue(expectedResult);

      const result = await orderService.createOrder(newOrder);

      expect(orderRepository.createOrder).toHaveBeenCalledWith(newOrder);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("getOrders", () => {
    it("should return orders for a user", async () => {
      const mockOrders = [
        {
          order_id: 1,
          user_id: 1,
          product_id: 1,
          market_id: 1,
          quantity: 10,
          total_amount: 500,
          order_date: "2023-01-01",
          status: "pending"
        }
      ];

      (orderRepository.getOrders as jest.Mock).mockResolvedValue(mockOrders);

      const result = await orderService.getOrders(1);

      expect(orderRepository.getOrders).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrders);
    });
  });

  describe("getOrdersByFarmer", () => {
    it("should return orders for farmer's products", async () => {
      const mockOrders = [
        {
          order_id: 1,
          user_id: 1,
          product_id: 1,
          market_id: 1,
          quantity: 10,
          total_amount: 500,
          order_date: "2023-01-01",
          status: "pending",
          product_name: "Tomatoes"
        }
      ];

      (orderRepository.getOrdersByFarmer as jest.Mock).mockResolvedValue(mockOrders);

      const result = await orderService.getOrdersByFarmer(1);

      expect(orderRepository.getOrdersByFarmer).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrders);
    });
  });

  describe("getOrderById", () => {
    it("should return order by ID", async () => {
      const mockOrder = {
        order_id: 1,
        user_id: 1,
        product_id: 1,
        market_id: 1,
        quantity: 10,
        total_amount: 500,
        order_date: "2023-01-01",
        status: "pending"
      };

      (orderRepository.getOrderById as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById(1);

      expect(orderRepository.getOrderById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrder);
    });
  });

  describe("updateOrder", () => {
    it("should update an order successfully", async () => {
      const updateData = {
        status: "completed",
        quantity: 15,
        total_amount: 750
      };

      const expectedResult = { message: "Order updated successfully" };

      (orderRepository.updateOrder as jest.Mock).mockResolvedValue(expectedResult);

      const result = await orderService.updateOrder(1, updateData);

      expect(orderRepository.updateOrder).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("deleteOrder", () => {
    it("should delete an order successfully", async () => {
      const expectedResult = { message: "Order deleted successfully" };

      (orderRepository.deleteOrder as jest.Mock).mockResolvedValue(expectedResult);

      const result = await orderService.deleteOrder(1);

      expect(orderRepository.deleteOrder).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });
});