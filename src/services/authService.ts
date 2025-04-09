import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "@models/user";
import expressAsyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ApiError from "@utils/apiError";
import { CustomRequest } from "../types/costumeRequest";
import createToken from "@utils/createToken";
import sendEmail from "@utils/sendEmail";
import { sanitizeUser } from "@utils/sanitizeDate";

// @desc    Signup
// @route   GET /api/v1/auth/signup
// @access  Public
export const signup = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    const user = await User.create({
      name,
      email,
      password,
    });
    if (!user) {
      return next(new ApiError(`error in register the user `, 400));
    }
    const token = createToken(user._id);

    res.status(201).json({ data: sanitizeUser(user, user.id), token });
  }
);

// @desc    Login
// @route   GET /api/v1/auth/login
// @access  Public
export const login = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return next(new ApiError("Incorrect email or password", 401));
    }
    const token = createToken(user._id);
    res.status(200).json({ data: sanitizeUser(user, user.id), token });
  }
);

export const checkEmail = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.params;
    const user = await User.findOne({ email: email });
    if (user) {
      res.status(200).json({ data: email });
    } else {
      res.status(200).json({ data: "" });
    }
  }
);
type TDecoded = {
  userId: string;
  iat?: number;
  exp?: number;
};

// @desc   make sure the user is logged in
export const protect = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(
        new ApiError(
          "You are not login, Please login to get access this route",
          401
        )
      );
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as TDecoded;
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(
        new ApiError(
          "The user that belong to this token does no longer exist",
          401
        )
      );
    }
    if (currentUser.passwordChangedAt) {
      const passChangedTimestamp = Math.floor(
        new Date(currentUser.passwordChangedAt).getTime() / 1000
      );

      if (decoded.iat && decoded.iat < passChangedTimestamp) {
        return next(
          new ApiError(
            "User recently changed his password. please login again..",
            401
          )
        );
      }
    }

    req.user = currentUser;
    next();
  }
);

// @desc    Authorization (User Permissions)
// ["admin", "manager"]
export const allowedTo = (...roles: string[]) =>
  expressAsyncHandler(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new ApiError("You are not allowed to access this route", 403)
        );
      }
      next();
    }
  );

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
export const forgotPassword = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new ApiError(`There is no user with that email ${req.body.email}`, 404)
      );
    }
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedResetCode = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");

    user.passwordResetCode = hashedResetCode;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;

    await user.save();

    try {
      sendEmail({
        to: req.body.email,
        from: "anasattar2010@gmail.com",
        subject: "Your Password Reset Code (valid for 10 minutes)",
        text: `Hi ${user.name},\n\nWe received a request to reset the password on your account.\nYour reset code is: ${resetCode}\n\nEnter this code to complete the reset.\n\nThanks for helping us keep your account safe.\n\nThe Qalqilia Shop Team`,
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Hi ${user.name},</h2>
          <p>We received a request to reset the password on your account.</p>
          <h2 style="color: #4CAF50;">${resetCode}</h2>
          <p>Enter this code to complete the reset.</p>
          <p>If you didn't request this, please ignore this email or contact us at <a href="mailto:support@qalqiliashop.com">support@qalqiliashop.com</a>.</p>
          <p>Thanks for helping us keep your account safe.</p>
          <p>The Qalqilia Shop Team</p>
        </div>
      `,
      });
    } catch (err) {
      user.passwordResetCode = undefined;
      user.passwordResetExpires = undefined;
      user.passwordResetVerified = undefined;
      await user.save();
      return next(new ApiError("There is an error in sending email", 500));
    }

    res
      .status(200)
      .json({ status: "Success", message: "Reset code sent to email" });
  }
);

// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
export const verifyPassResetCode = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const hashedResetCode = crypto
      .createHash("sha256")
      .update(req.body.resetCode)
      .digest("hex");

    const user = await User.findOne({
      passwordResetCode: hashedResetCode,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ApiError("Reset code invalid or expired", 400));
    }
    user.passwordResetVerified = true;
    await user.save();

    res.status(200).json({
      status: "Success",
    });
  }
);

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
export const resetPassword = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new ApiError(`There is no user with email ${req.body.email}`, 404)
      );
    }
    if (!user.passwordResetVerified) {
      return next(new ApiError("Reset code not verified", 400));
    }

    user.password = req.body.newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    const token = createToken(user._id);
    res.status(200).json({ data: sanitizeUser(user, user.id), token });
  }
);
