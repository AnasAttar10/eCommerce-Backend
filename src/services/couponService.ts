import Coupon from "@models/coupon";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlersFactory";

// @desc    Get list of coupons
// @route   GET /api/v1/coupons
// @access  Private/Admin-Manager
export const getCoupons = getAll(Coupon);

// @desc    Get specific coupon by id
// @route   GET /api/v1/coupons/:id
// @access  Private/Admin-Manager
export const getCoupon = getOne(Coupon);

// @desc    Create coupon
// @route   POST  /api/v1/coupons
// @access  Private/Admin-Manager
export const createCoupon = createOne(Coupon);

// @desc    Update specific coupon
// @route   PUT /api/v1/coupons/:id
// @access  Private/Admin-Manager
export const updateCoupon = updateOne(Coupon);

// @desc    Delete specific coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Private/Admin-Manager
export const deleteCoupon = deleteOne(Coupon);
