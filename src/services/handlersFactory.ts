import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import { Query } from "mongoose";
import ApiFeatures from "@utils/apiFeatures";
import ApiError from "@utils/apiError";
import { CustomRequest } from "../types/costumeRequest";

//start - types
type TGetAll<T> = {
  find: (query: {}) => Query<T[], T>;
  countDocuments: (query: {}) => Query<number, T>;
};
type TGetOne<T> = {
  findById: (id: string) => Query<T, T>;
};
type TCreateOne<T> = {
  create: (newDocument: Partial<T>) => Promise<T | null>;
};
type TUpdateOne<T> = {
  findByIdAndUpdate: (
    id: string,
    document: Partial<T>,
    options: { new: boolean }
  ) => Promise<T | null>;
};
type TDeleteOne<T> = {
  findByIdAndDelete: (id: string) => Query<T, T>;
};
export const getAll = <T>(Model: TGetAll<T>, searchField: string = "text") =>
  expressAsyncHandler(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      let filter = {};
      if (req.filterObj) {
        filter = req.filterObj;
      }
      //built query
      const query = Model.find(filter);
      const queryStringFilter = req.query;
      const queryString = req.query;
      const countQuery = Model.find(filter);
      const apiFeaturesForCount = new ApiFeatures(countQuery, queryStringFilter)
        .filter()
        .search(searchField);

      const countOfDocuments =
        await apiFeaturesForCount.mongooseQuery.countDocuments();

      const apiFeatures = new ApiFeatures(query, queryString)
        .filter()
        .sort()
        .search(searchField)
        .selectCostumeFields()
        .paginate(countOfDocuments);
      //execute query
      const { mongooseQuery, paginationResult } = apiFeatures;
      const documents = await mongooseQuery;
      res
        .status(200)
        .json({ results: documents.length, paginationResult, data: documents });
    }
  );

export const getOne = <T>(Model: TGetOne<T>) =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const document = await Model.findById(id);
      if (!document) {
        return next(new ApiError(`no document to this id ${id}`, 404));
      }
      res.status(200).json({ data: document });
    }
  );

export const createOne = <T>(Model: TCreateOne<T>) =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const newDoc = await Model.create(req.body);
      res.status(201).json({ data: newDoc });
    }
  );

export const updateOne = <T>(Model: TUpdateOne<T>) =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      if (!document) {
        return next(
          new ApiError(`No document for this id ${req.params.id}`, 404)
        );
      }
      // Trigger "save" event when update document
      // document.save();
      res.status(200).json({ data: document });
    }
  );

export const deleteOne = <T>(Model: TDeleteOne<T>) =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const document = await Model.findByIdAndDelete(id);

      if (!document) {
        return next(new ApiError(`No document for this id ${id}`, 404));
      }

      // Trigger "remove" event when update document
      // document.deleteOne();
      res.status(204).send();
    }
  );
