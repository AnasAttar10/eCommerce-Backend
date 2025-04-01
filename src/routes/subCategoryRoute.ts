import express from "express";
import {
  createFilterObj,
  createSubCategory,
  deleteSubCategory,
  getSubCategories,
  getSubCategory,
  setCategoryIdToBody,
  updateSubCategory,
} from "@services/subCategoryService";
import {
  createSubCategoryValidator,
  deleteSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
} from "@validators/subCategoryValidator";
import { allowedTo, protect } from "@services/authService";

const router = express.Router({ mergeParams: true });
router.get("/", setCategoryIdToBody, createFilterObj, getSubCategories);
router.get("/:id", getSubCategoryValidator, getSubCategory);
router.post(
  "/",
  protect,
  allowedTo("admin", "manager"),
  createSubCategoryValidator,
  setCategoryIdToBody,
  createFilterObj,
  createSubCategory
);
router.put(
  "/:id",
  protect,
  allowedTo("admin", "manager"),
  updateSubCategoryValidator,
  updateSubCategory
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin"),
  deleteSubCategoryValidator,
  deleteSubCategory
);
export default router;
