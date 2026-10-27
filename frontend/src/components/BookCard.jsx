import { Link } from "react-router-dom";

const fallbackCover =
  "https://placehold.co/400x560/ece8df/425466?text=Knyga";

export default function BookCard({ book }) {
  const bookUrl = `/books/${book.id}`;
  const available = book.availableCopies > 0;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg motion-reduce:transform-none">
      <Link
        to={bookUrl}
        className="flex h-52 items-center justify-center bg-slate-100 p-4 sm:h-60"
        aria-label={`Peržiūrėti knygą: ${book.title}`}
      >
        <img
          src={book.coverUrl || fallbackCover}
          alt={`Knygos „${book.title}“ viršelis`}
          className="h-full max-w-full rounded-sm object-contain shadow-md"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackCover;
          }}
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-library-primary">
          {book.category?.name || "Kategorija nenurodyta"}
        </p>

        <h2 className="mb-2 wrap-break-word text-base font-bold text-[#263347]">
          <Link
            to={bookUrl}
            className="transition hover:text-library-primary"
          >
            {book.title}
          </Link>
        </h2>

        <p className="mb-4 text-sm text-slate-500">
          {book.author || "Autorius nenurodytas"}
        </p>

        <div className="mt-auto">
          <p
            className={`text-xs font-semibold ${
              available
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {available
              ? `● Yra bibliotekoje (${book.availableCopies})`
              : "● Šiuo metu nėra"}
          </p>

          <Link
            to={bookUrl}
            className="mt-3 block rounded-lg border border-library-primary px-4 py-2.5 text-center text-sm font-semibold text-library-primary transition hover:bg-library-primary hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            Knygos informacija
          </Link>
        </div>
      </div>
    </article>
  );
}
