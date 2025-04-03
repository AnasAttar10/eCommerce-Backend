import { TPostQuery, TPaginationResult } from "../types";
import { Query } from "mongoose";

class ApiFeatures<T> {
  mongooseQuery: Query<T[], T>;
  queryString: TPostQuery;
  paginationResult: TPaginationResult;

  constructor(mongooseQuery: Query<T[], T>, queryString: TPostQuery) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
    this.paginationResult = {
      currentPage: 1,
      numOfPages: 1,
    };
  }
  paginate(countDocuments: number) {
    if (this.queryString.page || this.queryString.limit) {
      const page = this.queryString.page || 1;
      const limit = this.queryString.limit || 1;
      const skip = (page - 1) * limit;
      const endIndex = page * limit;
      // pagination result
      this.paginationResult.currentPage = +page;
      this.paginationResult.limit = +limit;
      this.paginationResult.numOfPages = Math.ceil(countDocuments / limit);

      if (endIndex < countDocuments) {
        this.paginationResult.next = +page + 1;
      }
      if (skip > 0) {
        this.paginationResult.prev = +page - 1;
      }
      this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    }
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortby = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortby);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }
  search(field: string) {
    let query = {};
    if (this.queryString.keyword) {
      query = { [field]: { $regex: this.queryString.keyword, $options: "i" } };
      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }
  selectCostumeFields() {
    if (this.queryString.fields) {
      const myQuery = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(myQuery);
    }
    return this;
  }
  filter() {
    const queryStringObj: { [key: string]: any } = { ...this.queryString };
    const excludesFields = ["page", "sort", "keyword", "limit", "fields"];
    excludesFields.forEach((field) => delete queryStringObj[field]);

    for (const key in queryStringObj) {
      // Apply filtration using [in]
      if (
        typeof queryStringObj[key] === "string" &&
        queryStringObj[key].includes(",")
      ) {
        queryStringObj[key] = { $in: queryStringObj[key].split(",") };
      }
    }
    // Apply filtration using [gte, gt, lte, lt]
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    return this;
  }
}
export default ApiFeatures;
