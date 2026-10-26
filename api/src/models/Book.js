import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    isbn: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    totalCopies: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isInteger,
    },
    availableCopies: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isInteger,
    },
  },
  { timestamps: true }
);

bookSchema.index({ title: "text", author: "text" });

export default mongoose.model("Book", bookSchema);
