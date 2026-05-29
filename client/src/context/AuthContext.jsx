import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearToken,
  getCurrentUser,
  getToken,
  login as loginRequest,
  register as registerRequest,
  setToken,
  updateCurrentUser
} from "../services/authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) {
      return;
    }

    getCurrentUser()
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const data = await loginRequest(credentials);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await registerRequest(payload);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  async function updateProfile(payload) {
    const data = await updateCurrentUser(payload);
    setUser(data.user);
    return data.user;
  }

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), isAdmin: user?.role === "admin", isLoading, login, register, logout, updateProfile }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
