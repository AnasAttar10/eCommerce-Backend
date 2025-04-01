import express from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "@services/productService";
import {
  createProductValidator,
  deleteProductValidator,
  getProductValidator,
  updateProductValidator,
} from "@validators/productValidator";
import {
  setDBImagesToBody,
  uploadMixImages,
  uploadMixToCloudinary,
} from "@middleware/multer";
import { allowedTo, protect } from "@services/authService";
import reviewRoute from "@routes/reviewRoute";
const router = express.Router();
router.use("/:product/reviews", reviewRoute);
router.get("/", getProducts);
router.get("/:id", getProductValidator, getProduct);
router.post(
  "/",
  protect,
  allowedTo("admin", "manager"),
  uploadMixImages([
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  createProductValidator,
  uploadMixToCloudinary("e-Commerce/products"),
  createProduct
);
router.put(
  "/:id",
  protect,
  allowedTo("admin", "manager"),
  uploadMixImages([
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  updateProductValidator,
  uploadMixToCloudinary("e-Commerce/products"),
  setDBImagesToBody,
  updateProduct
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin"),
  deleteProductValidator,
  deleteProduct
);

export default router;
