import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GET_BOOK, GET_BOOKS, RESERVE_BOOK } from "../graphql/queries.js";
import { useAuth } from "../context/AuthContext.jsx";

const primaryButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-[#315c81] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#193750] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50";

export default function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState("");

  const { data, loading, error } = useQuery(GET_BOOK, {
    variables: { id },
  });

  const [reserveBook, { loading: reserving }] = useMutation(RESERVE_BOOK, {
    refetchQueries: [
      { query: GET_BOOK, variables: { id } },
      {
        query: GET_BOOKS,
        variables: {
          search: null,
          categoryId: null,
          page: 1,
          limit: 8,
        },
      },
    ],
    onCompleted: () => {
      setMessage("Knyga sėkmingai rezervuota!");
    },
    onError: (mutationError) => {
      setMessage(
        mutationError.message || "Nepavyko rezervuoti knygos."
      );
    },
  });

  if (loading) {
    return (
      <div className="px-4 py-20 text-center">
        <div
          className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-library-primary"
          role="status"
          aria-label="Kraunama"
        />
        <p className="mt-3 text-sm text-slate-500">Kraunama...</p>
      </div>
    );
  }

  if (error || !data?.book) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"
          role="alert"
        >
          <p>
            Knyga nerasta arba jos informacijos nepavyko įkelti.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-lg border border-amber-300 px-4 py-2 font-semibold transition hover:bg-amber-100"
          >
            Grįžti į katalogą
          </Link>
        </div>
      </div>
    );
  }

  const book = data.book;

  async function handleReserve() {
    if (!user) {
      navigate("/login", { state: { from: `/books/${id}` } });
      return;
    }

    setMessage("");

    await reserveBook({
      variables: { bookId: id },
    });
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-library-primary transition hover:text-library-dark"
      >
        <span aria-hidden="true">←</span>
        Grįžti į katalogą
      </Link>

      {message && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            message === "Knyga sėkmingai rezervuota!"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
          role="status"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span>{message}</span>

            {message === "Knyga sėkmingai rezervuota!" && (
              <Link
                to="/reservations"
                className="font-bold underline underline-offset-2 hover:no-underline"
              >
                Peržiūrėti rezervacijas
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10 lg:gap-14">
        <div className="md:col-span-4 lg:col-span-3">
          <div className="flex justify-center rounded-2xl bg-slate-100 p-5 sm:p-8 md:sticky md:top-6">
            <img
              className="max-h-110 w-full rounded-lg object-contain object-top shadow-md"
              src={
                book.coverUrl ||
                "https://placehold.co/400x560/ece8df/425466?text=Knyga"
              }
              alt={`Knygos „${book.title}“ viršelis`}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src =
                  "https://placehold.co/400x560/ece8df/425466?text=Knyga";
              }}
            />
          </div>
        </div>

        <div className="md:col-span-8 lg:col-span-9">
          <span className="inline-block rounded-full bg-library-accent px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-library-primary">
            {book.category?.name || "Kategorija nenurodyta"}
          </span>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#263347] sm:text-4xl lg:text-5xl">
            {book.title}
          </h1>

          <p className="mt-3 text-lg text-slate-500 sm:text-xl">
            {book.author}
          </p>

          <div className="my-7 border-t border-slate-200" />

          <h2 className="text-lg font-bold text-[#263347]">
            Apie knygą
          </h2>

          <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
            {book.description || "Knygos aprašymas nepateiktas."}
          </p>

          <dl className="mt-8 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-slate-200 pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold text-slate-500">
                ISBN
              </dt>
              <dd className="mt-1 wrap-break-word text-sm font-medium text-[#263347]">
                {book.isbn || "Nenurodytas"}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-slate-500">
                Išleidimo metai
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#263347]">
                {book.publicationYear || "Nenurodyti"}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-slate-500">
                Egzemplioriai
              </dt>
              <dd className="mt-1 text-sm font-medium text-[#263347]">
                {book.availableCopies} iš {book.totalCopies} laisvi
              </dd>
            </div>
          </dl>

          {book.availableCopies > 0 && book.isActive !== false ? (
            <button
              type="button"
              className={`${primaryButtonClass} mt-8 w-full sm:w-auto`}
              disabled={reserving}
              onClick={handleReserve}
            >
              {reserving ? "Rezervuojama..." : "Rezervuoti knygą"}
            </button>
          ) : (
            <button
              type="button"
              className="mt-8 inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-slate-200 px-6 py-3 text-sm font-semibold text-slate-500"
              disabled
            >
              Šiuo metu neprieinama
            </button>
          )}

          {!user && (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Norint rezervuoti knygą, reikės prisijungti.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
