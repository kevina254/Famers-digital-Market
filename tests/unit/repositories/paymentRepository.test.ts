import { PaymentRepository } from '../../../src/repository/paymentRepository';
import { getPool } from '../../../src/db/config';
import sql from '../../../src/db/config';

jest.mock('../../../src/db/config');

describe('Payment Repository', () => {
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

  describe('getAll', () => {
    it('should return all payments', async () => {
      const mockPayments = [
        {
          payment_id: 1,
          order_id: 1,
          payment_method: 'M-Pesa',
          reference: 'REF123',
          payment_date: '2023-01-01',
          payment_status: 'completed'
        }
      ];
      mockRequest.query.mockResolvedValue({ recordset: mockPayments });

      const result = await PaymentRepository.getAll();

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.query).toHaveBeenCalledWith('SELECT * FROM Payment');
      expect(result).toEqual(mockPayments);
    });
  });

  describe('getById', () => {
    it('should return payment by ID', async () => {
      const mockPayment = {
        payment_id: 1,
        order_id: 1,
        payment_method: 'M-Pesa',
        reference: 'REF123',
        payment_date: '2023-01-01',
        payment_status: 'completed'
      };
      mockRequest.query.mockResolvedValue({ recordset: [mockPayment] });

      const result = await PaymentRepository.getById(1);

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('id', sql.Int, 1);
      expect(mockRequest.query).toHaveBeenCalledWith('SELECT * FROM Payment WHERE payment_id = @id');
      expect(result).toEqual(mockPayment);
    });

    it('should return null if payment not found', async () => {
      mockRequest.query.mockResolvedValue({ recordset: [] });

      const result = await PaymentRepository.getById(1);

      expect(result).toBeNull();
    });
  });

  describe('getByUserId', () => {
    it('should return payments by user ID', async () => {
      const mockPayments = [
        {
          payment_id: 1,
          order_id: 1,
          payment_method: 'M-Pesa',
          reference: 'REF123',
          payment_date: '2023-01-01',
          payment_status: 'completed'
        }
      ];
      mockRequest.query.mockResolvedValue({ recordset: mockPayments });

      const result = await PaymentRepository.getByUserId(1);

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('userId', sql.Int, 1);
      expect(mockRequest.query).toHaveBeenCalledWith(`
        SELECT p.* FROM Payment p
        JOIN OrderTable o ON p.order_id = o.order_id
        WHERE o.user_id = @userId
      `);
      expect(result).toEqual(mockPayments);
    });
  });

  describe('create', () => {
    it('should create a new payment', async () => {
      const payment = {
        order_id: 1,
        payment_method: 'M-Pesa',
        reference: 'REF123',
        payment_date: '2023-01-01',
        payment_status: 'pending'
      };
      mockRequest.query.mockResolvedValue({});

      await PaymentRepository.create(payment);

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('order_id', sql.Int, payment.order_id);
      expect(mockRequest.input).toHaveBeenCalledWith('payment_method', sql.VarChar, payment.payment_method);
      expect(mockRequest.input).toHaveBeenCalledWith('reference', sql.VarChar, payment.reference);
      expect(mockRequest.input).toHaveBeenCalledWith('payment_date', sql.DateTime, payment.payment_date);
      expect(mockRequest.input).toHaveBeenCalledWith('payment_status', sql.VarChar, payment.payment_status);
      expect(mockRequest.query).toHaveBeenCalledWith(`
        INSERT INTO Payment (order_id, payment_method, reference, payment_date, payment_status)
        VALUES (@order_id, @payment_method, @reference, @payment_date, @payment_status)
      `);
    });
  });

  describe('update', () => {
    it('should update an existing payment', async () => {
      const updateData = {
        payment_status: 'completed'
      };
      mockRequest.query.mockResolvedValue({});

      await PaymentRepository.update(1, updateData);

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('id', sql.Int, 1);
      expect(mockRequest.input).toHaveBeenCalledWith('payment_method', sql.VarChar, null);
      expect(mockRequest.input).toHaveBeenCalledWith('reference', sql.VarChar, null);
      expect(mockRequest.input).toHaveBeenCalledWith('payment_date', sql.DateTime, null);
      expect(mockRequest.input).toHaveBeenCalledWith('payment_status', sql.VarChar, updateData.payment_status);
      expect(mockRequest.query).toHaveBeenCalledWith(`
        UPDATE Payment
        SET payment_method = @payment_method,
            reference = @reference,
            payment_date = @payment_date,
            payment_status = @payment_status
        WHERE payment_id = @id
      `);
    });
  });

  describe('delete', () => {
    it('should delete a payment', async () => {
      mockRequest.query.mockResolvedValue({});

      await PaymentRepository.delete(1);

      expect(getPool).toHaveBeenCalled();
      expect(mockPool.request).toHaveBeenCalled();
      expect(mockRequest.input).toHaveBeenCalledWith('id', sql.Int, 1);
      expect(mockRequest.query).toHaveBeenCalledWith('DELETE FROM Payment WHERE payment_id = @id');
    });
  });
});