import mongoose from "mongoose";
type TBrand = {
  name: string;
  slug: string;
  image: string;
};
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand required"],
      unique: [true, "Brand must be unique"],
      minlength: [3, "Too short Brand name"],
      maxlength: [32, "Too long Brand name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);
const Brand = mongoose.model<TBrand>("Brand", brandSchema);
export default Brand;
