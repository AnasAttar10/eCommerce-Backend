import slugify from "slugify";
import { check, body } from "express-validator";
import validatorMiddleware from "@middleware/validatorMiddleware";
import { RequestHandler } from "express";

export const getBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Brand id format"),
  validatorMiddleware,
] as RequestHandler[];

export const createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("Brand required")
    .escape()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Too short Brand name")
    .isLength({ max: 32 })
    .withMessage("Too long Brand name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
] as RequestHandler[];

export const updateBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Brand id format"),
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

export const deleteBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Brand id format"),
  validatorMiddleware,
] as RequestHandler[];
