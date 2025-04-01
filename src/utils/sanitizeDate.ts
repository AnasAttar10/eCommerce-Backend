import { TUser } from "@models/user";
import mongoose from "mongoose";

export const sanitizeUser = (user: TUser, userId?: string) => {
  return {
    _id: userId,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};
