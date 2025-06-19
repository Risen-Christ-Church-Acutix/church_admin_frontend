import { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../api-handler/api-handler";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/api/auth/me");
        setUser(res.data);
      } catch (err) {
        console.log(err);
        setUser(null);
      } finally {
        setReady(true);
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      await axiosInstance.post("/api/auth/login", { email, password });
      const res = await axiosInstance.get("/api/auth/me");
      setUser(res.data);
      console.log(res);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/api/auth/logout");

      window.location.reload();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  const value = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    handleLogout

  };
  if (!ready) return null;

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
