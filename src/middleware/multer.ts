import { Request, Response, NextFunction } from "express";
import ApiError from "@utils/apiError";
import multer, { FileFilterCallback, StorageEngine } from "multer";
import cloudinary from "../config/cloudinary";
import expressAsyncHandler from "express-async-handler";
import { CustomRequest } from "../types/costumeRequest";
import Product from "@models/product";
const storage: StorageEngine = multer.memoryStorage();
const multerFilter = function (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    const error = new ApiError("Only image or video files are allowed", 400);
    return cb(error);
  }
};
export const upload = multer({ storage, fileFilter: multerFilter });
export const uploadSingleImage = upload.single("image");
export const uploadMultipleImages = upload.array("images", 10);
export const uploadMixImages = (fields: { name: string; maxCount: number }[]) =>
  upload.fields(fields);

const uploadToCloudinary = (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url ?? "");
        }
      }
    );
    stream.end(file.buffer); // Pass the file buffer to the Cloudinary upload stream
  });
};
const chooseTheFolderName = (originalUrl: string, isSingleImage: boolean) => {
  if (originalUrl.includes("/api/v1/products")) {
    if (isSingleImage) {
      return "cover";
    } else return "images";
  }
};
const setImageToBody = (
  req: CustomRequest,
  originalUrl: string,
  image: string
) => {
  if (originalUrl.includes("/api/v1/brands")) req.body.image = image;
  else if (originalUrl.includes("/api/v1/categories")) req.body.image = image;
  else if (originalUrl.includes("/api/v1/products")) {
    req.body.imageCover = image;
  }
};

const setImagesToBody = (
  req: CustomRequest,
  originalUrl: string,
  images: string[]
) => {
  if (originalUrl.includes("/api/v1/products")) req.body.images = images;
};
export const setDBImagesToBody = expressAsyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const images = Array.isArray(req.body.images) ? req.body.images : [];
    if (req.body.db_images) {
      const dbImages =
        Array.isArray(req.body.db_images) || req.body.db_images !== ""
          ? [].concat(req.body.db_images)
          : [];
      req.body.images = [...images, ...dbImages];
    } else {
      const product = await Product.findOne({ _id: req.params.id });
      const dbImages = product?.images || [];
      req.body.images = [...images, ...dbImages];
    }
    next();
  }
);
export const uploadMixToCloudinary = (
  folderName: string,
  isImagesNecessary: boolean = false
) =>
  expressAsyncHandler(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      const files = req.files as
        | { [key: string]: Express.Multer.File[] }
        | undefined;
      const folder = folderName || "default-folder";

      if (!files && isImagesNecessary) {
        return next(new ApiError("No images uploaded", 400));
      }

      if (!files) {
        return next();
      }

      const coverFile = files?.["imageCover"]?.[0] || files?.["image"]?.[0]; // Support both names
      const imageFiles = files?.["images"]; // Multiple images

      if (coverFile) {
        try {
          const currentFolder = `${folder}/${chooseTheFolderName(
            req.originalUrl,
            true
          )}`;

          const result = await uploadToCloudinary(coverFile, currentFolder);

          setImageToBody(req, req.originalUrl, result);
        } catch (error) {
          return next(
            new ApiError("Failed to upload cover image to Cloudinary", 500)
          );
        }
      }

      // Upload Multiple Images (if exist)
      if (imageFiles && imageFiles.length > 0) {
        try {
          const currentFolder = `${folder}/${chooseTheFolderName(
            req.originalUrl,
            false
          )}`;
          const uploadPromises = imageFiles.map((file) =>
            uploadToCloudinary(file, currentFolder)
          );
          const results = await Promise.all(uploadPromises);

          setImagesToBody(req, req.originalUrl, results);
        } catch (error) {
          return next(
            new ApiError("Failed to upload images to Cloudinary", 500)
          );
        }
      }

      next(); // Ensure middleware continues execution
    }
  );

export const uploadMultipleToCloudinary = (
  folderName: string,
  isImagesNecessary: boolean = false
) =>
  expressAsyncHandler(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      const images = req.files as Express.Multer.File[];
      const folder = folderName || "default-folder";
      if ((!images || images.length === 0) && isImagesNecessary) {
        return next(new ApiError("No images uploaded", 400));
      }
      if (!images || images.length === 0) {
        return next();
      }
      // Map each file upload to Cloudinary

      const uploadPromises = images.map((file) =>
        uploadToCloudinary(file, folder)
      );
      // Wait for all files to be uploaded
      await Promise.all(uploadPromises)
        .then((results) => {
          // req.body.imgs = results;
          setImagesToBody(req, req.originalUrl, results);
          next();
        })
        .catch(() =>
          next(
            new ApiError(
              "there is error in uploading the images to cloudinary ",
              500
            )
          )
        );
    }
  );

export const uploadSingleToCloudinary = (
  folderName: string,
  isImageNecessary: boolean = false
) =>
  expressAsyncHandler(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      const file = req.file as Express.Multer.File;
      const folder = folderName || "default-folder";
      if (!file && isImageNecessary) {
        return next(new ApiError("No file uploaded", 400));
      } else if (!file && !isImageNecessary) {
        return next();
      } else {
        const image = await uploadToCloudinary(file, folder);

        if (!image) {
          return next(
            new ApiError(
              "there is error in uploading the images to cloudinary ",
              500
            )
          );
        }
        setImageToBody(req, req.originalUrl, image);
        next();
      }
    }
  );
