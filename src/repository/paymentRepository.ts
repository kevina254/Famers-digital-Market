import { getPool } from '../db/config';
import { Payment } from '../types/paymentTypes'; 
import sql from "mssql"

export const PaymentRepository = {
  async getAll(): Promise<Payment[]> {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Payment');
    return result.recordset;
  },

  async getById(id: number): Promise<Payment | null> {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Payment WHERE payment_id = @id');
    return result.recordset[0] || null;
  },

  async getByUserId(userId: number): Promise<Payment[]> {
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT p.* FROM Payment p
        JOIN OrderTable o ON p.order_id = o.order_id
        WHERE o.user_id = @userId
      `);
    return result.recordset;
  },

  async create(payment: Omit<Payment, 'payment_id'>): Promise<void> {
    const pool = await getPool();
    await pool.request()
      .input('order_id', sql.Int, payment.order_id)
      .input('payment_method', sql.VarChar, payment.payment_method)
      .input('reference', sql.VarChar, payment.reference)
      .input('payment_date', sql.DateTime, payment.payment_date)
      .input('payment_status', sql.VarChar, payment.payment_status)
      .query(`
        INSERT INTO Payment (order_id, payment_method, reference, payment_date, payment_status)
        VALUES (@order_id, @payment_method, @reference, @payment_date, @payment_status)
      `);
  },

  async update(id: number, payment: Partial<Payment>): Promise<void> {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('payment_method', sql.VarChar, payment.payment_method ?? null)
      .input('reference', sql.VarChar, payment.reference ?? null)
      .input('payment_date', sql.DateTime, payment.payment_date ?? null)
      .input('payment_status', sql.VarChar, payment.payment_status ?? null)
      .query(`
        UPDATE Payment
        SET payment_method = @payment_method,
            reference = @reference,
            payment_date = @payment_date,
            payment_status = @payment_status
        WHERE payment_id = @id
      `);
  },

  async delete(id: number): Promise<void> {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Payment WHERE payment_id = @id');
  },
};
