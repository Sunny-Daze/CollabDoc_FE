import { createContext, useEffect, useState, type ReactNode } from "react";
import api from "../services/auth.service";
import type { User, UserApiResponse } from "../types";
import { useNavigate } from "react-router";

interface AuthContextType {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<UserApiResponse>("/auth/me");
        if (!res?.data?.success) throw new Error("Something went wrong");
        if (res?.data?.user) {
          setUser(res?.data?.user);
          navigate("/");
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/login");
      }
    })();
  }, []);

  const login = async (username: string) => {
    try {
      const res = await api.post<UserApiResponse>("/auth/login", { username });
      if (!res?.data?.success && res.data.user) throw new Error("Something went wrong");

      setUser(res.data.user);
      return res
    } catch (err) {
      console.log(err);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
