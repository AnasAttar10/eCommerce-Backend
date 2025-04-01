import { allowedTo, protect } from "@services/authService";
import {
  addProductToWishlist,
  getLoggedUserWishlist,
  removeProductFromWishlist,
} from "@services/wishlistService";
import express from "express";

const router = express.Router();

router.use(protect, allowedTo("user"));

router.get("/", getLoggedUserWishlist);
router.post("/", addProductToWishlist);
router.delete("/:productId", removeProductFromWishlist);

export default router;
