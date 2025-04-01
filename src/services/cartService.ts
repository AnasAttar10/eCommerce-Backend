import Cart, { TCart } from "@models/cart";
import { CustomRequest } from "../types/costumeRequest";
import { Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import Product from "@models/product";
import ApiError from "@utils/apiError";
import Coupon from "@models/coupon";

const calcTotalCartPrice = (cart: TCart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

// @desc    Add product to  cart
// @route   POST /api/v1/cart
// @access  Private/User
export const addProductToCart = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { productId, color } = req.body;
    const product = await Product.findById(productId);
    if (!product)
      return next(new ApiError(`no product with this id ${productId}`, 404));

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        cartItems: [{ product: productId, color, price: product?.price }],
      });
    } else {
      const productIndex = cart.cartItems.findIndex((item) =>
        color
          ? item?.product?._id.toString() === productId.toString() &&
            item.color === color
          : item?.product?._id.toString() === productId.toString()
      );

      if (productIndex > -1) {
        const cartItem = cart.cartItems[productIndex];
        cartItem.quantity += 1;
        cart.cartItems[productIndex] = cartItem;
      } else {
        cart.cartItems.push({
          product: productId,
          color,
          quantity: 1,
          price: product.price,
        });
      }
    }

    // Calculate total cart price
    calcTotalCartPrice(cart);
    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Product added to cart successfully",
      numOfCartItems: cart.cartItems.length,
      data: cart,
    });
  }
);

// @desc    Get logged user cart
// @route   GET /api/v1/cart
// @access  Private/User
export const getLoggedUserCart = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // return next(
      //   new ApiError(`There is no cart for this user id : ${req.user._id}`, 404)
      // );
      res.status(200).json({
        status: "success",
        numOfCartItems: 0,
      });
    } else {
      res.status(200).json({
        status: "success",
        numOfCartItems: cart.cartItems.length,
        data: cart,
      });
    }
  }
);

// @desc    Remove specific cart item
// @route   DELETE /api/v1/cart/:itemId
// @access  Private/User
export const removeSpecificCartItem = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      {
        $pull: { cartItems: { _id: req.params.itemId } },
      },
      { new: true }
    );
    if (!cart) return next(`there is no cart to this user id ${req.user._id}`);
    calcTotalCartPrice(cart);
    cart.save();

    res.status(200).json({
      status: "success",
      numOfCartItems: cart.cartItems.length,
      data: cart,
    });
  }
);

// @desc    clear logged user cart
// @route   DELETE /api/v1/cart
// @access  Private/User
export const clearCart = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.status(204).send();
  }
);

// @desc    Update specific cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private/User
export const updateCartItemQuantity = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return next(
        new ApiError(`there is no cart for user ${req.user._id}`, 404)
      );
    }

    const itemIndex = cart.cartItems.findIndex(
      (item) => item?._id?.toString() === req.params.itemId
    );
    if (itemIndex > -1) {
      const cartItem = cart.cartItems[itemIndex];
      cartItem.quantity = quantity;
      cart.cartItems[itemIndex] = cartItem;
    } else {
      return next(
        new ApiError(`there is no item for this id :${req.params.itemId}`, 404)
      );
    }

    calcTotalCartPrice(cart);

    await cart.save();

    res.status(200).json({
      status: "success",
      numOfCartItems: cart.cartItems.length,
      data: cart,
    });
  }
);

// @desc    Apply coupon on logged user cart
// @route   PUT /api/v1/cart/applyCoupon
// @access  Private/User
export const applyCoupon = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const coupon = await Coupon.findOne({
      name: req.body.coupon,
      expire: { $gt: Date.now() },
    });
    if (!coupon) {
      return next(new ApiError(`Coupon is invalid or expired`, 404));
    }

    const cart = await Cart.findOne({ user: req.user._id });
    console.log("cart");

    console.log(cart);

    if (!cart)
      return next(
        new ApiError(`there is no cart to this user id ${req.user._id}`, 404)
      );
    const totalPrice = cart.totalCartPrice;

    const totalPriceAfterDiscount = (
      totalPrice -
      (totalPrice * coupon.discount) / 100
    ).toFixed(2);

    cart.totalPriceAfterDiscount =
      parseInt(totalPriceAfterDiscount) || totalPrice;
    await cart.save();

    res.status(200).json({
      status: "success",
      numOfCartItems: cart.cartItems.length,
      data: cart,
    });
  }
);
