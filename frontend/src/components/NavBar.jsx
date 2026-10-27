import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  function handleLogout() {
    closeMenu();
    signOut();
    navigate("/");
  }

  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-white/10 text-white"
        : "text-slate-200 hover:bg-white/10 hover:text-white"
    }`;

  const buttonClass =
    "rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-white/60";

  return (
    <nav className="relative z-50 bg-library-dark text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2 text-lg font-bold tracking-tight sm:text-xl"
        >
          <span className="text-2xl text-blue-200" aria-hidden="true">
            ▤
          </span>
          Miesto biblioteka
        </Link>

        {/* Mobile menu button */}
        <button
          type="button"
          className="rounded-lg border border-white/25 p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60 lg:hidden"
          aria-controls="mainNavbar"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Uždaryti meniu" : "Atidaryti meniu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-6"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-6"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Navigation */}
        <div
          id="mainNavbar"
          className={`${
            menuOpen ? "flex" : "hidden"
          } w-full flex-col gap-2 border-t border-white/10 pt-3 lg:flex lg:w-auto lg:flex-1 lg:flex-row lg:items-center lg:justify-end lg:border-0 lg:pt-0`}
        >
          <NavLink
            to="/"
            end
            className={navLinkClass}
            onClick={closeMenu}
          >
            Knygų katalogas
          </NavLink>

          {user && (
            <NavLink
              to="/reservations"
              className={navLinkClass}
              onClick={closeMenu}
            >
              Mano rezervacijos
            </NavLink>
          )}

          {user?.role === "ADMIN" && (
            <NavLink
              to="/admin"
              className={navLinkClass}
              onClick={closeMenu}
            >
              Administravimas
            </NavLink>
          )}

          {user ? (
            <>
              <span className="px-3 py-2 text-sm text-blue-100">
                {user.name}
              </span>

              <button
                type="button"
                className={`${buttonClass} border border-white text-white hover:bg-white hover:text-library-dark`}
                onClick={handleLogout}
              >
                Atsijungti
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={navLinkClass}
                onClick={closeMenu}
              >
                Prisijungti
              </NavLink>

              <Link
                to="/register"
                onClick={closeMenu}
                className={`${buttonClass} bg-white text-library-dark hover:bg-blue-50`}
              >
                Registruotis
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
