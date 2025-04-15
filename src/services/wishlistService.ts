import User from "@models/user";
import { CustomRequest } from "../types/costumeRequest";
import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import Product from "@models/product";
import ApiError from "@utils/apiError";

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist
// @access  Protected/User
export const addProductToWishlist = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { wishlist: req.body.productId },
      },
      { new: true }
    );
    res.status(200).json({
      status: "success",
      message: "Product added successfully to your wishlist.",
      data: user?.wishlist,
    });
  }
);

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Protected/User
export const removeProductFromWishlist = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { wishlist: req.params.productId },
      },
      { new: true }
    );
    res.status(200).json({
      status: "success",
      message: "Product removed successfully from your wishlist.",
      data: user?.wishlist,
    });
  }
);

// @desc    Get logged user wishlist
// @route   GET /api/v1/wishlist
// @access  Protected/User
export const getLoggedUserWishlist = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id).populate("wishlist");

    res.status(200).json({
      status: "success",
      results: user?.wishlist.length,
      data: user?.wishlist,
    });
  }
);

// @desc    Add localStorageProducts to  wishlist
// @route   POST /api/v1/wishlist/sync
// @access  Private/User
export const syncWishlistAfterLogin = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const wishlistItems: string[] = req.body;

    if (!Array.isArray(wishlistItems) || wishlistItems.length === 0) {
      return next(new ApiError(`No items to sync`, 404));
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { wishlist: { $each: wishlistItems } },
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      numOfCartItems: user?.wishlist.length,
      data: user?.wishlist,
    });
  }
);
