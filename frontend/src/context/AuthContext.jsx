
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useApolloClient } from "@apollo/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const apolloClient = useApolloClient();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) ?? null;
    } catch {
      return null;
    }
  });

  function signIn(authPayload) {
    localStorage.setItem("token", authPayload.token);
    localStorage.setItem("user", JSON.stringify(authPayload.user));
    setUser(authPayload.user);
  }

  function signOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    apolloClient.clearStore();
  }

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
