import {
  addAddress,
  getLoggedUserAddresses,
  removeAddress,
} from "@services/addressService";
import { allowedTo, protect } from "@services/authService";
import { removeAddressValidator } from "@validators/addressValidator";
import express from "express";

const router = express.Router();

router.use(protect, allowedTo("user"));

router.get("/", getLoggedUserAddresses);
router.post("/", addAddress);
router.delete("/:addressId", removeAddressValidator, removeAddress);

export default router;
