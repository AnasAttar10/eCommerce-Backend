import express from "express";
import {
  createBrand,
  deleteBrand,
  getAllBrands,
  getBrand,
  updateBrand,
} from "@services/brandService";
import {
  createBrandValidator,
  deleteBrandValidator,
  getBrandValidator,
  updateBrandValidator,
} from "@validators/brandValidator";
import {
  uploadSingleImage,
  uploadSingleToCloudinary,
} from "@middleware/multer";
import { allowedTo, protect } from "@services/authService";

const router = express.Router();
router.get("/", getAllBrands);
router.get("/:id", getBrandValidator, getBrand);
router.post(
  "/",
  protect,
  allowedTo("admin", "manager"),
  uploadSingleImage,
  createBrandValidator,
  uploadSingleToCloudinary("e-Commerce/brands"),
  createBrand
);
router.put(
  "/:id",
  protect,
  allowedTo("admin", "manager"),
  uploadSingleImage,
  updateBrandValidator,
  uploadSingleToCloudinary("e-Commerce/brands"),
  updateBrand
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin"),
  deleteBrandValidator,
  deleteBrand
);
export default router;
