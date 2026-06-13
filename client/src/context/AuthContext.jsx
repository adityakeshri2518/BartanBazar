import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, unwrap } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("bb_user") || "null"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("bb_token");
    if (!token) return;
    unwrap(api.get("/auth/me"))
      .then((data) => {
        setUser(data.user);
        localStorage.setItem("bb_user", JSON.stringify(data.user));
      })
      .catch(() => logout());
  }, []);

  const persist = (data) => {
    localStorage.setItem("bb_token", data.token);
    localStorage.setItem("bb_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (payload) => {
    setLoading(true);
    try {
      const data = await unwrap(api.post("/auth/login", payload));
      persist(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload) => {
    setLoading(true);
    try {
      const data = await unwrap(api.post("/auth/signup", payload));
      persist(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("bb_token");
    localStorage.removeItem("bb_user");
    setUser(null);
  };

  const updateLocalUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem("bb_user", JSON.stringify(nextUser));
  };

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, updateLocalUser, isAdmin: user?.role === "admin" }),
    [user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
