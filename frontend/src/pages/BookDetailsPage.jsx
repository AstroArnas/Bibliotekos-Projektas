
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GET_BOOK, GET_BOOKS, RESERVE_BOOK } from "../graphql/queries.js";
import { useAuth } from "../context/AuthContext.jsx";

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
      { query: GET_BOOKS, variables: {
        search: null,
        categoryId: null,
        page: 1,
        limit: 8,
      } },
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
    return <p className="py-5 text-center">Kraunama...</p>;
  }

  if (error || !data?.book) {
    return (
      <div className="alert alert-warning">
        Knyga nerasta arba jos informacijos nepavyko įkelti.
        <div className="mt-3">
          <Link to="/" className="btn btn-outline-primary">
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
    <div className="container book-detail-page">
      <Link to="/" className="back-link">
        ← Grįžti į katalogą
      </Link>

      {message && (
        <div className="alert alert-info mt-3" role="status">
          {message}
          {message === "Knyga sėkmingai rezervuota!" && (
            <Link to="/reservations" className="ms-2">
              Peržiūrėti rezervacijas
            </Link>
          )}
        </div>
      )}

      <div className="row g-5 mt-2">
        <div className="col-12 col-md-4 col-lg-3">
          <img
            className="detail-cover"
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

        <div className="col-12 col-md-8 col-lg-9">
          <span className="book-category">
            {book.category?.name || "Kategorija nenurodyta"}
          </span>

          <h1 className="display-5 fw-bold mt-2">{book.title}</h1>
          <p className="fs-5 text-secondary">{book.author}</p>

          <hr />

          <h2 className="h5">Apie knygą</h2>
          <p className="description-text">
            {book.description || "Knygos aprašymas nepateiktas."}
          </p>

          <dl className="row book-metadata">
            <dt className="col-sm-4">ISBN</dt>
            <dd className="col-sm-8">{book.isbn || "Nenurodytas"}</dd>

            <dt className="col-sm-4">Išleidimo metai</dt>
            <dd className="col-sm-8">
              {book.publicationYear || "Nenurodyti"}
            </dd>

            <dt className="col-sm-4">Egzemplioriai</dt>
            <dd className="col-sm-8">
              {book.availableCopies} iš {book.totalCopies} laisvi
            </dd>
          </dl>

          {book.availableCopies > 0 && book.isActive !== false ? (
            <button
              className="btn btn-primary btn-lg mt-3"
              disabled={reserving}
              onClick={handleReserve}
            >
              {reserving ? "Rezervuojama..." : "Rezervuoti knygą"}
            </button>
          ) : (
            <button className="btn btn-secondary btn-lg mt-3" disabled>
              Šiuo metu neprieinama
            </button>
          )}

          {!user && (
            <p className="small text-secondary mt-3">
              Norint rezervuoti knygą, reikės prisijungti.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
