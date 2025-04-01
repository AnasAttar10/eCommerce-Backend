import mongoose, { Query } from "mongoose";
import { TCartItem } from "./cart";
import { TAddresses } from "./user";
type TOrder = {
  user: mongoose.Types.ObjectId;
  cartItems: TCartItem[];
  taxPrice: number;
  shippingAddress: TAddresses;
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethodType: "card" | "cash";
  isPaid: boolean;
  isDelivered: boolean;
  paidAt: Date;
  deliveredAt: Date;
};
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order must be belong to user"],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        color: String,
        price: Number,
      },
    ],

    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingAddress: {
      alias: String,
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
      type: Number,
    },
    paymentMethodType: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre<Query<TOrder, TOrder>>(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name profileImg email phone",
  }).populate({
    path: "cartItems.product",
    select: "title imageCover ",
  });

  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
