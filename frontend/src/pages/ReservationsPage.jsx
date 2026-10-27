import { useMutation, useQuery } from "@apollo/client";
import {
  CANCEL_RESERVATION,
  GET_MY_RESERVATIONS,
  RENEW_RESERVATION,
} from "../graphql/queries";

function formatDate(value) {
  if (!value) return "–";

  return new Intl.DateTimeFormat("lt-LT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export default function ReservationsPage() {
  const { data, loading, error } = useQuery(GET_MY_RESERVATIONS, {
    fetchPolicy: "cache-and-network",
  });

  const [renew, { loading: renewing }] = useMutation(
    RENEW_RESERVATION,
    {
      refetchQueries: [GET_MY_RESERVATIONS],
      onError: (error) => window.alert(error.message),
    }
  );

  const [cancel, { loading: cancelling }] = useMutation(
    CANCEL_RESERVATION,
    {
      refetchQueries: [GET_MY_RESERVATIONS],
      onError: (error) => window.alert(error.message),
    }
  );

  const reservations = data?.myReservations ?? [];

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <span className="mb-3 inline-block text-xs font-bold tracking-[0.16em] text-library-primary">
        SKAITYTOJO PASKYRA
      </span>

      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-[#263347] sm:text-4xl">
        Mano rezervacijos
      </h1>

      <p className="mb-8 text-sm leading-6 text-slate-500 sm:text-base">
        Čia galite stebėti knygų grąžinimo terminus ir pratęsimus.
      </p>

      {loading && (
        <div className="py-12 text-center">
          <div
            className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-library-primary"
            role="status"
            aria-label="Kraunami duomenys"
          />
          <p className="mt-3 text-sm text-slate-500">
            Kraunami duomenys...
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          Nepavyko įkelti rezervacijų: {error.message}
        </div>
      )}

      {!loading && !error && reservations.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div className="mb-3 text-5xl text-slate-400" aria-hidden="true">
            ▤
          </div>

          <h2 className="mb-2 text-xl font-bold text-[#263347]">
            Rezervacijų dar nėra
          </h2>

          <p className="mb-6 text-sm text-slate-500">
            Atraskite knygą kataloge ir rezervuokite ją.
          </p>

          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-library-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-library-dark focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            Ieškoti knygų
          </a>
        </div>
      )}

      <div className="space-y-4">
        {reservations.map((reservation) => {
          const active = reservation.status === "ACTIVE";
          const renewals = reservation.renewalCount ?? 0;
          const overdue =
            active && new Date(reservation.dueDate) < new Date();

          const statusLabel = active
            ? overdue
              ? "Vėluojama"
              : "Aktyvi"
            : reservation.status === "RETURNED"
              ? "Grąžinta"
              : "Atšaukta";

          const statusClass = active
            ? overdue
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
            : "bg-slate-100 text-slate-600";

          return (
            <article
              key={reservation.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6"
            >
              <div className="grid grid-cols-1 items-center gap-5 sm:grid-cols-[100px_minmax(0,1fr)] md:grid-cols-[100px_minmax(0,1fr)_auto]">
                <div className="flex justify-center sm:justify-start">
                  <img
                    className="h-28 w-20 rounded-md bg-slate-100 object-contain sm:h-32 sm:w-24"
                    src={
                      reservation.book?.coverUrl ||
                      "https://placehold.co/160x220/ece8df/425466?text=Knyga"
                    }
                    alt={
                      reservation.book?.title
                        ? `Knygos viršelis: ${reservation.book.title}`
                        : "Knygos viršelis"
                    }
                    loading="lazy"
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="mb-1 text-lg font-bold leading-snug text-[#263347]">
                    {reservation.book?.title || "Nežinoma knyga"}
                  </h2>

                  <p className="mb-3 text-sm text-slate-500">
                    {reservation.book?.author || "Autorius nenurodytas"}
                  </p>

                  <div className="space-y-1 text-sm text-slate-600">
                    <p>
                      <span className="font-medium">Rezervuota:</span>{" "}
                      {formatDate(reservation.reservedAt)}
                    </p>

                    <p className={overdue ? "font-bold text-red-600" : ""}>
                      <span className="font-medium">Grąžinti iki:</span>{" "}
                      {formatDate(reservation.dueDate)}
                      {overdue && " · Terminas praleistas"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 border-t border-slate-100 pt-4 sm:col-span-2 md:col-span-1 md:min-w-48 md:border-0 md:pt-0">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                    >
                      {statusLabel}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Pratęsimai: {renewals}/2
                    </span>
                  </div>

                  {active && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-library-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-library-dark focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={
                          renewing ||
                          cancelling ||
                          renewals >= 2 ||
                          overdue
                        }
                        onClick={() => {
                          renew({
                            variables: {
                              reservationId: reservation.id,
                            },
                          });
                        }}
                      >
                        {renewing ? "Pratęsiama..." : "Pratęsti terminą"}
                      </button>

                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={renewing || cancelling}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Ar tikrai norite atšaukti rezervaciją?"
                            )
                          ) {
                            cancel({
                              variables: {
                                reservationId: reservation.id,
                              },
                            });
                          }
                        }}
                      >
                        Atšaukti
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
