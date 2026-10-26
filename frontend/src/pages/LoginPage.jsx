
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LOGIN } from "../graphql/queries.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [login, { loading }] = useMutation(LOGIN, {
    onCompleted: ({ login: result }) => {
      signIn(result);
      navigate(
        location.state?.from?.pathname ||
          (result.user.role === "ADMIN" ? "/admin" : "/"),
        { replace: true }
      );
    },
    onError: (error) => setMessage(error.message),
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    await login({ variables: { email: email.trim(), password } });
  }

  return (
    <div className="auth-wrapper">
      <div className="card auth-card border-0 shadow-sm">
        <div className="auth-icon">▤</div>
        <h1 className="h3 text-center fw-bold">Sveiki sugrįžę</h1>
        <p className="text-secondary text-center mb-4">
          Prisijunkite prie bibliotekos paskyros.
        </p>

        {message && (
          <div className="alert alert-danger" role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="email">
              El. paštas
            </label>
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

          <div className="mb-4">
            <label className="form-label" htmlFor="password">
              Slaptažodis
            </label>
            <input
              id="password"
              className="form-control"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button
            className="btn btn-primary btn-lg w-100"
            type="submit"
            disabled={loading}
          >
            {loading ? "Jungiamasi..." : "Prisijungti"}
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          Neturite paskyros? <Link to="/register">Registruokitės</Link>
        </p>
      </div>
    </div>
  );
}
