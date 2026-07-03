import React, { createContext, useContext, useState } from "react";
import api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("tf_user");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("tf_token", data.token);
    localStorage.setItem("tf_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function signup(payload) {
    const { data } = await api.post("/auth/signup", payload);
    localStorage.setItem("tf_token", data.token);
    localStorage.setItem("tf_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("tf_token");
    localStorage.removeItem("tf_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
