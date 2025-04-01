import slugify from "slugify";
import bcrypt from "bcrypt";
import { check, body } from "express-validator";
import User from "@models/user";
import validatorMiddleware from "@middleware/validatorMiddleware";
import { RequestHandler } from "express";

export const getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
] as RequestHandler[];

export const createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User required")
    .escape()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .escape()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required")
    .escape()
    .trim(),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA", "ar-PS"])
    .withMessage("Invalid phone number only accepted Egy and SA Phone numbers"),

  check("profileImg").optional().escape().trim(),
  check("role")
    .optional()
    .isIn(["user", "manager", "admin"])
    .withMessage("role don't belong to role Types groupe "),

  validatorMiddleware,
] as RequestHandler[];

export const updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("name")
    .optional()
    .escape()
    .trim()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA", "ar-PS"])
    .withMessage("Invalid phone number only accepted Egy and SA Phone numbers"),

  check("profileImg").optional().escape().trim(),
  check("role")
    .optional()
    .isIn(["user", "manager", "admin"])
    .withMessage("role don't belong to role Types groupe "),
  validatorMiddleware,
] as RequestHandler[];

export const changeMyPasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password")
    .escape()
    .trim(),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter the password confirm")
    .escape()
    .trim(),
  body("password")
    .notEmpty()
    .withMessage("You must enter new password")
    .escape()
    .trim()
    .custom(async (val, { req }) => {
      const user = await User.findById(req?.user?._id);
      if (!user) {
        throw new Error("There is no user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect current password");
      }
      if (val !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  validatorMiddleware,
] as RequestHandler[];

export const changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password")
    .escape()
    .trim(),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter the password confirm")
    .escape()
    .trim(),
  body("password")
    .notEmpty()
    .withMessage("You must enter new password")
    .escape()
    .trim()
    .custom(async (val, { req }) => {
      // 1) Verify current password
      const user = await User.findById(req?.params?.id);
      if (!user) {
        throw new Error("There is no user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect current password");
      }

      // 2) Verify password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  validatorMiddleware,
] as RequestHandler[];

export const deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
] as RequestHandler[];

export const updateLoggedUserValidator = [
  body("name")
    .optional()
    .escape()
    .trim()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in use"));
        }
      })
    ),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA", "ar-PS"])
    .withMessage("Invalid phone number only accepted Egy and SA Phone numbers"),

  validatorMiddleware,
] as RequestHandler[];
