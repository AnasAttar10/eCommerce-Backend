import { Types } from "mongoose";
import jwt from "jsonwebtoken";
const createToken = (payload: Types.ObjectId) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY as string, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
export default createToken;
