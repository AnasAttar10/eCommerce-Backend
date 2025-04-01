import SubCategory from "@models/subCategory";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlersFactory";
import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "../types/costumeRequest";
export const setCategoryIdToBody = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // Nested route (Create)
  if (!req.body.category) req.body.category = req.params.category;
  next();
};

// Nested route
// GET /api/v1/categories/:categoryId/subcategories
export const createFilterObj = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  let filterObject = {};
  if (req.params.category) filterObject = { category: req.params.category };
  req.filterObj = filterObject;
  next();
};

// @desc    Get list of subcategories
// @route   GET /api/v1/subcategories
// @access  Public
export const getSubCategories = getAll(SubCategory);

// @desc    Get specific subcategory by id
// @route   GET /api/v1/subcategories/:id
// @access  Public
export const getSubCategory = getOne(SubCategory);

// @desc    Create subCategory
// @route   POST  /api/v1/subcategories
// @access  Private
export const createSubCategory = createOne(SubCategory);

// @desc    Update specific subcategory
// @route   PUT /api/v1/subcategories/:id
// @access  Private
export const updateSubCategory = updateOne(SubCategory);

// @desc    Delete specific subCategory
// @route   DELETE /api/v1/subcategories/:id
// @access  Private
export const deleteSubCategory = deleteOne(SubCategory);
