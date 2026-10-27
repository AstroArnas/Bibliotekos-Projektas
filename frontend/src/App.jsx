import { Navigate, Route, Routes } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import BookDetailsPage from "./pages/BookDetailsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReservationsPage from "./pages/ReservationsPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-library-background">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/:id" element={<BookDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/reservations"
            element={
              <ProtectedRoute>
                <ReservationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="mt-8 border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
          <FontAwesomeIcon
            icon={faBookOpen}
            className="text-library-primary"
            aria-hidden="true"
          />
          <span>Miesto biblioteka · Knygos kiekvienam</span>
        </div>
      </footer>
    </div>
  );
}
