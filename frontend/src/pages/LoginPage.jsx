import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faRightToBracket } from "@fortawesome/free-solid-svg-icons";

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

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-library-primary focus:outline-none focus:ring-2 focus:ring-library-primary/20";

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-4 text-center text-3xl text-library-primary">
          <FontAwesomeIcon icon={faBookOpen} />
        </div>

        <h1 className="text-center text-2xl font-bold text-slate-800">
          Sveiki sugrįžę
        </h1>
        <p className="mb-6 mt-2 text-center text-slate-500">
          Prisijunkite prie bibliotekos paskyros.
        </p>

        {message && (
          <p
            className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              El. paštas
            </label>
            <input
              id="email"
              className={inputClass}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Slaptažodis
            </label>
            <input
              id="password"
              className={inputClass}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-library-primary px-4 py-2.5 font-semibold text-white hover:bg-library-dark disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faRightToBracket} />
            {loading ? "Jungiamasi..." : "Prisijungti"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Neturite paskyros?{" "}
          <Link to="/register" className="font-semibold text-library-primary hover:underline">
            Registruokitės
          </Link>
        </p>
      </div>
    </div>
  );
}
