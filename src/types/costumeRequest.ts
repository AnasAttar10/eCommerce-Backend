import { Request } from "express";
export interface CustomRequest<T = any> extends Request {
  customParams?: T;
  user?: T;
  filterObj?: T;
  // files?: { [key: string]: Express.Multer.File[] };
}
