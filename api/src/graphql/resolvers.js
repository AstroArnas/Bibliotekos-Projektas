import bcrypt from "bcryptjs";
import { GraphQLError } from "graphql";

import User from "../models/User.js";
import Book from "../models/Book.js";
import Category from "../models/Category.js";
import Reservation from "../models/Reservation.js";

import {
  createToken,
  requireAuth,
  requireRole,
  requireObjectId,
} from "../middleware/auth.js";

const LOAN_DAYS = 14;
const MAX_RENEWALS = 2;

function fail(message, code = "BAD_USER_INPUT") {
  throw new GraphQLError(message, {
    extensions: { code },
  });
}

function requireText(value, field, maxLength = 250) {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.trim().length > maxLength
  ) {
    fail(`${field} is required and must be at most ${maxLength} characters.`);
  }

  return value.trim();
}

function requireInteger(value, field, min = 0) {
  if (!Number.isInteger(value) || value < min) {
    fail(`${field} must be an integer >= ${min}.`);
  }

  return value;
}

function toDate(value) {
  return value instanceof Date ? value.toISOString() : value;
}

async function ensureCategoryExists(categoryId, session) {
  const id = requireObjectId(categoryId, "categoryId");
  let query = Category.findById(id);

  if (session) query = query.session(session);

  const category = await query;

  if (!category) fail("Category not found.", "NOT_FOUND");

  return category;
}

async function ensureBookExists(bookId, session) {
  const id = requireObjectId(bookId, "bookId");
  let query = Book.findById(id);

  if (session) query = query.session(session);

  const book = await query;

  if (!book) fail("Book not found.", "NOT_FOUND");

  return book;
}

async function ensureReservationExists(id, session) {
  const reservationId = requireObjectId(id, "reservationId");
  let query = Reservation.findById(reservationId);

  if (session) query = query.session(session);

  const reservation = await query;

  if (!reservation) fail("Reservation not found.", "NOT_FOUND");

  return reservation;
}

function assertReservationOwner(reservation, user) {
  const ownerId = reservation.userId?._id ?? reservation.userId;

  if (ownerId.toString() !== user._id.toString() && user.role !== "ADMIN") {
    fail("You cannot access this reservation.", "FORBIDDEN");
  }
}

function assertActiveReservation(reservation) {
  if (reservation.status !== "ACTIVE") {
    fail("This reservation is no longer active.");
  }
}

function getDueDate(days = LOAN_DAYS) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}


async function ensureUserExists(userId) {
  const id = requireObjectId(userId, "userId");
  const user = await User.findById(id);

  if (!user) {
    fail("User not found.", "NOT_FOUND");
  }

  return user;
}

async function ensureEmailIsAvailable(email, excludeUserId = null) {
  const filter = { email };

  if (excludeUserId) {
    filter._id = { $ne: excludeUserId };
  }

  const existingUser = await User.findOne(filter);

  if (existingUser) {
    fail("An account with this email already exists.");
  }
}

function validateEmail(email) {
  const cleanEmail = requireText(email, "Email", 254).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    fail("Enter a valid email address.");
  }

  return cleanEmail;
}


