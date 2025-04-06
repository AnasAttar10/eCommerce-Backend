import mongoose, { Query } from "mongoose";
export type TCartItem = {
  _id?: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  color: string;
  price: number;
};
export type TCart = {
  cartItems: TCartItem[];
  totalCartPrice: number;
  totalPriceAfterDiscount?: number;
  user: mongoose.Types.ObjectId;
};
const cartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        color: String,
        price: Number,
      },
    ],
    totalCartPrice: Number,
    totalPriceAfterDiscount: Number,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
cartSchema.pre<Query<TCart, TCart>>(/^find/, function (next) {
  this.populate({
    path: "cartItems.product",
    select: "imageCover title sold quantity",
  });
  next();
});
const Cart = mongoose.model<TCart>("Cart", cartSchema);
export default Cart;
