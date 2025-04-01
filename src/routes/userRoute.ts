import {
  uploadSingleImage,
  uploadSingleToCloudinary,
} from "@middleware/multer";
import { allowedTo, protect } from "@services/authService";
import {
  changeUserPassword,
  createUser,
  deleteLoggedUserData,
  deleteUser,
  getLoggedUserData,
  getUser,
  getUsers,
  removeAdminSecureDataFromBody,
  removeUserSecureDataFromBody,
  updateLoggedUserData,
  updateLoggedUserPassword,
  updateUser,
} from "@services/userServices";
import {
  changeMyPasswordValidator,
  changeUserPasswordValidator,
  createUserValidator,
  deleteUserValidator,
  getUserValidator,
  updateLoggedUserValidator,
  updateUserValidator,
} from "@validators/userValidator";
import express from "express";
const router = express.Router();

//loggedUser
router.get("/getMe", protect, getLoggedUserData, getUser);
router.put(
  "/changeMyPassword",
  protect,
  changeMyPasswordValidator,
  updateLoggedUserPassword
);
router.put(
  "/updateMe",
  protect,
  getLoggedUserData,
  updateLoggedUserValidator,
  removeUserSecureDataFromBody,
  updateLoggedUserData
);
router.delete("/deleteMe", protect, deleteLoggedUserData);
//admin
router.get("/", getUsers);

router.use(protect, allowedTo("admin", "manager"));
router.get("/:id", getUserValidator, getUser);
router.post(
  "/",
  uploadSingleImage,
  createUserValidator,
  uploadSingleToCloudinary("e-Commerce/users"),
  createUser
);
router.put(
  "/:id",
  uploadSingleImage,
  removeAdminSecureDataFromBody,
  updateUserValidator,
  uploadSingleToCloudinary("e-Commerce/users"),
  updateUser
);
router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);
router.delete("/:id", deleteUserValidator, deleteUser);

export default router;
