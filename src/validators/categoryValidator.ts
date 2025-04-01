import slugify from "slugify";
import { check, body } from "express-validator";
import validatorMiddleware from "@middleware/validatorMiddleware";
import { RequestHandler } from "express";

export const getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
] as RequestHandler[];

export const createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category required")
    .escape()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Too short category name")
    .isLength({ max: 32 })
    .withMessage("Too long category name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
] as RequestHandler[];

export const updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  body("name")
    .optional()
    .escape()
    .trim()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
] as RequestHandler[];

export const deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
] as RequestHandler[];
