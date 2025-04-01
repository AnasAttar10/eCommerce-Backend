import mongoose, { Query, UpdateQuery } from "mongoose";
import he from "he";
import { TReview } from "./review";
type TProduct = {
  title: string;
  slug: string;
  cat_prefix: string;
  description: string;
  quantity: number;
  sold: number;
  price: number;
  priceAfterDiscount: number;
  colors: string[];
  imageCover: string;
  images: string[];
  category: mongoose.Types.ObjectId;
  subcategories: mongoose.Types.ObjectId[];
  brand: mongoose.Types.ObjectId;
  ratingsAverage: number;
  ratingsQuantity: number;
};
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Too short product title"],
      maxlength: [100, "Too long product title"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    cat_prefix: { type: String },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [3, "Too short product description"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      trim: true,
      max: [200000, "Too long product price"],
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: [String],

    imageCover: {
      type: String,
      required: [true, "Product Image cover is required"],
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Product must be belong to category"],
    },
    subcategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "SubCategory",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
      // set: (val) => Math.round(val * 10) / 10, // 3.3333 * 10 => 33.333 => 33 => 3.3
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.pre("save", async function (next) {
  if (!this.isModified("category")) return next();
  const category = await mongoose.model("Category").findById(this.category);
  if (category) {
    this.cat_prefix = category.slug;
  }
  next();
});

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

// Mongoose query middleware
productSchema.pre<Query<TProduct, TProduct>>(/^find/, function (next) {
  if (this.getQuery()._id)
    this.populate({
      path: "category",
      select: "name _id",
    });
  next();
});

productSchema.pre<Query<TReview[], TReview>>(/^find/, function (next) {
  // if (this.getQuery()._id) {
  this.populate({
    path: "reviews",
    select: "title -_id",
  });
  // }
  next();
});

productSchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.title) {
      ret.title = he.decode(ret.title);
    }
    if (ret.description) {
      ret.description = he.decode(ret.description);
    }
    return ret;
  },
});

const Product = mongoose.model<TProduct>("Product", productSchema);
export default Product;
