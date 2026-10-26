
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Link, useNavigate } from "react-router-dom";
import { REGISTER } from "../graphql/queries.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const [register, { loading }] = useMutation(REGISTER, {
    onCompleted: ({ register: result }) => {
      signIn(result);
      navigate("/");
    },
    onError: (error) => setMessage(error.message),
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Slaptažodis turi būti bent 8 simbolių ilgio.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Slaptažodžiai nesutampa.");
      return;
    }

    await register({
      variables: {
        name: name.trim(),
        email: email.trim(),
        password,
      },
    });
  }

  return (
    <div className="auth-wrapper">
      <div className="card auth-card border-0 shadow-sm">
        <div className="auth-icon">＋</div>
        <h1 className="h3 text-center fw-bold">Sukurti paskyrą</h1>
        <p className="text-secondary text-center mb-4">
          Prisijunkite prie skaitytojų bendruomenės.
        </p>

        {message && (
          <div className="alert alert-danger" role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="name">Vardas</label>
            <input
              id="name"
              className="form-control"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="email">El. paštas</label>
            <input
              id="email"
              className="form-control"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="password">
              Slaptažodis
            </label>
            <input
              id="password"
              className="form-control"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <div className="form-text">Mažiausiai 8 simboliai.</div>
          </div>

          <div className="mb-4">
            <label className="form-label" htmlFor="confirmPassword">
              Pakartokite slaptažodį
            </label>
            <input
              id="confirmPassword"
              className="form-control"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          <button
            className="btn btn-primary btn-lg w-100"
            type="submit"
            disabled={loading}
          >
            {loading ? "Kuriama paskyra..." : "Registruotis"}
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          Jau turite paskyrą? <Link to="/login">Prisijunkite</Link>
        </p>
      </div>
    </div>
  );
}
