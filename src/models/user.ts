import mongoose from "mongoose";
import bcrypt from "bcrypt";
export type TAddresses = {
  // id: { type: mongoose.Schema.Types.ObjectId };
  alias: string;
  details: string;
  phone: string;
  city: string;
  postalCode: string;
};
export type TUser = {
  name: string;
  slug: string;
  email: string;
  phone: string;
  profileImg: string;
  password: string;
  passwordChangedAt: Date;
  passwordResetCode?: string;
  passwordResetExpires?: number;
  passwordResetVerified?: boolean;
  role: "user" | "manager" | "admin";
  active: boolean;
  wishlist: mongoose.Types.ObjectId[];
  addresses: TAddresses[];
};
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
      lowercase: true,
    },
    phone: String,
    profileImg: String,

    password: {
      type: String,
      required: [true, "password required"],
      minlength: [6, "Too short password"],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    // child reference (one to many)
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    addresses: [
      {
        // id: { type: mongoose.Types.ObjectId },
        // _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
        alias: String,
        details: String,
        phone: String,
        city: String,
        postalCode: String,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model<TUser>("User", userSchema);

export default User;
