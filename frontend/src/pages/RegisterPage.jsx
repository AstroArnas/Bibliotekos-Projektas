import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faBookOpen } from "@fortawesome/free-solid-svg-icons";

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

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-library-primary focus:outline-none focus:ring-2 focus:ring-library-primary/20";

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-4 text-center text-3xl text-library-primary">
          <FontAwesomeIcon icon={faBookOpen} />
        </div>

        <h1 className="text-center text-2xl font-bold text-slate-800">
          Sukurti paskyrą
        </h1>

        <p className="mb-6 mt-2 text-center text-slate-500">
          Prisijunkite prie skaitytojų bendruomenės.
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
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Vardas
            </label>
            <input
              id="name"
              className={inputClass}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              required
            />
          </div>

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
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Mažiausiai 8 simboliai.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium"
            >
              Pakartokite slaptažodį
            </label>
            <input
              id="confirmPassword"
              className={inputClass}
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-library-primary px-4 py-2.5 font-semibold text-white hover:bg-library-dark disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faUserPlus} />
            {loading ? "Kuriama paskyra..." : "Registruotis"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Jau turite paskyrą?{" "}
          <Link
            to="/login"
            className="font-semibold text-library-primary hover:underline"
          >
            Prisijunkite
          </Link>
        </p>
      </div>
    </div>
  );
}
