import { Request, Response } from 'express';
import { createProduct, getAllProducts, getProduct, updateProduct, deleteProduct } from '../../../src/controllers/productController';
import * as productService from '../../../src/services/productServices';

jest.mock('../../../src/services/productServices');

describe('Product Controller', () => {
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

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const productData = {
        farmer_id: 1,
        product_name: 'Tomatoes',
        category: 'Vegetables',
        stock_quantity: 100,
        price: 50,
        description: 'Fresh tomatoes'
      };
      const expectedResult = { message: 'Product added successfully' };

      mockRequest.body = productData;
      (productService.addProduct as jest.Mock).mockResolvedValue(expectedResult);

      await createProduct(mockRequest as Request, mockResponse as Response);

      expect(productService.addProduct).toHaveBeenCalledWith(productData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should handle errors', async () => {
      const error = new Error('Validation error');
      mockRequest.body = { product_name: 'Tomatoes' };

      (productService.addProduct as jest.Mock).mockRejectedValue(error);

      await createProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Failed to add product',
        error: error.message,
      });
    });
  });

  describe('getAllProducts', () => {
    it('should return all products successfully', async () => {
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

      (productService.getAllProducts as jest.Mock).mockResolvedValue(mockProducts);

      await getAllProducts(mockRequest as Request, mockResponse as Response);

      expect(productService.getAllProducts).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');

      (productService.getAllProducts as jest.Mock).mockRejectedValue(error);

      await getAllProducts(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Failed to fetch products',
        error: error.message,
      });
    });
  });

  describe('getProduct', () => {
    it('should return product by ID successfully', async () => {
      const mockProduct = {
        product_id: 1,
        farmer_id: 1,
        product_name: 'Tomatoes',
        category: 'Vegetables',
        stock_quantity: 100,
        price: 50,
        description: 'Fresh tomatoes'
      };
      mockRequest.params = { id: '1' };

      (productService.getProductById as jest.Mock).mockResolvedValue(mockProduct);

      await getProduct(mockRequest as Request, mockResponse as Response);

      expect(productService.getProductById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
    });

    it('should return 400 for invalid ID', async () => {
      mockRequest.params = { id: 'abc' };

      await getProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid product ID. Must be a number.' });
    });

    it('should return 404 if product not found', async () => {
      mockRequest.params = { id: '1' };

      (productService.getProductById as jest.Mock).mockRejectedValue(new Error('Product not found'));

      await getProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error fetching product', error: 'Product not found' });
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const updateData = { price: 60 };
      const expectedResult = { message: 'Product updated successfully' };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;

      (productService.updateProduct as jest.Mock).mockResolvedValue(expectedResult);

      await updateProduct(mockRequest as Request, mockResponse as Response);

      expect(productService.updateProduct).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should handle errors', async () => {
      const error = new Error('Update failed');
      mockRequest.params = { id: '1' };
      mockRequest.body = { price: 60 };

      (productService.updateProduct as jest.Mock).mockRejectedValue(error);

      await updateProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Failed to update product',
        error: error.message,
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const expectedResult = { message: 'Product deleted successfully' };

      mockRequest.params = { id: '1' };

      (productService.deleteProduct as jest.Mock).mockResolvedValue(expectedResult);

      await deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(productService.deleteProduct).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Product deleted successfully' });
    });

    it('should return 400 for invalid ID', async () => {
      mockRequest.params = { id: 'abc' };

      await deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid product ID. Must be a number.' });
    });

    it('should return 404 if product not found', async () => {
      mockRequest.params = { id: '1' };

      (productService.deleteProduct as jest.Mock).mockResolvedValue(null);

      await deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });

    it('should handle errors', async () => {
      const error = new Error('Delete failed');
      mockRequest.params = { id: '1' };

      (productService.deleteProduct as jest.Mock).mockRejectedValue(error);

      await deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Failed to delete product', error: error.message });
    });
  });
});