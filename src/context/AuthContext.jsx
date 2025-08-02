/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { disconnectSocket } from "../components/socketClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const token=localStorage.getItem("token")

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`,{headers:{Authorization:`Bearer ${token}`}});
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  };

   const logout = async () => {
    await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {});
    disconnectSocket()
    localStorage.clear()
    setUser(null);
  };

  useEffect(() => { fetchUser(); }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
