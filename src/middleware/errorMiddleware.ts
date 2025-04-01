import ApiError from "@utils/apiError";
import { NextFunction, Response, Request } from "express";

const globalError = (
  error: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorInDev(error, res);
  } else {
    sendErrorInProd(error, res);
  }
};
const sendErrorInDev = (error: ApiError, res: Response) => {
  return res.status(error.statusCode).json({
    error,
    status: error.status,
    message: error.message,
    stack: error.stack,
  });
};

const sendErrorInProd = (error: ApiError, res: Response) => {
  return res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};

export default globalError;
