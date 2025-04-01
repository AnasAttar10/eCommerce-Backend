import Product from "@models/product";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlersFactory";

// @desc    Get list of products
// @route   GET /api/v1/products
// @access  Public
export const getProducts = getAll(Product, "title");

// @desc    Get specific product by id
// @route   GET /api/v1/products/:id
// @access  Public
export const getProduct = getOne(Product);

// @desc    Create product
// @route   POST  /api/v1/products
// @access  Private
export const createProduct = createOne(Product);
// @desc    Update specific product
// @route   PUT /api/v1/products/:id
// @access  Private
export const updateProduct = updateOne(Product);

// @desc    Delete specific product
// @route   DELETE /api/v1/products/:id
// @access  Private
export const deleteProduct = deleteOne(Product);
