import { gql } from "graphql-tag";

export const typeDefs = gql`
  enum Role {
    USER
    ADMIN
  }

  enum ReservationStatus {
    ACTIVE
    RETURNED
    CANCELLED
    EXPIRED
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    isActive: Boolean!
    createdAt: String!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    createdAt: String!
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    isbn: String
    description: String
    publicationYear: Int
    coverUrl: String
    isActive: Boolean!
    category: Category!
    totalCopies: Int!
    availableCopies: Int!
    createdAt: String!
  }

  # Paginated response for the public book catalog.
  type BookConnection {
    items: [Book!]!
    totalItems: Int!
    totalPages: Int!
  }

  type Reservation {
    id: ID!
    user: User!
    book: Book!
    status: ReservationStatus!
    reservedAt: String!
    dueDate: String!
    renewalCount: Int!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input BookInput {
    title: String!
    author: String!
    isbn: String
    description: String
    publicationYear: Int
    categoryId: ID!
    totalCopies: Int!
    coverUrl: String
  }

  input BookUpdateInput {
    title: String
    author: String
    isbn: String
    description: String
    publicationYear: Int
    categoryId: ID
    totalCopies: Int
    coverUrl: String
    isActive: Boolean
  }

  input CategoryInput {
    name: String!
    description: String
  }

  input CategoryUpdateInput {
    name: String
    description: String
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
    role: Role
  }

  input UpdateUserInput {
    name: String
    email: String
    role: Role
    isActive: Boolean
  }

  type Query {
    # Public catalog with pagination and filtering.
    books(
      search: String
      categoryId: ID
      page: Int = 1
      limit: Int = 8
    ): BookConnection!

    # Public book details; archived books are excluded.
    book(id: ID!): Book

    categories: [Category!]!

    # Authenticated user.
    me: User

    # Administrator operations.
    users: [User!]!
    user(id: ID!): User

    # Reservation queries.
    myReservations: [Reservation!]!
    allReservations(status: ReservationStatus): [Reservation!]!
    reservation(id: ID!): Reservation
  }

  type Mutation {
    # Authentication.
    register(name: String!, email: String!, password: String!): AuthPayload!

    login(email: String!, password: String!): AuthPayload!

    # Book management.
    createBook(input: BookInput!): Book!

    updateBook(id: ID!, input: BookUpdateInput!): Book!

    archiveBook(id: ID!): Book!

    # Category management.
    createCategory(input: CategoryInput!): Category!

    updateCategory(id: ID!, input: CategoryUpdateInput!): Category!

    deleteCategory(id: ID!): Boolean!

    # User management.
    createUser(input: CreateUserInput!): User!

    updateUser(id: ID!, input: UpdateUserInput!): User!

    deactivateUser(id: ID!): User!

    # Reservations.
    reserveBook(bookId: ID!): Reservation!

    cancelReservation(id: ID!): Reservation!

    renewReservation(id: ID!): Reservation!

    returnBook(id: ID!): Reservation!
  }
`;
