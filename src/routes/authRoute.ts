import express from "express";
import {
  checkEmail,
  forgotPassword,
  login,
  resetPassword,
  signup,
  verifyPassResetCode,
} from "@services/authService";
import { loginValidator, signupValidator } from "@validators/authValidator";

const router = express.Router();
router.get("/checkEmail/:email", checkEmail);
router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyResetCode", verifyPassResetCode);
router.post("/resetPassword", resetPassword);

export default router;
