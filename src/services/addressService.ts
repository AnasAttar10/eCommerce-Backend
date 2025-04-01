import User from "@models/user";
import { CustomRequest } from "../types/costumeRequest";
import { Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";

// @desc    Add address to user addresses list
// @route   POST /api/v1/addresses
// @access  Protected/User
export const addAddress = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // $addToSet => add address object to user addresses  array if address not exist
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { addresses: req.body },
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Address added successfully.",
      data: user?.addresses,
    });
  }
);

// @desc    Remove address from user addresses list
// @route   DELETE /api/v1/addresses/:addressId
// @access  Protected/User
export const removeAddress = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { addresses: { _id: req.params.addressId } },
      },
      { new: true }
    );
    console.log(user);

    res.status(200).json({
      status: "success",
      message: "Address removed successfully.",
      data: user?.addresses,
    });
  }
);

// @desc    Get logged user addresses list
// @route   GET /api/v1/addresses
// @access  Protected/User
export const getLoggedUserAddresses = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      status: "success",
      results: user?.addresses?.length,
      data: user?.addresses,
    });
  }
);
