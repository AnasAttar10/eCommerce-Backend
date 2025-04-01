import slugify from "slugify";
import { check, body } from "express-validator";
import validatorMiddleware from "@middleware/validatorMiddleware";
import { RequestHandler } from "express";
import CategoryModel from "@models/category";

export const getSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid Subcategory id format"),
  validatorMiddleware,
] as RequestHandler[];

export const createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("SubCategory required")
    .escape()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Too short Subcategory name")
    .isLength({ max: 32 })
    .withMessage("Too long Subcategory name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage("categoryId is required")
    .isMongoId()
    .withMessage("Invalid Category id format")
    .custom(async (val, { req }) => {
      const category = await CategoryModel.findById(val);
      if (!category) throw Error(`no category Id with this id ${val}`);
    }),
  validatorMiddleware,
] as RequestHandler[];

export const updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid Subcategory id format"),
  body("name")
    .escape()
    .trim()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
] as RequestHandler[];

export const deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory id format"),
  validatorMiddleware,
] as RequestHandler[];
