
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
    <section>
      <span className="eyebrow text-primary">SKAITYTOJO PASKYRA</span>
      <h1 className="section-title">Mano rezervacijos</h1>
      <p className="text-secondary mb-4">
        Čia galite stebėti knygų grąžinimo terminus ir pratęsimus.
      </p>

      {loading && (
        <div className="py-5 text-center">
          <div className="spinner-border text-primary" />
          <p className="mt-2">Kraunami duomenys...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          Nepavyko įkelti rezervacijų: {error.message}
        </div>
      )}

      {!loading && !error && reservations.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">▤</div>
          <h2 className="h4">Rezervacijų dar nėra</h2>
          <p>Atraskite knygą kataloge ir rezervuokite ją.</p>
          <a href="/" className="btn btn-primary">Ieškoti knygų</a>
        </div>
      )}

      <div className="d-grid gap-3">
        {reservations.map((reservation) => {
          const active = reservation.status === "ACTIVE";
          const renewals = reservation.renewalCount ?? 0;
          const overdue =
            active && new Date(reservation.dueDate) < new Date();

          return (
            <article className="card reservation-card" key={reservation.id}>
              <div className="card-body">
                <div className="row align-items-center g-3">
                  <div className="col-3 col-md-2">
                    <img
                      className="reservation-cover"
                      src={
                        reservation.book?.coverUrl ||
                        "https://placehold.co/160x220/ece8df/425466?text=Knyga"
                      }
                      alt=""
                    />
                  </div>

                  <div className="col-9 col-md-6">
                    <h2 className="h5 mb-1">
                      {reservation.book?.title || "Nežinoma knyga"}
                    </h2>
                    <p className="text-secondary mb-2">
                      {reservation.book?.author || "Autorius nenurodytas"}
                    </p>
                    <div className="small">
                      <div>
                        Rezervuota: {formatDate(reservation.reservedAt)}
                      </div>
                      <div className={overdue ? "text-danger fw-bold" : ""}>
                        Grąžinti iki: {formatDate(reservation.dueDate)}
                        {overdue && " · Terminas praleistas"}
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      <span
                        className={`badge ${
                          active
                            ? overdue
                              ? "text-bg-danger"
                              : "text-bg-success"
                            : "text-bg-secondary"
                        }`}
                      >
                        {active
                          ? overdue
                            ? "Vėluojama"
                            : "Aktyvi"
                          : reservation.status === "RETURNED"
                            ? "Grąžinta"
                            : "Atšaukta"}
                      </span>
                      <span className="badge text-bg-light">
                        Pratęsimai: {renewals}/2
                      </span>
                    </div>

                    {active && (
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className="btn btn-sm btn-primary"
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
                          className="btn btn-sm btn-outline-secondary"
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
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
