import slugify from "slugify";
import { check, body } from "express-validator";
import validatorMiddleware from "@middleware/validatorMiddleware";
import CategoryModel from "@models/category";
import SubCategory from "@models/subCategory";
import Brand from "@models/brand";
import { RequestHandler } from "express";
import mongoose from "mongoose";

export const createProductValidator = [
  check("title")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .notEmpty()
    .withMessage("Product required")
    .escape()
    .trim()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .escape()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Too long description"),
  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .isLength({ max: 32 })
    .withMessage("To long price"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error("priceAfterDiscount must be lower than price");
      }
      return true;
    }),

  check("colors")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        try {
          value = JSON.parse(value); // Convert string to array
        } catch (error) {
          throw new Error("Invalid JSON format for colors");
        }
      }

      if (!Array.isArray(value)) {
        throw new Error("colors should be an array");
      }

      if (!value.every((item) => typeof item === "string")) {
        throw new Error("colors should contain only strings");
      }

      return true;
    }),

  check("imageCover").custom((value, { req }) => {
    const coverImage = req.files?.["imageCover"]?.[0];
    if (!coverImage) {
      throw new Error("Product imageCover is required");
    }
    return true;
  }),

  check("images")
    .optional()
    .escape()
    .trim()
    .isArray()
    .withMessage("images should be array of string"),
  check("category")
    .notEmpty()
    .withMessage("Product must be belong to a category")
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom((categoryId) =>
      CategoryModel.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category for this id: ${categoryId}`)
          );
        }
      })
    ),
  check("subcategories")
    .optional()
    .custom(async (value, { req }) => {
      if (typeof value === "string") {
        try {
          value = JSON.parse(value);
        } catch (error) {
          throw new Error("Invalid JSON format for subcategories");
        }
      }

      if (!Array.isArray(value)) {
        throw new Error("subcategories should be an array");
      }

      if (!value.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error("Each subcategory should be a valid MongoDB ObjectId");
      }

      const subcategoriesInDB = await SubCategory.find({
        _id: { $in: value },
      });

      if (
        subcategoriesInDB.length < 1 ||
        subcategoriesInDB.length !== value.length
      ) {
        throw new Error("Invalid subcategories Ids");
      }

      const subCategoriesIdsInDB = subcategoriesInDB.map((subCategory) =>
        subCategory._id.toString()
      );

      const checker = (target: string[], arr: string[]) =>
        target.every((v) => arr.includes(v));

      const categorySubcategories = await SubCategory.find({
        category: req.body.category,
      });

      const subCategoriesIdsInCategory = categorySubcategories.map((sub) =>
        sub._id.toString()
      );

      if (!checker(value, subCategoriesIdsInCategory)) {
        throw new Error(
          "subcategories do not belong to the specified category"
        );
      }
      return true;
    }),
  check("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom((brandId) =>
      Brand.findById(brandId).then((brandId) => {
        if (!brandId) {
          return Promise.reject(
            new Error(`No brandId for this id: ${brandId}`)
          );
        }
      })
    ),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingsAverage must be a number")
    .isLength({ min: 1 })
    .withMessage("Rating must be above or equal 1.0")
    .isLength({ max: 5 })
    .withMessage("Rating must be below or equal 5.0"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number"),

  validatorMiddleware,
] as RequestHandler[];

export const getProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  validatorMiddleware,
] as RequestHandler[];

export const updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  check("title")
    .optional()
    .escape()
    .trim()
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .notEmpty()
    .withMessage("Product required")
    .custom((val, { req }) => {
      console.log(req.body);

      req.body.slug = slugify(val);
      return true;
    }),
  check("description")
    .optional()
    .escape()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Too long description"),
  check("quantity")
    .optional()
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("price")
    .optional()
    .isNumeric()
    .withMessage("Product price must be a number")
    .isLength({ max: 32 })
    .withMessage("To long price"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error("priceAfterDiscount must be lower than price");
      }
      return true;
    }),

  check("colors")
    .optional()
    .isArray()
    .withMessage("availableColors should be array of string"),
  check("images")
    .optional()
    .escape()
    .trim()
    .isArray()
    .withMessage("images should be array of string"),
  check("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom((categoryId) =>
      CategoryModel.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category for this id: ${categoryId}`)
          );
        }
      })
    ),

  check("subcategories")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID formate")
    //check if subcategories in db
    .custom((subcategoriesIds) =>
      SubCategory.find({ _id: { $exists: true, $in: subcategoriesIds } }).then(
        (result) => {
          if (result.length < 1 || result.length !== subcategoriesIds.length) {
            return Promise.reject(new Error(`Invalid subcategories Ids`));
          }
        }
      )
    )
    .custom((val, { req }) =>
      SubCategory.find({ category: req.body.category }).then(
        (subcategories) => {
          const subCategoriesIdsInDB: string[] = [];
          subcategories.forEach((subCategory) => {
            subCategoriesIdsInDB.push(subCategory._id.toString());
          });
          // check if subcategories ids in db include subcategories in req.body (true)
          const checker = (target: string[], arr: string[]) =>
            target.every((v) => arr.includes(v));
          if (!checker(val, subCategoriesIdsInDB)) {
            return Promise.reject(
              new Error(`subcategories not belong to category`)
            );
          }
        }
      )
    ),

  check("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID formate")
    .custom((brandId) =>
      Brand.findById(brandId).then((brandId) => {
        if (!brandId) {
          return Promise.reject(
            new Error(`No brandId for this id: ${brandId}`)
          );
        }
      })
    ),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingsAverage must be a number")
    .isLength({ min: 1 })
    .withMessage("Rating must be above or equal 1.0")
    .isLength({ max: 5 })
    .withMessage("Rating must be below or equal 5.0"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number"),
  validatorMiddleware,
] as RequestHandler[];

export const deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  validatorMiddleware,
] as RequestHandler[];
