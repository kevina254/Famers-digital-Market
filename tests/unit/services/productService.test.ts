import * as productService from "../../../src/services/productServices";
import * as productRepo from "../../../src/repository/productRepository";

jest.mock("../../../src/repository/productRepository");

describe("Product Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addProduct", () => {
    it("should add a product successfully", async () => {
      const mockProduct = {
        farmer_id: 1,
        product_name: "Tomatoes",
        category: "Vegetables",
        stock_quantity: 100,
        price: 50,
        description: "Fresh tomatoes"
      };

      (productRepo.createProduct as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.addProduct(mockProduct);

      expect(productRepo.createProduct).toHaveBeenCalledWith(mockProduct);
      expect(result).toEqual({ message: "Product added successfully" });
    });

    it("should throw error if product name is missing", async () => {
      const invalidProduct = { price: 50 };

      await expect(productService.addProduct(invalidProduct)).rejects.toThrow("Product name and price are required.");
    });

    it("should throw error if price is missing", async () => {
      const invalidProduct = { product_name: "Tomatoes" };

      await expect(productService.addProduct(invalidProduct)).rejects.toThrow("Product name and price are required.");
    });
  });

  describe("getAllProducts", () => {
    it("should return all products", async () => {
      const mockProducts = [
        {
          product_id: 1,
          farmer_id: 1,
          product_name: "Tomatoes",
          category: "Vegetables",
          stock_quantity: 100,
          price: 50,
          description: "Fresh tomatoes"
        }
      ];

      (productRepo.getAllProducts as jest.Mock).mockResolvedValue(mockProducts);

      const result = await productService.getAllProducts();

      expect(productRepo.getAllProducts).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });

  describe("getProductById", () => {
    it("should return product by ID", async () => {
      const mockProduct = {
        product_id: 1,
        farmer_id: 1,
        product_name: "Tomatoes",
        category: "Vegetables",
        stock_quantity: 100,
        price: 50,
        description: "Fresh tomatoes"
      };

      (productRepo.getProduct as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.getProductById(1);

      expect(productRepo.getProduct).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProduct);
    });

    it("should throw error for invalid ID", async () => {
      await expect(productService.getProductById(NaN)).rejects.toThrow("Invalid product ID: NaN");
    });

    it("should throw error if product not found", async () => {
      (productRepo.getProduct as jest.Mock).mockResolvedValue(null);

      await expect(productService.getProductById(1)).rejects.toThrow("Product not found");
    });
  });

  describe("updateProduct", () => {
    it("should update product successfully", async () => {
      const existingProduct = {
        product_id: 1,
        farmer_id: 1,
        product_name: "Tomatoes",
        category: "Vegetables",
        stock_quantity: 100,
        price: 50,
        description: "Fresh tomatoes"
      };

      const updateData = { price: 60 };

      (productRepo.getProduct as jest.Mock).mockResolvedValue(existingProduct);
      (productRepo.updateProduct as jest.Mock).mockResolvedValue({ ...existingProduct, ...updateData });

      const result = await productService.updateProduct(1, updateData);

      expect(productRepo.getProduct).toHaveBeenCalledWith(1);
      expect(productRepo.updateProduct).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual({ message: "Product updated successfully" });
    });

    it("should throw error for invalid ID", async () => {
      await expect(productService.updateProduct(NaN, { price: 60 })).rejects.toThrow("Invalid product ID: NaN");
    });

    it("should throw error if product not found", async () => {
      (productRepo.getProduct as jest.Mock).mockResolvedValue(null);

      await expect(productService.updateProduct(1, { price: 60 })).rejects.toThrow("Product not found");
    });

    it("should throw error if price is not greater than zero", async () => {
      const existingProduct = {
        product_id: 1,
        farmer_id: 1,
        product_name: "Tomatoes",
        category: "Vegetables",
        stock_quantity: 100,
        price: 50,
        description: "Fresh tomatoes"
      };

      (productRepo.getProduct as jest.Mock).mockResolvedValue(existingProduct);

      await expect(productService.updateProduct(1, { price: 0 })).rejects.toThrow("Price must be greater than zero.");
    });
  });

  describe("deleteProduct", () => {
    it("should delete product successfully", async () => {
      const existingProduct = {
        product_id: 1,
        farmer_id: 1,
        product_name: "Tomatoes",
        category: "Vegetables",
        stock_quantity: 100,
        price: 50,
        description: "Fresh tomatoes"
      };

      (productRepo.getProduct as jest.Mock).mockResolvedValue(existingProduct);
      (productRepo.deleteProduct as jest.Mock).mockResolvedValue(true);

      const result = await productService.deleteProduct(1);

      expect(productRepo.getProduct).toHaveBeenCalledWith(1);
      expect(productRepo.deleteProduct).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: "Product deleted successfully" });
    });

    it("should throw error for invalid ID", async () => {
      await expect(productService.deleteProduct(NaN)).rejects.toThrow("Invalid product ID: NaN");
    });

    it("should return null if product not found", async () => {
      (productRepo.getProduct as jest.Mock).mockResolvedValue(null);

      const result = await productService.deleteProduct(1);

      expect(result).toBeNull();
    });
  });
});