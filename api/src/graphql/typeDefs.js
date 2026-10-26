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
    category: Category!
    totalCopies: Int!
    availableCopies: Int!
    coverUrl: String
    createdAt: String!
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
    categoryId: ID!
    totalCopies: Int!
    coverUrl: String
  }

  input BookUpdateInput {
    title: String
    author: String
    isbn: String
    description: String
    categoryId: ID
    totalCopies: Int
    coverUrl: String
  }

  input CategoryInput {
    name: String!
    description: String
  }

  input CategoryUpdateInput {
    name: String
    description: String
  }

  type Query {
    books(search: String, categoryId: ID): [Book!]!
    book(id: ID!): Book
    categories: [Category!]!

    me: User
    users: [User!]!
    user(id: ID!): User

    myReservations: [Reservation!]!
    allReservations(status: ReservationStatus): [Reservation!]!
    reservation(id: ID!): Reservation
  }

  type Mutation {
    register(
      name: String!
      email: String!
      password: String!
    ): AuthPayload!

    login(
      email: String!
      password: String!
    ): AuthPayload!

    createBook(input: BookInput!): Book!
    updateBook(id: ID!, input: BookUpdateInput!): Book!
    deleteBook(id: ID!): Boolean!

    createCategory(input: CategoryInput!): Category!
    updateCategory(
      id: ID!
      input: CategoryUpdateInput!
    ): Category!
    deleteCategory(id: ID!): Boolean!

    updateUserRole(id: ID!, role: Role!): User!
    setUserActive(id: ID!, isActive: Boolean!): User!

    reserveBook(bookId: ID!): Reservation!
    cancelReservation(id: ID!): Reservation!
    renewReservation(id: ID!): Reservation!
    returnBook(id: ID!): Reservation!
  }
`;