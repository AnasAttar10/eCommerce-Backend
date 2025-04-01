import { allowedTo, protect } from "@services/authService";
import {
  createCoupon,
  deleteCoupon,
  getCoupon,
  getCoupons,
  updateCoupon,
} from "@services/couponService";
import {
  getCouponValidator,
  removeCouponValidator,
} from "@validators/couponValidation";
import express from "express";
const router = express.Router();

router.use(protect, allowedTo("admin", "manager"));

router.route("/").get(getCoupons).post(createCoupon);
router
  .route("/:id")
  .get(getCouponValidator, getCoupon)
  .put(updateCoupon)
  .delete(removeCouponValidator, deleteCoupon);

export default router;