export const resolvers = {
  Query: {
    books: async (_, { search, categoryId, page = 1, limit = 8 }) => {
      const filter = { isActive: { $ne: false } };

      if (search?.trim()) {
        const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const expression = new RegExp(escaped, "i");

        filter.$or = [
          { title: expression },
          { author: expression },
          { isbn: expression },
        ];
      }

      if (categoryId) {
        filter.categoryId = requireObjectId(categoryId, "categoryId");
      }

      const safePage = Math.max(1, page);
      const safeLimit = Math.min(50, Math.max(1, limit));

      const [items, totalItems] = await Promise.all([
        Book.find(filter)
          .sort({ title: 1 })
          .skip((safePage - 1) * safeLimit)
          .limit(safeLimit),

        Book.countDocuments(filter),
      ]);

      return {
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / safeLimit),
      };
    },

    book: async (_, { id }) => {
      return Book.findOne({
        _id: requireObjectId(id),
        isActive: { $ne: false },
      });
    },

    categories: async () => {
      return Category.find().sort({ name: 1 });
    },

    me: (_, __, context) => {
      return requireAuth(context);
    },

    myReservations: async (_, __, context) => {
      const user = requireAuth(context);

      return Reservation.find({ userId: user._id }).sort({ createdAt: -1 });
    },

    reservation: async (_, { id }, context) => {
      const user = requireAuth(context);
      const reservation = await ensureReservationExists(id);

      assertReservationOwner(reservation, user);

      return reservation;
    },

    users: async (_, __, context) => {
      requireRole(context, "ADMIN");

      return User.find().sort({ createdAt: -1 });
    },

    user: async (_, { id }, context) => {
      requireRole(context, "ADMIN");

      return User.findById(requireObjectId(id));
    },

    allReservations: async (_, { status }, context) => {
      requireRole(context, "ADMIN");

      const filter = {};

      if (status) {
        filter.status = status;
      }

      return Reservation.find(filter).sort({ createdAt: -1 });
    },
  },

  Mutation: {
    register: async (_, { name, email, password }) => {
      const cleanName = requireText(name, "Name", 100);
      const cleanEmail = requireText(email, "Email", 254).toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        fail("Enter a valid email address.");
      }

      if (
        typeof password !== "string" ||
        password.length < 8 ||
        password.length > 72
      ) {
        fail("Password must be between 8 and 72 characters.");
      }

      const existing = await User.findOne({
        email: cleanEmail,
      });

      if (existing) {
        fail("An account with this email already exists.");
      }

      const passwordHash = await bcrypt.hash(password, 12);

      let user;

      try {
        [user] = await User.create([
          {
            name: cleanName,
            email: cleanEmail,
            passwordHash,
            role: "USER",
            isActive: true,
          },
        ]);
      } catch (error) {
        if (error.code === 11000) {
          fail("An account with this email already exists.");
        }

        throw error;
      }

      return {
        token: createToken(user),
        user,
      };
    },

    login: async (_, { email, password }) => {
      const cleanEmail = requireText(email, "Email", 254).toLowerCase();

      const user = await User.findOne({
        email: cleanEmail,
      }).select("+passwordHash");

      if (!user || !user.isActive) {
        fail("Invalid email or password.", "UNAUTHENTICATED");
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);

      if (!validPassword) {
        fail("Invalid email or password.", "UNAUTHENTICATED");
      }

      return {
        token: createToken(user),
        user,
      };
    },


    createUser: async (_, { input }, context) => {
      requireRole(context, "ADMIN");

      const name = requireText(input.name, "Name", 100);
      const email = validateEmail(input.email);

      if (
        typeof input.password !== "string" ||
        input.password.length < 8 ||
        input.password.length > 72
      ) {
        fail("Password must be between 8 and 72 characters.");
      }

      const role = input.role ?? "USER";

      if (!["USER", "ADMIN"].includes(role)) {
        fail("Invalid user role.");
      }

      await ensureEmailIsAvailable(email);

      const passwordHash = await bcrypt.hash(input.password, 12);

      try {
        const [user] = await User.create([
          {
            name,
            email,
            passwordHash,
            role,
            isActive: true,
          },
        ]);

        return user;
      } catch (error) {
        if (error.code === 11000) {
          fail("An account with this email already exists.");
        }

        throw error;
      }
    },

    updateUser: async (_, { id, input }, context) => {
      requireRole(context, "ADMIN");

      const user = await ensureUserExists(id);

      if (input.name !== undefined) {
        user.name = requireText(input.name, "Name", 100);
      }

      if (input.email !== undefined) {
        const email = validateEmail(input.email);

        await ensureEmailIsAvailable(email, user._id);

        user.email = email;
      }

      if (input.role !== undefined) {
        if (!["USER", "ADMIN"].includes(input.role)) {
          fail("Invalid user role.");
        }

        user.role = input.role;
      }

      if (input.isActive !== undefined) {
        user.isActive = input.isActive;
      }

      await user.save();

      return user;
    },

    deactivateUser: async (_, { id }, context) => {
      const admin = requireRole(context, "ADMIN");

      const user = await ensureUserExists(id);

      if (user._id.toString() === admin._id.toString()) {
        fail("You cannot deactivate your own account.");
      }

      if (!user.isActive) {
        return user;
      }

      user.isActive = false;

      await user.save();

      return user;
    },


    createBook: async (_, { input }, context) => {
      requireRole(context, "ADMIN");

      const title = requireText(input.title, "Title");
      const author = requireText(input.author, "Author", 150);

      const totalCopies = requireInteger(input.totalCopies, "totalCopies");

      await ensureCategoryExists(input.categoryId);

      const bookData = {
        title,
        author,
        isbn: input.isbn?.trim() || undefined,
        description: input.description ?? "",
        categoryId: input.categoryId,
        totalCopies,
        availableCopies: totalCopies,
        coverUrl: input.coverUrl ?? "",
        isActive: true,
      };

      if (input.publicationYear != null) {
        bookData.publicationYear = requireInteger(
          input.publicationYear,
          "publicationYear",
          1,
        );

        if (input.publicationYear > 9999) {
          fail("Publication year cannot exceed 9999.");
        }
      }

      return Book.create(bookData);
    },

    updateBook: async (_, { id, input }, context) => {
      requireRole(context, "ADMIN");

      const book = await ensureBookExists(id);

      if (input.categoryId !== undefined) {
        await ensureCategoryExists(input.categoryId);
        book.categoryId = input.categoryId;
      }

      if (input.title !== undefined) {
        book.title = requireText(input.title, "Title");
      }

      if (input.author !== undefined) {
        book.author = requireText(input.author, "Author", 150);
      }

      if (input.isbn !== undefined) {
        book.isbn = input.isbn.trim() || undefined;
      }

      if (input.description !== undefined) {
        book.description = input.description;
      }

      if (input.coverUrl !== undefined) {
        book.coverUrl = input.coverUrl;
      }

      if (input.publicationYear !== undefined) {
        if (input.publicationYear === null) {
          book.publicationYear = undefined;
        } else {
          const year = requireInteger(
            input.publicationYear,
            "publicationYear",
            1,
          );

          if (year > 9999) {
            fail("Publication year cannot exceed 9999.");
          }

          book.publicationYear = year;
        }
      }

      if (input.isActive !== undefined) {
        book.isActive = input.isActive;
      }

      if (input.totalCopies !== undefined) {
        const newTotal = requireInteger(input.totalCopies, "totalCopies");

        const checkedOut = book.totalCopies - book.availableCopies;

        if (newTotal < checkedOut) {
          fail(
            "Total copies cannot be less than the number currently on loan.",
          );
        }

        book.totalCopies = newTotal;
        book.availableCopies = newTotal - checkedOut;
      }

      await book.save();

      return book;
    },

    archiveBook: async (_, { id }, context) => {
      requireRole(context, "ADMIN");

      const book = await ensureBookExists(id);

      if (!book.isActive) {
        return book;
      }

      const activeReservations = await Reservation.countDocuments({
        bookId: book._id,
        status: "ACTIVE",
      });

      if (activeReservations > 0) {
        fail("Cannot archive a book with active reservations.");
      }

      book.isActive = false;

      await book.save();

      return book;
    },

    createCategory: async (_, { input }, context) => {
      requireRole(context, "ADMIN");

      return Category.create({
        name: requireText(input.name, "Category name", 100),
        description: input.description ?? "",
      });
    },

    updateCategory: async (_, { id, input }, context) => {
      requireRole(context, "ADMIN");

      const category = await Category.findById(requireObjectId(id));

      if (!category) {
        fail("Category not found.", "NOT_FOUND");
      }

      if (input.name !== undefined) {
        category.name = requireText(input.name, "Category name", 100);
      }

      if (input.description !== undefined) {
        category.description = input.description;
      }

      await category.save();

      return category;
    },

    deleteCategory: async (_, { id }, context) => {
      requireRole(context, "ADMIN");

      const category = await Category.findById(requireObjectId(id));

      if (!category) {
        fail("Category not found.", "NOT_FOUND");
      }

      const bookCount = await Book.countDocuments({
        categoryId: category._id,
      });

      if (bookCount > 0) {
        fail("Move or delete this category's books first.");
      }

      await category.deleteOne();

      return true;
    },

    reserveBook: async (_, { bookId }, context) => {
      const user = requireAuth(context);

      const book = await ensureBookExists(bookId);

      if (!book.isActive) {
        fail("This book is currently unavailable.");
      }

      // Atomically decrease available copies.
      const inventory = await Book.updateOne(
        {
          _id: book._id,
          isActive: { $ne: false },
          availableCopies: { $gt: 0 },
        },
        {
          $inc: { availableCopies: -1 },
        }
      );

      if (inventory.modifiedCount !== 1) {
        fail("No copies of this book are currently available.");
      }

      try {
        const reservation = await Reservation.create({
          userId: user._id,
          bookId: book._id,
          status: "ACTIVE",
          reservedAt: new Date(),
          dueDate: getDueDate(),
          extensionCount: 0,
        });

        return reservation;
      } catch (error) {
        // Restore inventory if reservation creation fails.
        await Book.updateOne(
          { _id: book._id },
          { $inc: { availableCopies: 1 } }
        );

        throw error;
      }
    },

    cancelReservation: async (_, { id }, context) => {
      const user = requireAuth(context);

      const reservation = await ensureReservationExists(id);

      assertReservationOwner(reservation, user);
      assertActiveReservation(reservation);

      const result = await Reservation.updateOne(
        {
          _id: reservation._id,
          status: "ACTIVE",
        },
        {
          $set: { status: "CANCELLED" },
        });

      if (result.modifiedCount !== 1) {
        fail("Reservation has already changed.");
      }

      await Book.updateOne(
        { _id: reservation.bookId },
        { $inc: { availableCopies: 1 } }
      );

      return Reservation.findById(reservation._id);
    },

    renewReservation: async (_, { id }, context) => {
      const user = requireAuth(context);

      const reservation = await ensureReservationExists(id);

      assertReservationOwner(reservation, user);
      assertActiveReservation(reservation);

      if (reservation.extensionCount >= MAX_RENEWALS) {
        fail("The maximum of two renewals has been reached.");
      }

      if (reservation.dueDate <= new Date()) {
        fail("Overdue reservations cannot be renewed.");
      }

      const previousDueDate = reservation.dueDate;

      const newDueDate = new Date(
        previousDueDate.getTime() +
        LOAN_DAYS * 24 * 60 * 60 * 1000
      );

      const result = await Reservation.updateOne(
        {
          _id: reservation._id,
          status: "ACTIVE",
          extensionCount: { $lt: MAX_RENEWALS },
          dueDate: previousDueDate,
        },
        {
          $set: { dueDate: newDueDate },
          $inc: { extensionCount: 1 },
        }
      );

      if (result.modifiedCount !== 1) {
        fail("Reservation changed. Please try again.");
      }

      return Reservation.findById(reservation._id);
    },
    
    returnBook: async (_, { id }, context) => {
      const user = requireAuth(context);

      const reservation = await ensureReservationExists(id);

      assertReservationOwner(reservation, user);
      assertActiveReservation(reservation);

      const result = await Reservation.updateOne(
        {
          _id: reservation._id,
          status: "ACTIVE",
        },
        {
          $set: {
            status: "RETURNED",
            returnedAt: new Date(),
          },
        }
      );

      if (result.modifiedCount !== 1) {
        fail("Reservation has already changed.");
      }

      await Book.updateOne(
        { _id: reservation.bookId },
        { $inc: { availableCopies: 1 } }
      );

      return Reservation.findById(reservation._id);
    },
  },

  User: {
    id: (user) => user._id.toString(),
    createdAt: (user) => toDate(user.createdAt),
  },

  Category: {
    id: (category) => category._id.toString(),
    createdAt: (category) => toDate(category.createdAt),
  },

  Book: {
    id: (book) => book._id.toString(),

    category: async (book) => {
      if (!book.categoryId) return null;

      return Category.findById(book.categoryId);
    },

    createdAt: (book) => toDate(book.createdAt),
  },

  Reservation: {
    id: (reservation) => reservation._id.toString(),

    user: async (reservation) => {
      if (reservation.userId?.name) {
        return reservation.userId;
      }

      return User.findById(reservation.userId);
    },

    book: async (reservation) => {
      if (reservation.bookId?.title) {
        return reservation.bookId;
      }

      return Book.findById(reservation.bookId);
    },

    reservedAt: (reservation) => toDate(reservation.reservedAt),
    dueDate: (reservation) => toDate(reservation.dueDate),
    createdAt: (reservation) => toDate(reservation.createdAt),
  },
};
