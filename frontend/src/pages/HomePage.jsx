
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

  function updateSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function updateCategory(value) {
    setCategoryId(value);
    setPage(1);
  }

  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <span className="eyebrow">ATRASKITE SAVO KITĄ KNYGĄ</span>
          <h1>Kiekviena knyga atveria naują pasaulį.</h1>
          <p>
            Ieškokite knygų miesto bibliotekos kataloge ir rezervuokite
            norimą leidinį internetu.
          </p>
          <a href="#catalog" className="btn btn-light btn-lg mt-2">
            Naršyti katalogą ↓
          </a>
        </div>
      </section>

      <section id="catalog" className="catalog-section">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
          <div>
            <span className="eyebrow text-primary">KNYGŲ KOLEKCIJA</span>
            <h2 className="section-title mb-1">Bibliotekos katalogas</h2>
            <p className="text-secondary mb-0">
              Raskite knygą pagal pavadinimą, autorių arba ISBN.
            </p>
          </div>

          <span className="text-secondary small">
            {result?.totalItems ?? 0} knygų
          </span>
        </div>

        <div className="search-panel card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
            <div className="row g-3">
              <div className="col-12 col-md-8">
                <label htmlFor="bookSearch" className="form-label">
                  Knygos paieška
                </label>
                <input
                  id="bookSearch"
                  className="form-control form-control-lg"
                  type="search"
                  placeholder="Pvz., Haris Poteris arba J. K. Rowling"
                  value={search}
                  onChange={(event) => updateSearch(event.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="categoryFilter" className="form-label">
                  Kategorija
                </label>
                <select
                  id="categoryFilter"
                  className="form-select form-select-lg"
                  value={categoryId}
                  onChange={(event) => updateCategory(event.target.value)}
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
        </div>

        {loading && (
          <div className="text-center py-5" role="status">
            <div className="spinner-border text-primary" />
            <p className="mt-3 text-secondary">Kraunamas katalogas...</p>
          </div>
        )}

        {error && !result && (
          <div className="alert alert-danger">
            Nepavyko įkelti knygų katalogo. Patikrinkite, ar serveris
            paleistas, ir bandykite dar kartą.
          </div>
        )}

        {!loading && !error && books.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">⌕</div>
            <h3>Knygų nerasta</h3>
            <p>Pabandykite pakeisti paieškos frazę arba kategoriją.</p>
            <button
              className="btn btn-outline-primary"
              onClick={() => {
                setSearch("");
                setCategoryId("");
                setPage(1);
              }}
            >
              Išvalyti filtrus
            </button>
          </div>
        )}

        <div className="row g-4">
          {books.map((book) => (
            <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={book.id}>
              <BookCard book={book} />
            </div>
          ))}
        </div>

        {result && result.totalPages > 1 && (
          <nav
            className="mt-5"
            aria-label="Katalogo puslapiai"
          >
            <ul className="pagination justify-content-center flex-wrap">
              <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  disabled={page <= 1}
                  onClick={() => {
                    setPage((current) => current - 1);
                    document
                      .getElementById("catalog")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Ankstesnis
                </button>
              </li>

              {Array.from(
                { length: result.totalPages },
                (_, index) => index + 1
              ).map((pageNumber) => (
                <li
                  className={`page-item ${
                    pageNumber === page ? "active" : ""
                  }`}
                  key={pageNumber}
                >
                  <button
                    className="page-link"
                    aria-current={pageNumber === page ? "page" : undefined}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                </li>
              ))}

              <li
                className={`page-item ${
                  page >= result.totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  disabled={page >= result.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Kitas
                </button>
              </li>
            </ul>
          </nav>
        )}

        <div className="catalog-help mt-5">
          <div>
            <h3>Jūsų kita mėgstamiausia knyga laukia.</h3>
            <p className="mb-0">
              Prisijunkite, rezervuokite ir sekite skaitymo terminus.
            </p>
          </div>
          <Link to="/register" className="btn btn-primary">
            Sukurti paskyrą
          </Link>
        </div>
      </section>
    </>
  );
}
