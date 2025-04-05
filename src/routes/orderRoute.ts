import { allowedTo, protect } from "@services/authService";
import {
  checkoutSession,
  createCashOrder,
  filterOrderForLoggedUser,
  filterOrdersByUserEmail,
  findAllOrders,
  findSpecificOrder,
  removeOrder,
  updateOrderToDelivered,
  updateOrderToPaid,
} from "@services/orderService";
import express from "express";
const router = express.Router();
router.use(protect);
router.post("/checkout-session/:cartId", allowedTo("user"), checkoutSession);
router.post("/:cartId", allowedTo("user"), createCashOrder);
router.get(
  "/admin",
  allowedTo("admin", "manager"),
  filterOrdersByUserEmail,
  findAllOrders
);
router.get(
  "/",
  allowedTo("user", "admin", "manager"),
  filterOrderForLoggedUser,
  findAllOrders
);
router.get("/:id", findSpecificOrder);
router.put("/:id/pay", allowedTo("admin", "manager"), updateOrderToPaid);
router.put(
  "/:id/deliver",
  allowedTo("admin", "manager"),
  updateOrderToDelivered
);
router.delete("/:id", allowedTo("admin", "manager"), removeOrder);

export default router;
