import { allowedTo, protect } from "@services/authService";
import {
  addProductToWishlist,
  getLoggedUserWishlist,
  removeProductFromWishlist,
  syncWishlistAfterLogin,
} from "@services/wishlistService";
import express from "express";

const router = express.Router();

router.use(protect, allowedTo("user"));
router.post("/sync", syncWishlistAfterLogin);
router.get("/", getLoggedUserWishlist);
router.post("/", addProductToWishlist);
router.delete("/:productId", removeProductFromWishlist);

export default router;
