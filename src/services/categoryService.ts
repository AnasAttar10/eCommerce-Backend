import Category from "@models/category";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "@services/handlersFactory";

// @desc    Get list of categories
// @route   GET /api/v1/categories
// @access  Public
export const getAllCategories = getAll(Category, "name");

// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
export const getCategory = getOne(Category);

// @desc    Create category
// @route   POST  /api/v1/categories
// @access  Private/Admin-Manager
export const createCategory = createOne(Category);

// @desc    Update specific category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin-Manager
export const updateCategory = updateOne(Category);

// @desc    Delete specific category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
export const deleteCategory = deleteOne(Category);
