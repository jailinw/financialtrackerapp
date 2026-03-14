import { createContext, useContext, useMemo, useState, useEffect } from "react";

interface AuthContextValue {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// decode JWT expiration
function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    const stored = localStorage.getItem("token");

    if (!stored) return null;

    const exp = getTokenExpiration(stored);

    if (exp && Date.now() > exp) {
      localStorage.removeItem("token");
      return null;
    }

    return stored;
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

  // Auto logout when token expires
  useEffect(() => {
    if (!token) return;

    const exp = getTokenExpiration(token);
    if (!exp) return;

    const timeout = exp - Date.now();

    if (timeout <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      logout();
    }, timeout);

    return () => clearTimeout(timer);
  }, [token]);

  // Sync login/logout across tabs
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