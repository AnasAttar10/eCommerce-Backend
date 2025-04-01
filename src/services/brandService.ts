import Brand from "@models/brand";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlersFactory";

// @desc : get all brands
// @route : GET /brands
// @access : public
export const getAllBrands = getAll(Brand, "name");

// @desc : get a brand
// @route : GET /brands/:id
// @access : public
export const getBrand = getOne(Brand);

// @desc : create a brand
// @route : POST /brands
// @access : private
export const createBrand = createOne(Brand);

// @desc : delete a brand
// @route : DELETE /brands
// @access : private
export const updateBrand = updateOne(Brand);

// @desc : delete a brand
// @route : DELETE /brands
// @access : private
export const deleteBrand = deleteOne(Brand);
