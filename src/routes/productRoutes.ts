import express from "express";
import { getAllProducts,getProduct } from "../controllers/productController";
import {verifyToken} from "../middleware/authMiddleware"
import { createProduct, deleteProduct, updateProduct } from "../controllers/productController";

const router = express.Router();


router.post("/",verifyToken, createProduct);
router.put ("/:id",verifyToken,updateProduct);
router. delete ("/:id",verifyToken,deleteProduct);
router.get("/", verifyToken, getAllProducts);
router.get("/:id",verifyToken ,getProduct)
export default router;
