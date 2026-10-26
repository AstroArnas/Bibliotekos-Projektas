
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";

import {
  GET_BOOKS,
  GET_CATEGORIES,
  GET_USERS,
  CREATE_BOOK,
  ARCHIVE_BOOK,
  CREATE_CATEGORY,
  DELETE_CATEGORY,
  DEACTIVATE_USER,
} from "../graphql/queries";

const emptyBook = {
  title: "",
  author: "",
  isbn: "",
  description: "",
  publicationYear: "",
  coverUrl: "",
  categoryId: "",
  totalCopies: "1",
};

export default function AdminPage() {
  const [tab, setTab] = useState("books");
  const [message, setMessage] = useState("");
  const [bookForm, setBookForm] = useState(emptyBook);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const { data: bookData, loading: booksLoading, refetch: refetchBooks } =
    useQuery(GET_BOOKS, {
      variables: {
        search: null,
        categoryId: null,
        page: 1,
        limit: 100,
      },
    });

  const { data: categoryData, refetch: refetchCategories } =
    useQuery(GET_CATEGORIES);

  const { data: userData, loading: usersLoading, refetch: refetchUsers } =
    useQuery(GET_USERS, {
      skip: tab !== "users",
    });

  const [createBook, { loading: creatingBook }] = useMutation(CREATE_BOOK, {
    onCompleted: async () => {
      setMessage("Knyga sėkmingai sukurta.");
      setBookForm(emptyBook);
      await refetchBooks();
    },
    onError: (error) => setMessage(error.message),
  });

  const [archiveBook] = useMutation(ARCHIVE_BOOK, {
    onCompleted: async () => {
      setMessage("Knyga archyvuota.");
      await refetchBooks();
    },
    onError: (error) => setMessage(error.message),
  });

  const [createCategory, { loading: creatingCategory }] = useMutation(
    CREATE_CATEGORY,
    {
      onCompleted: async () => {
        setMessage("Kategorija sukurta.");
        setCategoryName("");
        setCategoryDescription("");
        await refetchCategories();
      },
      onError: (error) => setMessage(error.message),
    }
  );

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    onCompleted: async () => {
      setMessage("Kategorija pašalinta.");
      await refetchCategories();
    },
    onError: (error) => setMessage(error.message),
  });

  const [deactivateUser] = useMutation(DEACTIVATE_USER, {
    onCompleted: async () => {
      setMessage("Vartotojo paskyra išjungta.");
      await refetchUsers();
    },
    onError: (error) => setMessage(error.message),
  });

  const books = bookData?.books?.items ?? [];
  const categories = categoryData?.categories ?? [];
  const users = userData?.users ?? [];

  async function submitBook(event) {
    event.preventDefault();
    setMessage("");

    const copies = Number(bookForm.totalCopies);
    const year = bookForm.publicationYear
      ? Number(bookForm.publicationYear)
      : null;

    if (!Number.isInteger(copies) || copies < 1) {
      setMessage(
        "Egzempliorių skaičius turi būti teigiamas sveikasis skaičius."
      );
      return;
    }

    await createBook({
      variables: {
        input: {
          ...bookForm,
          publicationYear: year,
          totalCopies: copies,
          availableCopies: copies,
          categoryId: bookForm.categoryId || null,
        },
      },
    });
  }

  async function submitCategory(event) {
    event.preventDefault();
    setMessage("");

    await createCategory({
      variables: {
        input: {
          name: categoryName.trim(),
          description: categoryDescription.trim(),
        },
      },
    });
  }

  const tabs = [
    { id: "books", label: "Knygos" },
    { id: "categories", label: "Kategorijos" },
    { id: "users", label: "Vartotojai" },
  ];

  return (
    <section>
      <span className="eyebrow text-primary">
        SISTEMOS VALDYMAS
      </span>

      <h1 className="section-title">
        Administravimo skydelis
      </h1>

      <p className="text-secondary">
        Tvarkykite bibliotekos katalogą ir vartotojų paskyras.
      </p>

      <div className="admin-tabs nav nav-pills gap-2 my-4">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-link ${
              tab === item.id ? "active" : ""
            }`}
            onClick={() => {
              setTab(item.id);
              setMessage("");
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {message && (
        <div className="alert alert-info" role="status">
          {message}
        </div>
      )}

      {tab === "books" && (
        <>
          <div className="card admin-card mb-4">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">
                Pridėti naują knygą
              </h2>

              <form onSubmit={submitBook}>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label
                      className="form-label"
                      htmlFor="bookTitle"
                    >
                      Pavadinimas *
                    </label>

                    <input
                      id="bookTitle"
                      className="form-control"
                      value={bookForm.title}
                      onChange={(e) =>
                        setBookForm({
                          ...bookForm,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label
                      className="form-label"
                      htmlFor="bookAuthor"
                    >
                      Autorius *
                    </label>

                    <input
                      id="bookAuthor"
                      className="form-control"
                      value={bookForm.author}
                      onChange={(e) =>
                        setBookForm({
                          ...bookForm,
                          author: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label
                      className="form-label"
                      htmlFor="bookIsbn"
                    >
                      ISBN
                    </label>

                    <input
                      id="bookIsbn"
                      className="form-control"
                      value={bookForm.isbn}
                      onChange={(e) =>
                        setBookForm({
                          ...bookForm,
                          isbn: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label
                      className="form-label"
                      htmlFor="bookCategory"
                    >
                      Kategorija
                    </label>

                    <select
                      id="bookCategory"
                      className="form-select"
                      value={bookForm.categoryId}
                      onChange={(e) =>
                        setBookForm({
                          ...bookForm,
                          categoryId: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        Pasirinkite kategoriją
                      </option>

                      {categories
                        .filter(
                          (category) => category.isActive !== false
                        )
                        .map((category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label
                      className="form-label"
                      htmlFor="bookYear"
                    >
                      Išleidimo metai
                    </label>

                    <input
                      id="bookYear"
                      className="form-control"
                      type="number"
                      min="1"
                      max={new Date().getFullYear()}
                      value={bookForm.publicationYear}
                      onChange={(e) =>
                        setBookForm({
                          ...bookForm,
                          publicationYear: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label
                      className="form-label"
                      htmlFor="bookCopies"
                    >
                      Egzempliorių skaičius *
                    </label>

                    <input
                      id="bookCopies"
                      className="form-control"
                      type="number"
                      min="1"
                      step="1"
                      value={bookForm.totalCopies}
                      onChange={(e) =>
                        setBookForm({
                          ...bookForm,
                          totalCopies: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label
                      className="form-label"
                      htmlFor="bookCover"
                    >
                      Viršelio nuoroda
                    </label>

                    <input
                      id="bookCover"
                      className="form-control"
                      type="url"
                      value={bookForm.coverUrl}
                      onChange={(e) =>
                        setBookForm({
                          ...bookForm,
                          coverUrl: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-12">
                    <label
                      className="form-label"
                      htmlFor="bookDescription"
                    >
                      Aprašymas
                    </label>

                    <textarea
                      id="bookDescription"
                      className="form-control"
                      rows="3"
                      value={bookForm.description}
                      onChange={(e) =>
                        setBookForm({
                          ...bookForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-12">
                    <button
                      className="btn btn-primary"
                      disabled={creatingBook}
                    >
                      {creatingBook
                        ? "Išsaugoma..."
                        : "Pridėti knygą"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <h2 className="h5 mb-3">Knygų sąrašas</h2>

          {booksLoading ? (
            <p>Kraunamos knygos...</p>
          ) : (
            <div className="table-responsive admin-card">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Pavadinimas</th>
                    <th>Autorius</th>
                    <th>Laisvos</th>
                    <th>Būsena</th>
                    <th>Veiksmai</th>
                  </tr>
                </thead>

                <tbody>
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>
                        {book.availableCopies}/{book.totalCopies}
                      </td>
                      <td>
                        {book.isActive === false
                          ? "Archyvuota"
                          : "Aktyvi"}
                      </td>
                      <td>
                        {book.isActive !== false && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Archyvuoti knygą „${book.title}“?`
                                )
                              ) {
                                archiveBook({
                                  variables: { id: book.id },
                                });
                              }
                            }}
                          >
                            Archyvuoti
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {books.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        Knygų nėra.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "categories" && (
        <>
          <div className="card admin-card mb-4">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">
                Pridėti kategoriją
              </h2>

              <form onSubmit={submitCategory}>
                <div className="mb-3">
                  <label
                    className="form-label"
                    htmlFor="categoryName"
                  >
                    Pavadinimas *
                  </label>

                  <input
                    id="categoryName"
                    className="form-control"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label
                    className="form-label"
                    htmlFor="categoryDescription"
                  >
                    Aprašymas
                  </label>

                  <textarea
                    id="categoryDescription"
                    className="form-control"
                    rows="2"
                    value={categoryDescription}
                    onChange={(e) =>
                      setCategoryDescription(e.target.value)
                    }
                  />
                </div>

                <button
                  className="btn btn-primary"
                  disabled={creatingCategory}
                >
                  {creatingCategory
                    ? "Išsaugoma..."
                    : "Sukurti kategoriją"}
                </button>
              </form>
            </div>
          </div>

          <div className="table-responsive admin-card">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Pavadinimas</th>
                  <th>Aprašymas</th>
                  <th>Veiksmai</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.description || "–"}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Pašalinti kategoriją „${category.name}“?`
                            )
                          ) {
                            deleteCategory({
                              variables: { id: category.id },
                            });
                          }
                        }}
                      >
                        Pašalinti
                      </button>
                    </td>
                  </tr>
                ))}

                {categories.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      Kategorijų nėra.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "users" && (
        <>
          <h2 className="h5 mb-3">Vartotojų sąrašas</h2>

          {usersLoading ? (
            <p>Kraunami vartotojai...</p>
          ) : (
            <div className="table-responsive admin-card">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Vardas</th>
                    <th>El. paštas</th>
                    <th>Rolė</th>
                    <th>Būsena</th>
                    <th>Veiksmai</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        {user.isActive === false
                          ? "Išjungta"
                          : "Aktyvi"}
                      </td>
                      <td>
                        {user.role !== "ADMIN" &&
                          user.isActive !== false && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Išjungti paskyrą ${user.email}?`
                                  )
                                ) {
                                  deactivateUser({
                                    variables: { id: user.id },
                                  });
                                }
                              }}
                            >
                              Išjungti
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        Vartotojų nėra.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
