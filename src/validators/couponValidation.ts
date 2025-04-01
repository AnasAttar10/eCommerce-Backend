import validatorMiddleware from "@middleware/validatorMiddleware";
import { RequestHandler } from "express";
import { check } from "express-validator";

export const getCouponValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  validatorMiddleware,
] as RequestHandler[];

export const removeCouponValidator = [
  check("id").isMongoId().withMessage("Invalid ID formate"),
  validatorMiddleware,
] as RequestHandler[];
