import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentServices';

export const PaymentController = {
  async getAll(req: Request, res: Response) {
    const payments = await PaymentService.getAll();
    res.json(payments);
  },

  async getById(req: Request, res: Response) {
    const payment = await PaymentService.getById(Number(req.params.id));
    payment ? res.json(payment) : res.status(404).send('Payment not found');
  },

  async getByUserId(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const payments = await PaymentService.getByUserId(userId);
    res.json(payments);
  },

  async create(req: Request, res: Response) {
    await PaymentService.create(req.body);
    res.status(201).send('Payment created');
  },

  async update(req: Request, res: Response) {
    await PaymentService.update(Number(req.params.id), req.body);
    res.send('Payment updated');
  },

  async delete(req: Request, res: Response) {
    await PaymentService.delete(Number(req.params.id));
    res.send('Payment deleted');
  },
};