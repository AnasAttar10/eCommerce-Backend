import validatorMiddleware from "@middleware/validatorMiddleware";
import { RequestHandler } from "express";
import { check } from "express-validator";

export const removeAddressValidator = [
  check("addressId").isMongoId().withMessage("Invalid ID formate"),
  validatorMiddleware,
] as RequestHandler[];
