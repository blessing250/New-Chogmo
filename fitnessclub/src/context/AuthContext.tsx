import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../types";
import { apiFetch } from "../api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUser(user);
        // Optionally, you can refresh the user data from the server silently
        // to ensure it's up-to-date, without blocking the UI.
        refreshUser().catch(() => {
          // If refresh fails, the stored user might be invalid, so log out.
          logout();
        });
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const user = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      setIsLoading(false);
      return user;
    } catch (err) {
      setIsLoading(false);
      return null;
    }
  };

  const register = async (
    userData: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      setUser(res.user);
      localStorage.setItem("user", JSON.stringify(res.user));

      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      return false;
    }
  };

  const refreshUser = async (): Promise<User | null> => {
    try {
      const updatedUser = await apiFetch("/auth/profile");
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // If refresh fails, it might be due to an expired token, so log out.
      logout();
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
