import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import {verifyToken} from "../middleware/authMiddleware"

const router = Router();

router.get('/',verifyToken, PaymentController.getAll);
router.get('/user',verifyToken, PaymentController.getByUserId);
router.get('/:id',verifyToken, PaymentController.getById);
router.post('/',verifyToken, PaymentController.create);
router.put('/:id',verifyToken, PaymentController.update);
router.delete('/:id',verifyToken, PaymentController.delete);

export default router;