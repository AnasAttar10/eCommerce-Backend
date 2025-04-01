import mongoose, { Model, Query, Schema } from "mongoose";
import Product from "./product";
export type TReview = {
  title: string;
  ratings: number;
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
};
interface ReviewModel extends Model<TReview> {
  calcAverageRatingsAndQuantity(
    productId: mongoose.Types.ObjectId
  ): Promise<void>;
}
type TResult = {
  avgRatings: number;
  ratingsQuantity: number;
  _id: mongoose.Schema.Types.ObjectId;
};
const reviewSchema = new Schema<TReview>(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, "Min ratings value is 1.0"],
      max: [5, "Max ratings value is 5.0"],
      required: [true, "review ratings required"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to user"],
    },
    // parent reference (one to many)
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to product"],
    },
  },
  { timestamps: true }
);

reviewSchema.pre<Query<TReview, TReview>>(/^find/, function (next) {
  this.populate({ path: "user", select: "name" });
  next();
});

reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  productId: mongoose.Types.ObjectId
): Promise<void> {
  const result: TResult[] = await this.aggregate([
    // Stage 1 : get all reviews in specific product
    {
      $match: { product: productId },
    },
    // Stage 2: Grouping reviews based on productID and calc avgRatings, ratingsQuantity
    {
      $group: {
        _id: "product",
        avgRatings: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].avgRatings,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post("save", function (this: TReview) {
  Review.calcAverageRatingsAndQuantity(this.product);
});

reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.calcAverageRatingsAndQuantity(doc.product);
  }
});

const Review = mongoose.model<TReview, ReviewModel>("Review", reviewSchema);
export default Review;
