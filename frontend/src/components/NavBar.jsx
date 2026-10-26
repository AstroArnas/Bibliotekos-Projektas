
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    signOut();
    navigate("/");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark library-navbar">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <span className="brand-icon">▤</span> Miesto biblioteka
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Atidaryti meniu"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <NavLink className="nav-link" to="/">
              Knygų katalogas
            </NavLink>

            {user && (
              <NavLink className="nav-link" to="/reservations">
                Mano rezervacijos
              </NavLink>
            )}

            {user?.role === "ADMIN" && (
              <NavLink className="nav-link" to="/admin">
                Administravimas
              </NavLink>
            )}

            {user ? (
              <>
                <span className="navbar-text user-label">
                  {user.name}
                </span>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={handleLogout}
                >
                  Atsijungti
                </button>
              </>
            ) : (
              <>
                <Link className="nav-link" to="/login">
                  Prisijungti
                </Link>
                <Link className="btn btn-light btn-sm px-3" to="/register">
                  Registruotis
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
