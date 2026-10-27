import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { GET_BOOKS, GET_CATEGORIES } from "../graphql/queries";
import BookCard from "../components/BookCard";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;

  const { data: categoryData } = useQuery(GET_CATEGORIES);

  const { data, loading, error } = useQuery(GET_BOOKS, {
    variables: {
      search: search.trim() || null,
      categoryId: categoryId || null,
      page,
      limit,
    },
    fetchPolicy: "cache-and-network",
  });

  const result = data?.books;
  const books = result?.items ?? [];

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-library-primary focus:ring-2 focus:ring-library-primary/20";

  const buttonClass =
    "rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-library-primary hover:bg-library-accent disabled:opacity-40 disabled:cursor-not-allowed";

  function resetFilters() {
    setSearch("");
    setCategoryId("");
    setPage(1);
  }

  function changePage(nextPage) {
    setPage(nextPage);
    document.getElementById("catalog")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  return (
    <>
      {/* Hero */}
      <section className="rounded-b-2xl bg-linear-to-r from-library-dark to-[#567e9e] px-6 py-16 text-white sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-xs font-bold tracking-widest text-blue-100">
            ATRASKITE SAVO KITĄ KNYGĄ
          </p>

          <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            Kiekviena knyga atveria naują pasaulį.
          </h1>

          <p className="mb-6 max-w-2xl text-base leading-7 text-blue-50 sm:text-lg">
            Ieškokite knygų miesto bibliotekos kataloge ir rezervuokite
            norimą leidinį internetu.
          </p>

          <a
            href="#catalog"
            className="inline-block rounded-lg bg-white px-6 py-3 font-semibold text-library-dark hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/30"
          >
            Naršyti katalogą ↓
          </a>
        </div>
      </section>

      {/* Catalog */}
      <section
        id="catalog"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-xs font-bold tracking-widest text-library-primary">
              KNYGŲ KOLEKCIJA
            </p>

            <h2 className="mb-2 text-3xl font-bold sm:text-4xl">
              Bibliotekos katalogas
            </h2>

            <p className="text-sm text-library-muted sm:text-base">
              Raskite knygą pagal pavadinimą, autorių arba ISBN.
            </p>
          </div>

          <p className="text-sm text-library-muted">
            {result?.totalItems ?? 0} knygų
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label
                htmlFor="bookSearch"
                className="mb-2 block text-sm font-semibold"
              >
                Knygos paieška
              </label>

              <input
                id="bookSearch"
                type="search"
                className={inputClass}
                placeholder="Pvz., Haris Poteris arba J. K. Rowling"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div>
              <label
                htmlFor="categoryFilter"
                className="mb-2 block text-sm font-semibold"
              >
                Kategorija
              </label>

              <select
                id="categoryFilter"
                className={inputClass}
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">Visos kategorijos</option>

                {(categoryData?.categories ?? [])
                  .filter((category) => category.isActive !== false)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <p
            className="py-12 text-center text-library-muted"
            role="status"
            aria-live="polite"
          >
            Kraunamas katalogas...
          </p>
        )}

        {/* Error */}
        {error && !result && (
          <p
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            Nepavyko įkelti knygų katalogo. Patikrinkite, ar serveris
            paleistas, ir bandykite dar kartą.
          </p>
        )}

        {/* Empty state */}
        {!loading && !error && books.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="mb-2 text-4xl text-slate-400" aria-hidden="true">
              ⌕
            </p>

            <h3 className="mb-2 text-xl font-bold">Knygų nerasta</h3>

            <p className="mb-5 text-library-muted">
              Pabandykite pakeisti paieškos frazę arba kategoriją.
            </p>

            <button
              type="button"
              className={buttonClass}
              onClick={resetFilters}
            >
              Išvalyti filtrus
            </button>
          </div>
        )}

        {/* Books */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {/* Pagination */}
        {result && result.totalPages > 1 && (
          <nav
            className="mt-10 flex flex-wrap justify-center gap-2"
            aria-label="Katalogo puslapiai"
          >
            <button
              className={buttonClass}
              disabled={page <= 1}
              onClick={() => changePage(page - 1)}
            >
              Ankstesnis
            </button>

            {Array.from(
              { length: result.totalPages },
              (_, index) => index + 1
            ).map((pageNumber) => (
              <button
                key={pageNumber}
                className={`min-w-10 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  pageNumber === page
                    ? "border-library-primary bg-library-primary text-white"
                    : "border-slate-200 text-library-primary hover:bg-library-accent"
                }`}
                aria-current={pageNumber === page ? "page" : undefined}
                onClick={() => changePage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            <button
              className={buttonClass}
              disabled={page >= result.totalPages}
              onClick={() => changePage(page + 1)}
            >
              Kitas
            </button>
          </nav>
        )}

        {/* Registration */}
        <div className="mt-12 flex flex-col gap-4 rounded-2xl bg-library-accent p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="mb-2 text-xl font-bold">
              Jūsų kita mėgstamiausia knyga laukia.
            </h3>

            <p className="text-[#52677a]">
              Prisijunkite, rezervuokite ir sekite skaitymo terminus.
            </p>
          </div>

          <Link
            to="/register"
            className="rounded-lg bg-library-primary px-5 py-3 text-center font-semibold text-white hover:bg-library-dark focus:outline-none focus:ring-2 focus:ring-library-primary/30"
          >
            Sukurti paskyrą
          </Link>
        </div>
      </section>
    </>
  );
}
