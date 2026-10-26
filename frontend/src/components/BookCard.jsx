
import { Link } from "react-router-dom";

export default function BookCard({ book }) {
  return (
    <article className="card book-card h-100">
      <Link
        to={`/books/${book.id}`}
        className="book-cover-wrap"
        aria-label={`Peržiūrėti knygą: ${book.title}`}
      >
        <img
          className="book-cover"
          src={
            book.coverUrl ||
            "https://placehold.co/400x560/ece8df/425466?text=Knyga"
          }
          alt={`Knygos „${book.title}“ viršelis`}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src =
              "https://placehold.co/400x560/ece8df/425466?text=Knyga";
          }}
        />
      </Link>

      <div className="card-body d-flex flex-column">
        <span className="book-category">
          {book.category?.name || "Kategorija nenurodyta"}
        </span>

        <h2 className="book-title">
          <Link to={`/books/${book.id}`} className="text-decoration-none">
            {book.title}
          </Link>
        </h2>

        <p className="text-secondary mb-3">{book.author}</p>

        <div className="mt-auto">
          {book.availableCopies > 0 ? (
            <span className="availability available">
              ● Yra bibliotekoje ({book.availableCopies})
            </span>
          ) : (
            <span className="availability unavailable">
              ● Šiuo metu nėra
            </span>
          )}

          <Link
            to={`/books/${book.id}`}
            className="btn btn-outline-primary w-100 mt-3"
          >
            Knygos informacija
          </Link>
        </div>
      </div>
    </article>
  );
}
