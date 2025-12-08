import { Router } from "express";
import {
  getAllOrders,
  getPendingOrdersForPayment,
  updateOrderStatus,
  approvePayment,
  assignDriver,
  getLogisticsByOrder,
  getAllDrivers,
  getAllLogistics
} from "../controllers/adminController";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware";

const router = Router();

// Only admin should access these routes
router.use(verifyToken, verifyAdmin);

// ORDERS
router.get("/orders", getAllOrders);
router.get("/orders/pending", getPendingOrdersForPayment);
router.patch("/orders/:id/status", updateOrderStatus);
router.post("/orders/:id/approve-payment", approvePayment);

// LOGISTICS
router.post("/orders/:id/assign-driver", assignDriver);
router.get("/orders/:id/logistics", getLogisticsByOrder);
router.get("/logistics", getAllLogistics);

// DRIVERS
router.get("/drivers", getAllDrivers);

export default router;
