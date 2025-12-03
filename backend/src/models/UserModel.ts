import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "investigator" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: false,
      unique: false,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["investigator", "admin"],
      default: "investigator",
    },
  },
  {
    timestamps: true,
  }
);

// Drop the unique index on email if it exists
UserSchema.index({ email: 1 }, { unique: false });

export default mongoose.model<IUser>("User", UserSchema);
