import { allowedTo, protect } from "@services/authService";
import {
  createFilterObj,
  createReview,
  deleteReview,
  getReview,
  getReviews,
  setProductIdAndUserIdToBody,
  updateReview,
} from "@services/reviewService";
import {
  createReviewValidator,
  deleteReviewValidator,
  getReviewValidator,
  updateReviewValidator,
} from "@validators/reviewValidator";
import express from "express";
const router = express.Router({ mergeParams: true });
router.get("/", createFilterObj, getReviews);
router.get("/:id", getReviewValidator, getReview);
router.post(
  "/",
  protect,
  allowedTo("user"),
  setProductIdAndUserIdToBody,
  createReviewValidator,
  createReview
);
router.put(
  "/:id",
  protect,
  allowedTo("user"),
  updateReviewValidator,
  updateReview
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin", "manager", "user"),
  deleteReviewValidator,
  deleteReview
);
export default router;
