import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  updateCategory,
} from "@services/categoryService";
import {
  createCategoryValidator,
  deleteCategoryValidator,
  getCategoryValidator,
  updateCategoryValidator,
} from "@validators/categoryValidator";
import subCategoryRoute from "./subCategoryRoute";
import {
  uploadSingleImage,
  uploadSingleToCloudinary,
} from "@middleware/multer";
import { allowedTo, protect } from "@services/authService";
const router = express.Router();
router.use("/:category/subCategories", subCategoryRoute);
router.get("/", getAllCategories);
router.get("/:id", getCategoryValidator, getCategory);
router.post(
  "/",
  protect,
  allowedTo("admin", "manager"),
  uploadSingleImage,
  createCategoryValidator,
  uploadSingleToCloudinary("e-Commerce/categories"),
  createCategory
);
router.put(
  "/:id",
  protect,
  allowedTo("admin", "manager"),
  uploadSingleImage,
  updateCategoryValidator,
  uploadSingleToCloudinary("e-Commerce/categories"),
  updateCategory
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin"),
  deleteCategoryValidator,
  deleteCategory
);

export default router;
