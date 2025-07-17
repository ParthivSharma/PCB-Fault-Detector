import React, {
  createContext,
  useState,
  ReactNode,
  useContext
} from "react";

interface AuthContextType {
  token: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (token: string, isAdmin: boolean) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  isAdmin: false,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isAdmin, setIsAdmin] = useState<boolean>(localStorage.getItem("isAdmin") === "true");

  const login = (newToken: string, isAdmin: boolean) => {
    setToken(newToken);
    setIsAdmin(isAdmin);
    localStorage.setItem("token", newToken);
    localStorage.setItem("isAdmin", isAdmin.toString());
  };

  const logout = () => {
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, isAdmin, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the AuthContext
export const useAuth = () => useContext(AuthContext);
