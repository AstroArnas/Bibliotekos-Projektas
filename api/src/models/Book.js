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
      trim: true,
    },

    publicationYear: {
      type: Number,
      min: 1,
      max: 9999,
      validate: {
        validator: Number.isInteger,
        message: "Publication year must be an integer.",
      },
    },

    coverUrl: {
      type: String,
      default: "",
      trim: true,
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
      validate: {
        validator: Number.isInteger,
        message: "Total copies must be an integer.",
      },
    },

    availableCopies: {
      type: Number,
      required: true,
      min: 0,
      validate: [
        {
          validator: Number.isInteger,
          message: "Available copies must be an integer.",
        },
        {
          validator: function (value) {
            return value <= this.totalCopies;
          },
          message:
            "Available copies cannot exceed total copies.",
        },
      ],
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text search across book titles and authors.
bookSchema.index({
  title: "text",
  author: "text",
});

export default mongoose.model("Book", bookSchema);
