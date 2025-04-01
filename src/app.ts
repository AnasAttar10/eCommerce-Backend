import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import path from "path";
import cors from "cors";
import hpp from "hpp";
import ExpressMongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import ApiError from "@utils/apiError";
import globalError from "@middleware/errorMiddleware";
//routes
import brandRoutes from "@routes/brandRoute";
import categoryRoutes from "@routes/categoryRoute";
import subCategoryRoutes from "@routes/subCategoryRoute";
import productRoutes from "@routes/productRoute";
import userRoutes from "@routes/userRoute";
import authRoutes from "@routes/authRoute";
import reviewRoutes from "@routes/reviewRoute";
import wishlistRoutes from "@routes/wishlistRoute";
import addressRoutes from "@routes/addressRoute";
import couponRoutes from "@routes/couponRoute";
import cartRoutes from "@routes/cartRoute";
import ordersRoutes from "@routes/orderRoute";
import { webhookCheckout } from "@services/orderService";
const app = express();
app.use(cors());
app.options("*", cors());
app.use(compression());
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhookCheckout
);
// Middleware
app.use(function (req: Request, res: Response, next: NextFunction) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );

  next();
});

if (process.env.NODE_ENV == "development") app.use(morgan("dev"));
app.use(ExpressMongoSanitize());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "node_modules")));
app.use(hpp());
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/subCategories", subCategoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/address", addressRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", ordersRoutes);
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(`Can't found this route ${req.originalUrl}`, 400));
});
// Global error handling middleware (to Express errors )
app.use(globalError);
export default app;
