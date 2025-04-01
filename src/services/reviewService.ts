import Review from "@models/review";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlersFactory";
import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "../types/costumeRequest";

// middlewares

// Nested route
// GET /api/v1/products/:productId/reviews
export const createFilterObj = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  let filterObject = {};
  console.log(req.params.productId);

  if (req.params.product) filterObject = { product: req.params.product };
  req.filterObj = filterObject;
  next();
};

// Nested route (Create)
export const setProductIdAndUserIdToBody = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.product) req.body.product = req.params.product;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// @desc    Get list of reviews
// @route   GET /api/v1/reviews
// @access  Public
export const getReviews = getAll(Review);

// @desc    Get specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
export const getReview = getOne(Review);

// @desc    Create review
// @route   POST  /api/v1/reviews
// @access  Private/Protect/User
export const createReview = createOne(Review);

// @desc    Update specific review
// @route   PUT /api/v1/reviews/:id
// @access  Private/Protect/User
export const updateReview = updateOne(Review);

// @desc    Delete specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Protect/User-Admin-Manager
export const deleteReview = deleteOne(Review);
