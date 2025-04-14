import { allowedTo, protect } from "@services/authService";
import {
  addProductToCart,
  applyCoupon,
  clearCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  syncCartAfterLogin,
  updateCartItemQuantity,
} from "@services/cartService";
import express from "express";
const router = express.Router();
router.use(protect, allowedTo("user"));
router.get("/", getLoggedUserCart);
router.post("/", addProductToCart);
router.post("/sync", syncCartAfterLogin);
router.put("/applyCoupon", applyCoupon);
router.put("/:itemId", updateCartItemQuantity);
router.delete("/:itemId", removeSpecificCartItem);
router.delete("/", clearCart);
export default router;
