
import { gql } from "@apollo/client";

export const GET_BOOKS = gql`
  query Books($search: String, $categoryId: ID) {
    books(search: $search, categoryId: $categoryId) {
      id
      title
      author
      isbn
      description
      totalCopies
      availableCopies
      category {
        id
        name
      }
    }
  }
`;

export const GET_BOOK = gql`
  query Book($id: ID!) {
    book(id: $id) {
      id
      title
      author
      isbn
      description
      publicationYear
      coverUrl
      availableCopies
      totalCopies
      isActive
      category {
        id
        name
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query Categories {
    categories {
      id
      name
      description
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
        isActive
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register(
    $name: String!
    $email: String!
    $password: String!
  ) {
    register(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
        isActive
      }
    }
  }
`;

export const GET_MY_RESERVATIONS = gql`
  query MyReservations {
    myReservations {
      id
      status
      reservedAt
      dueDate
      renewalCount
      book {
        id
        title
        author
        coverUrl
      }
    }
  }
`;

export const RESERVE_BOOK = gql`
  mutation ReserveBook($bookId: ID!) {
    reserveBook(bookId: $bookId) {
      id
      status
      dueDate
      renewalCount
    }
  }
`;

export const RENEW_RESERVATION = gql`
  mutation RenewReservation($reservationId: ID!) {
    renewReservation(reservationId: $reservationId) {
      id
      status
      dueDate
      renewalCount
    }
  }
`;

export const CANCEL_RESERVATION = gql`
  mutation CancelReservation($reservationId: ID!) {
    cancelReservation(reservationId: $reservationId) {
      id
      status
    }
  }
`;

export const GET_USERS = gql`
  query Users {
    users {
      id
      name
      email
      role
      isActive
    }
  }
`;

export const CREATE_BOOK = gql`
  mutation CreateBook($input: BookInput!) {
    createBook(input: $input) {
      id
      title
    }
  }
`;

export const UPDATE_BOOK = gql`
  mutation UpdateBook($id: ID!, $input: BookInput!) {
    updateBook(id: $id, input: $input) {
      id
      title
    }
  }
`;

export const ARCHIVE_BOOK = gql`
  mutation ArchiveBook($id: ID!) {
    archiveBook(id: $id) {
      id
      title
      isActive
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      role
      isActive
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      role
      isActive
    }
  }
`;

export const DEACTIVATE_USER = gql`
  mutation DeactivateUser($id: ID!) {
    deactivateUser(id: $id) {
      id
      isActive
    }
  }
`;
