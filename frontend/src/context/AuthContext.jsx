import React, { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("novhawk_user");
    const token = localStorage.getItem("novhawk_token");

    if (stored && token) {
      setUser(JSON.parse(stored));
    }

    setLoading(false);
  }, []);

  async function login(email, password) {
    const res = await client.post("/api/auth/login", {
      email,
      password,
    });

    localStorage.setItem("novhawk_token", res.data.access_token);
    localStorage.setItem("novhawk_user", JSON.stringify(res.data.user));

    setUser(res.data.user);

    return res.data.user;
  }

  async function register(payload) {
    const res = await client.post("/api/auth/register", payload);

    localStorage.setItem("novhawk_token", res.data.access_token);
    localStorage.setItem("novhawk_user", JSON.stringify(res.data.user));

    setUser(res.data.user);

    return res.data.user;
  }

  function logout() {
    localStorage.removeItem("novhawk_token");
    localStorage.removeItem("novhawk_user");

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}