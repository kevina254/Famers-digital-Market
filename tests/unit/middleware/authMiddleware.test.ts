import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { verifyToken, verifyFarmer, verifyAdmin, isAuthenticated } from '../../../src/middleware/authMiddleware';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('should call next() for valid token', () => {
      const validToken = 'valid.jwt.token';
      const decodedPayload = { userId: 1, email: 'test@example.com', role: 'farmer' };

      mockRequest.headers = { authorization: `Bearer ${validToken}` };
      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

      // Mock process.env.JWT_SECRET
      const originalEnv = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'test-secret';

      verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(validToken, 'test-secret');
      expect((mockRequest as any).user).toEqual(decodedPayload);
      expect(mockNext).toHaveBeenCalled();

      // Restore original env
      process.env.JWT_SECRET = originalEnv;
    });

    it('should return 401 for missing authorization header', () => {
      mockRequest.headers = {};

      verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Access denied. No token provided.' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid header format', () => {
      mockRequest.headers = { authorization: 'InvalidFormat' };

      verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Access denied. No token provided.' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 for invalid token', () => {
      const invalidToken = 'invalid.jwt.token';
      mockRequest.headers = { authorization: `Bearer ${invalidToken}` };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('verifyFarmer', () => {
    it('should call next() for farmer role', () => {
      (mockRequest as any).user = { userId: 1, email: 'farmer@example.com', role: 'farmer' };

      verifyFarmer(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 for unauthenticated user', () => {
      mockRequest = {};

      verifyFarmer(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not authenticated' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 for non-farmer role', () => {
      (mockRequest as any).user = { userId: 1, email: 'admin@example.com', role: 'admin' };

      verifyFarmer(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Access denied. Farmers only' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('verifyAdmin', () => {
    it('should call next() for admin role', () => {
      (mockRequest as any).user = { userId: 1, email: 'admin@example.com', role: 'admin' };

      verifyAdmin(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 for unauthenticated user', () => {
      mockRequest = {};

      verifyAdmin(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not authenticated' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 for non-admin role', () => {
      (mockRequest as any).user = { userId: 1, email: 'farmer@example.com', role: 'farmer' };

      verifyAdmin(mockRequest as any, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Forbidden – Admins only' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('should call next() for valid token', () => {
      const validToken = 'valid.jwt.token';
      const decodedPayload = { userId: 1, email: 'test@example.com', role: 'user' };

      mockRequest.headers = { authorization: `Bearer ${validToken}` };
      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

      // Mock process.env.JWT_SECRET
      const originalEnv = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'test-secret';

      isAuthenticated(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(validToken, 'test-secret');
      expect((mockRequest as any).user).toEqual(decodedPayload);
      expect(mockNext).toHaveBeenCalled();

      // Restore original env
      process.env.JWT_SECRET = originalEnv;
    });

    it('should return 401 for missing token', () => {
      mockRequest.headers = {};

      isAuthenticated(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', () => {
      const invalidToken = 'invalid.jwt.token';
      mockRequest.headers = { authorization: `Bearer ${invalidToken}` };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      isAuthenticated(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});