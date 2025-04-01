import Stripe from "stripe";
import Cart, { TCartItem } from "@models/cart";
import { CustomRequest } from "../types/costumeRequest";
import { Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import { getAll, getOne } from "./handlersFactory";
import ApiError from "@utils/apiError";
import Order from "@models/order";
import Product from "@models/product";
import User from "@models/user";
const stripe = new Stripe(process.env.STRIPE_KEY as string);

// @desc    create cash order
// @route   POST /api/v1/orders/cartId
// @access  Protected/User
export const createCashOrder = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // app settings
    const taxPrice = 0;
    const shippingPrice = 0;

    const cart = await Cart.findById(req.params.cartId);
    if (!cart) {
      return next(
        new ApiError(`There is no such cart with id ${req.params.cartId}`, 404)
      );
    }

    const cartPrice = cart.totalPriceAfterDiscount
      ? cart.totalPriceAfterDiscount
      : cart.totalCartPrice;

    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

    const order = await Order.create({
      user: req.user._id,
      cartItems: cart.cartItems,
      shippingAddress: req.body.shippingAddress,
      totalOrderPrice,
    });

    if (order) {
      const bulkOption = cart.cartItems.map((item: TCartItem) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
        },
      }));
      await Product.bulkWrite(bulkOption, {});

      await Cart.findByIdAndDelete(req.params.cartId);
    }

    res.status(201).json({ status: "success", data: order });
  }
);

export const filterOrderForLoggedUser = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (req.user.role === "user") req.filterObj = { user: req.user._id };
    next();
  }
);

// @desc    Get all orders
// @route   POST /api/v1/orders
// @access  Protected/User-Admin-Manager
export const findAllOrders = getAll(Order);

// @desc    Get all orders
// @route   POST /api/v1/orders
// @access  Protected/User-Admin-Manager
export const findSpecificOrder = getOne(Order);

// @desc    Update order paid status to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Protected/Admin-Manager
export const updateOrderToPaid = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(
        new ApiError(
          `There is no such a order with this id:${req.params.id}`,
          404
        )
      );
    }
    if (!order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date(Date.now());
    } else {
      order.isPaid = false;
      order.paidAt = undefined;
    }

    const updatedOrder = await order.save();

    res.status(200).json({ status: "success", data: updatedOrder });
  }
);

// @desc    Update order delivered status
// @route   PUT /api/v1/orders/:id/deliver
// @access  Protected/Admin-Manager
export const updateOrderToDelivered = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(
        new ApiError(
          `There is no such a order with this id:${req.params.id}`,
          404
        )
      );
    }

    if (!order.isDelivered) {
      order.isDelivered = true;
      order.deliveredAt = new Date(Date.now());
    } else {
      order.isDelivered = false;
      order.deliveredAt = undefined;
    }

    const updatedOrder = await order.save();
    res.status(200).json({ status: "success", data: updatedOrder });
  }
);

// @desc    Get checkout session from stripe and send it as response
// @route   GET /api/v1/orders/checkout-session/cartId
// @access  Protected/User
export const checkoutSession = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // app settings
    const taxPrice = 0;
    const shippingPrice = 0;

    const cart = await Cart.findById(req.params.cartId);
    if (!cart) {
      return next(
        new ApiError(`There is no such cart with id ${req.params.cartId}`, 404)
      );
    }
    const cartPrice = cart.totalPriceAfterDiscount
      ? cart.totalPriceAfterDiscount
      : cart.totalCartPrice;

    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "ils",
            product_data: {
              name: "Your Order Total",
              // description: "Items purchased from your cart",
            },
            unit_amount: Math.round(totalOrderPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.protocol}://${req.get("host")}/profile/orders`,
      // success_url: FRONTEND_URL + "/profile/orders",
      cancel_url: `${req.protocol}://${req.get("host")}/api/v1/cart`,
      // cancel_url: FRONTEND_URL + "/cart",
      customer_email: req.user.email,
      client_reference_id: req.params.cartId,
      metadata: req.body.shippingAddress,
    });

    res.status(200).json({ status: "success", session });
  }
);

// const createCardOrder = async (session:any) => {
//   const cartId = session.client_reference_id;
//   const shippingAddress = session.metadata;
//   const oderPrice = session.amount_total / 100;

//   const cart = await Cart.findById(cartId);
//   const user = await User.findOne({ email: session.customer_email });

//   // 3) Create order with default paymentMethodType card
//   const order = await Order.create({
//     user: user?._id,
//     cartItems: cart?.cartItems,
//     shippingAddress,
//     totalOrderPrice: oderPrice,
//     isPaid: true,
//     paidAt: Date.now(),
//     paymentMethodType: "card",
//   });

//   // 4) After creating order, decrement product quantity, increment product sold
//   if (order) {
//     const bulkOption = cart?.cartItems.map((item) => ({
//       updateOne: {
//         filter: { _id: item.product },
//         update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
//       },
//     }));
//     await Product.bulkWrite(bulkOption, {});

//     // 5) Clear cart depend on cartId
//     await Cart.findByIdAndDelete(cartId);
//   }
// };

// @desc    This webhook will run when stripe payment success paid
// @route   POST /webhook-checkout
// @access  Protected/User
// exports.webhookCheckout = expressAsyncHandler(async (req, res, next) => {
//   const sig = req.headers["stripe-signature"];

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }
//   if (event.type === "checkout.session.completed") {
//     //  Create order
//     createCardOrder(event.data.object);
//   }

//   res.status(200).json({ received: true });
// });
