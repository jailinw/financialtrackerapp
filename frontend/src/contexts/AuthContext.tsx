import { createContext, useContext, useMemo, useState, useEffect } from "react";

interface AuthContextValue {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const setToken = (value: string | null) => {
    setTokenState(value);

    if (value) {
      localStorage.setItem("token", value);
    } else {
      localStorage.removeItem("token");
    }
  };

  const logout = () => {
    setToken(null);
  };

  const isAuthenticated = !!token;

  // Sync logout/login across tabs
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "token") {
        setTokenState(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo(
    () => ({
      token,
      setToken,
      logout,
      isAuthenticated,
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}