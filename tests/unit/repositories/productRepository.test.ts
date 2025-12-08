import * as productRepo from '../../../src/repository/productRepository';
import sql from '../../../src/db/config';

jest.mock('../../../src/db/config');

describe('Product Repository', () => {
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn()
    };
    (sql as any).Request = jest.fn(() => mockRequest);
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const mockProducts = [
        {
          product_id: 1,
          farmer_id: 1,
          product_name: 'Tomatoes',
          category: 'Vegetables',
          stock_quantity: 100,
          price: 50,
          description: 'Fresh tomatoes'
        }
      ];
      mockRequest.query.mockResolvedValue({ recordset: mockProducts });

      const result = await productRepo.getAllProducts();

      expect(sql.Request).toHaveBeenCalled();
      expect(mockRequest.query).toHaveBeenCalledWith("SELECT * FROM Product");
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getProduct', () => {
    it('should return product by ID', async () => {
      const mockProduct = {
        product_id: 1,
        farmer_id: 1,
        product_name: 'Tomatoes',
        category: 'Vegetables',
        stock_quantity: 100,
        price: 50,
        description: 'Fresh tomatoes'
      };
      mockRequest.query.mockResolvedValue({ recordset: [mockProduct] });

      const result = await productRepo.getProduct(1);

      expect(sql.Request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith("id", sql.Int, 1);
      expect(mockRequest.query).toHaveBeenCalledWith("SELECT * FROM Product WHERE product_id = @id");
      expect(result).toEqual(mockProduct);
    });

    it('should return null if product not found', async () => {
      mockRequest.query.mockResolvedValue({ recordset: [] });

      const result = await productRepo.getProduct(1);

      expect(result).toBeNull();
    });

    it('should throw error for invalid ID', async () => {
      await expect(productRepo.getProduct('invalid' as any)).rejects.toThrow('Invalid product ID: invalid');
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const product = {
        farmer_id: 1,
        product_name: 'Tomatoes',
        category: 'Vegetables',
        stock_quantity: 100,
        price: 50,
        description: 'Fresh tomatoes'
      };
      const mockCreatedProduct = { ...product, product_id: 1 };
      mockRequest.query.mockResolvedValue({ recordset: [mockCreatedProduct] });

      const result = await productRepo.createProduct(product);

      expect(sql.Request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith("farmer_id", sql.Int, product.farmer_id);
      expect(mockRequest.input).toHaveBeenCalledWith("product_name", sql.NVarChar(200), product.product_name);
      expect(mockRequest.input).toHaveBeenCalledWith("category", sql.NVarChar(100), product.category);
      expect(mockRequest.input).toHaveBeenCalledWith("stock_quantity", sql.Int, product.stock_quantity);
      expect(mockRequest.input).toHaveBeenCalledWith("price", sql.Decimal(18, 2), product.price);
      expect(mockRequest.input).toHaveBeenCalledWith("description", sql.NVarChar(1000), product.description);
      expect(result).toEqual(mockCreatedProduct);
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      const updateData = {
        product_name: 'Updated Tomatoes',
        price: 60
      };
      const mockUpdatedProduct = {
        product_id: 1,
        farmer_id: 1,
        product_name: 'Updated Tomatoes',
        category: 'Vegetables',
        stock_quantity: 100,
        price: 60,
        description: 'Fresh tomatoes'
      };
      mockRequest.query.mockResolvedValue({ recordset: [mockUpdatedProduct] });

      const result = await productRepo.updateProduct(1, updateData);

      expect(sql.Request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith("id", sql.Int, 1);
      expect(mockRequest.input).toHaveBeenCalledWith("product_name", sql.NVarChar(200), updateData.product_name);
      expect(mockRequest.input).toHaveBeenCalledWith("price", sql.Decimal(18, 2), updateData.price);
      expect(result).toEqual(mockUpdatedProduct);
    });

    it('should return null if product not found', async () => {
      mockRequest.query.mockResolvedValue({ recordset: [] });

      const result = await productRepo.updateProduct(1, { price: 60 });

      expect(result).toBeNull();
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

      const result = await productRepo.deleteProduct(1);

      expect(sql.Request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith("id", sql.Int, 1);
      expect(mockRequest.query).toHaveBeenCalledWith("DELETE FROM Product WHERE product_id = @id");
      expect(result).toBe(true);
    });

    it('should return false if no rows affected', async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [0] });

      const result = await productRepo.deleteProduct(1);

      expect(result).toBe(false);
    });
  });
});