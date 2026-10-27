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

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#6f99bd] focus:ring-4 focus:ring-blue-100";

const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-[#315c81] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#193750] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100";

const cardClass =
  "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm";

const tableHeadClass =
  "whitespace-nowrap bg-slate-100 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600";

const tableCellClass =
  "border-t border-slate-100 px-4 py-3 text-sm text-slate-700";

function AdminTable({ headers, children }) {
  return (
    <div className={`${cardClass} overflow-x-auto`}>
      <table className="w-full min-w-160 border-collapse text-left">
        <thead>
          <tr>
            {headers.map((header) => (
              <th className={tableHeadClass} key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function EmptyRow({ colSpan, children }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="border-t border-slate-100 px-4 py-10 text-center text-sm text-slate-500"
      >
        {children}
      </td>
    </tr>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState("books");
  const [message, setMessage] = useState("");
  const [bookForm, setBookForm] = useState({ ...emptyBook });
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const {
    data: bookData,
    loading: booksLoading,
    refetch: refetchBooks,
  } = useQuery(GET_BOOKS, {
    variables: {
      search: null,
      categoryId: null,
      page: 1,
      limit: 100,
    },
  });

  const { data: categoryData, refetch: refetchCategories } =
    useQuery(GET_CATEGORIES);

  const {
    data: userData,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useQuery(GET_USERS, {
    skip: tab !== "users",
  });

  const [createBook, { loading: creatingBook }] = useMutation(CREATE_BOOK, {
    onCompleted: async () => {
      setMessage("Knyga sėkmingai sukurta.");
      setBookForm({ ...emptyBook });
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
    },
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
        "Egzempliorių skaičius turi būti teigiamas sveikasis skaičius.",
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
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <span className="mb-2 inline-block text-xs font-bold tracking-[0.16em] text-library-primary">
        SISTEMOS VALDYMAS
      </span>

      <h1 className="text-3xl font-extrabold tracking-tight text-[#263347] sm:text-4xl">
        Administravimo skydelis
      </h1>

      <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
        Tvarkykite bibliotekos katalogą ir vartotojų paskyras.
      </p>

      <div className="my-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={tab === item.id}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${
              tab === item.id
                ? "bg-library-primary text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
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
        <div
          role="status"
          className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
        >
          {message}
        </div>
      )}

      {tab === "books" && (
        <>
          <div className={`${cardClass} mb-8`}>
            <div className="p-5 sm:p-6">
              <h2 className="mb-5 text-lg font-bold text-[#263347]">
                Pridėti naują knygą
              </h2>

              <form onSubmit={submitBook}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="bookTitle">
                      Pavadinimas *
                    </label>
                    <input
                      id="bookTitle"
                      className={inputClass}
                      value={bookForm.title}
                      onChange={(e) =>
                        setBookForm({ ...bookForm, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="bookAuthor">
                      Autorius *
                    </label>
                    <input
                      id="bookAuthor"
                      className={inputClass}
                      value={bookForm.author}
                      onChange={(e) =>
                        setBookForm({ ...bookForm, author: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="bookIsbn">
                      ISBN
                    </label>
                    <input
                      id="bookIsbn"
                      className={inputClass}
                      value={bookForm.isbn}
                      onChange={(e) =>
                        setBookForm({ ...bookForm, isbn: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="bookCategory">
                      Kategorija
                    </label>
                    <select
                      id="bookCategory"
                      className={inputClass}
                      value={bookForm.categoryId}
                      onChange={(e) =>
                        setBookForm({
                          ...bookForm,
                          categoryId: e.target.value,
                        })
                      }
                    >
                      <option value="">Pasirinkite kategoriją</option>
                      {categories
                        .filter((category) => category.isActive !== false)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="bookYear">
                      Išleidimo metai
                    </label>
                    <input
                      id="bookYear"
                      className={inputClass}
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

                  <div>
                    <label className={labelClass} htmlFor="bookCopies">
                      Egzempliorių skaičius *
                    </label>
                    <input
                      id="bookCopies"
                      className={inputClass}
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

                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="bookCover">
                      Viršelio nuoroda
                    </label>
                    <input
                      id="bookCover"
                      className={inputClass}
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

                  <div className="sm:col-span-2">
                    <label className={labelClass} htmlFor="bookDescription">
                      Aprašymas
                    </label>
                    <textarea
                      id="bookDescription"
                      className={inputClass}
                      rows={3}
                      value={bookForm.description}
                      onChange={(e) =>
                        setBookForm({
                          ...bookForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className={primaryButtonClass}
                      disabled={creatingBook}
                    >
                      {creatingBook ? "Išsaugoma..." : "Pridėti knygą"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <h2 className="mb-4 text-lg font-bold text-[#263347]">
            Knygų sąrašas
          </h2>

          {booksLoading ? (
            <p className="py-8 text-sm text-slate-500">Kraunamos knygos...</p>
          ) : (
            <AdminTable
              headers={[
                "Pavadinimas",
                "Autorius",
                "Laisvos",
                "Būsena",
                "Veiksmai",
              ]}
            >
              {books.map((book) => (
                <tr key={book.id} className="transition hover:bg-slate-50">
                  <td className={tableCellClass}>{book.title}</td>
                  <td className={tableCellClass}>{book.author}</td>
                  <td className={tableCellClass}>
                    {book.availableCopies}/{book.totalCopies}
                  </td>
                  <td className={tableCellClass}>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        book.isActive === false
                          ? "bg-slate-100 text-slate-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {book.isActive === false ? "Archyvuota" : "Aktyvi"}
                    </span>
                  </td>
                  <td className={tableCellClass}>
                    {book.isActive !== false && (
                      <button
                        type="button"
                        className={secondaryButtonClass}
                        onClick={() => {
                          if (
                            window.confirm(`Archyvuoti knygą „${book.title}“?`)
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
                <EmptyRow colSpan={5}>Knygų nėra.</EmptyRow>
              )}
            </AdminTable>
          )}
        </>
      )}

      {tab === "categories" && (
        <>
          <div className={`${cardClass} mb-8`}>
            <div className="p-5 sm:p-6">
              <h2 className="mb-5 text-lg font-bold text-[#263347]">
                Pridėti kategoriją
              </h2>

              <form onSubmit={submitCategory} className="space-y-4">
                <div>
                  <label className={labelClass} htmlFor="categoryName">
                    Pavadinimas *
                  </label>
                  <input
                    id="categoryName"
                    className={inputClass}
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="categoryDescription">
                    Aprašymas
                  </label>
                  <textarea
                    id="categoryDescription"
                    className={inputClass}
                    rows={2}
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className={primaryButtonClass}
                  disabled={creatingCategory}
                >
                  {creatingCategory ? "Išsaugoma..." : "Sukurti kategoriją"}
                </button>
              </form>
            </div>
          </div>

          <AdminTable headers={["Pavadinimas", "Aprašymas", "Veiksmai"]}>
            {categories.map((category) => (
              <tr key={category.id} className="transition hover:bg-slate-50">
                <td className={tableCellClass}>{category.name}</td>
                <td className={tableCellClass}>
                  {category.description || "–"}
                </td>
                <td className={tableCellClass}>
                  <button
                    type="button"
                    className={secondaryButtonClass}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Pašalinti kategoriją „${category.name}“?`,
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
              <EmptyRow colSpan={3}>Kategorijų nėra.</EmptyRow>
            )}
          </AdminTable>
        </>
      )}

      {tab === "users" && (
        <>
          <h2 className="mb-4 text-lg font-bold text-[#263347]">
            Vartotojų sąrašas
          </h2>

          {usersLoading ? (
            <p className="py-8 text-sm text-slate-500">
              Kraunami vartotojai...
            </p>
          ) : (
            <AdminTable
              headers={["Vardas", "El. paštas", "Rolė", "Būsena", "Veiksmai"]}
            >
              {users.map((user) => (
                <tr key={user.id} className="transition hover:bg-slate-50">
                  <td className={tableCellClass}>{user.name}</td>
                  <td className={tableCellClass}>{user.email}</td>
                  <td className={tableCellClass}>{user.role}</td>
                  <td className={tableCellClass}>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        user.isActive === false
                          ? "bg-slate-100 text-slate-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.isActive === false ? "Išjungta" : "Aktyvi"}
                    </span>
                  </td>
                  <td className={tableCellClass}>
                    {user.role !== "ADMIN" && user.isActive !== false && (
                      <button
                        type="button"
                        className={secondaryButtonClass}
                        onClick={() => {
                          if (
                            window.confirm(`Išjungti paskyrą ${user.email}?`)
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
                <EmptyRow colSpan={5}>Vartotojų nėra.</EmptyRow>
              )}
            </AdminTable>
          )}
        </>
      )}
    </section>
  );
}
