import slugify from "slugify";
import { check } from "express-validator";
import User from "@models/user";
import validatorMiddleware from "@middleware/validatorMiddleware";
import { RequestHandler } from "express";

export const signupValidator = [
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

  validatorMiddleware,
] as RequestHandler[];

export const loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address"),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .escape()
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  validatorMiddleware,
] as RequestHandler[];
