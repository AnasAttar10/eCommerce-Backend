import bcrypt from "bcrypt";
import User from "@models/user";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlersFactory";
import expressAsyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ApiError from "@utils/apiError";
import { CustomRequest } from "../types/costumeRequest";
import createToken from "@utils/createToken";

const secureDataToAdmin = [
  "password",
  "passwordChangedAt",
  "passwordResetCode",
  "passwordResetExpires",
  "passwordResetVerified",
];
const secureDataToUser = [
  "role",
  "active",
  "password",
  "passwordChangedAt",
  "passwordResetCode",
  "passwordResetExpires",
  "passwordResetVerified",
];
// middlewares
export const removeAdminSecureDataFromBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;
  Object.keys(body).forEach((element) => {
    if (secureDataToAdmin.includes(element)) {
      delete body[element];
    }
  });
  next();
};
export const removeUserSecureDataFromBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;
  Object.keys(body).forEach((element) => {
    if (secureDataToUser.includes(element)) {
      delete body[element];
    }
  });
  next();
};

// Admin Actions

// @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private/Admin
export const getUsers = getAll(User);

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private/Admin
export const getUser = getOne(User);

// @desc    Create user
// @route   POST  /api/v1/users
// @access  Private/Admin
export const createUser = createOne(User);

// @desc    Update specific user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
export const updateUser = updateOne(User);

// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = deleteOne(User);

// @desc    Update specific user
// @route   PUT /api/v1/users/changePassword/:id
// @access  Private/Admin
export const changeUserPassword = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const document = await User.findByIdAndUpdate(
      req.params.id,
      {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangedAt: Date.now(),
      },
      {
        new: true,
      }
    );

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ data: document });
  }
);

//LoggedUser

// @desc    Get Logged user data
// @route   GET /api/v1/users/getMe
// @access  Private/Protect
export const getLoggedUserData = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    req.params.id = req.user._id;
    next();
  }
);

// @desc    Update logged user password
// @route   PUT /api/v1/users/updateMyPassword
// @access  Private/Protect
export const updateLoggedUserPassword = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangedAt: Date.now(),
      },
      {
        new: true,
      }
    );
    if (!user)
      return next(new ApiError(`no user with this id ${req.user.id}`, 404));
    const token = createToken(user?._id);

    res.status(200).json({ data: user, token });
  }
);

// @desc    Update logged user data (without password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
export const updateLoggedUserData = updateOne(User);

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
export const deleteLoggedUserData = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(req.user._id, { active: false });

    res.status(204).json({ status: "Success" });
  }
);
