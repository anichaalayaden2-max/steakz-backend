import { Router } from "express";
import { getReceipts, getReceiptById, createReceipt, deleteReceipt, } from "../controllers/receiptController.js";
const router = Router();
router.get("/", getReceipts);
router.get("/:id", getReceiptById);
router.post("/", createReceipt);
router.delete("/:id", deleteReceipt);
export default router;
