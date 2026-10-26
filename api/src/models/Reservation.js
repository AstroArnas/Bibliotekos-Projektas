import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "RETURNED", "CANCELLED"],
      default: "ACTIVE",
      required: true,
    },
    reservedAt: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    extensionCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 2,
      validate: Number.isInteger,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

reservationSchema.index({ userId: 1, status: 1 });
reservationSchema.index({ bookId: 1, status: 1 });

export default mongoose.model(
  "Reservation",
  reservationSchema
);
