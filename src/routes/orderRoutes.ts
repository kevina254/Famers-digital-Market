import express from "express";
import * as orderController from "../controllers/orderController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/",verifyToken, orderController.createOrder);
router.get("/",verifyToken, orderController.getOrders);
router.get("/:id",verifyToken, orderController.getOrderById);
router.put("/:id", verifyToken,orderController.updateOrder);
router.delete("/:id",verifyToken, orderController.deleteOrder);

export default router;