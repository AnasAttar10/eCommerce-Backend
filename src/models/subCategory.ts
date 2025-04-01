import mongoose, { Query } from "mongoose";
import he from "he";
type TSubCategory = {
  name: string;
  slug: string;
  category: mongoose.Types.ObjectId;
};

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "SubCategory must be unique"],
      minlength: [2, "To short SubCategory name"],
      maxlength: [32, "To long SubCategory name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "SubCategory must be belong to parent category"],
    },
  },
  { timestamps: true }
);
subCategorySchema.set("toJSON", {
  transform: (doc, ret) => {
    if (ret.name) {
      ret.name = he.decode(ret.name);
    }
    return ret;
  },
});
const SubCategory = mongoose.model<TSubCategory>(
  "SubCategory",
  subCategorySchema
);

export default SubCategory;
