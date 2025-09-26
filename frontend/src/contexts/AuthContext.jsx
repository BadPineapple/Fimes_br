import React from "react";
import api from "../services/api";

export const AuthContext = React.createContext(null);
export const useAuth = () => React.useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const login = async (email) => {
    const res = await api.post(`/auth/login?email=${encodeURIComponent(email)}`);
    setUser(res.data);
    localStorage.setItem("userId", res.data.id);
    return res.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userId");
  };

  React.useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return setLoading(false);
    api.get(`/auth/me?user_id=${userId}`)
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem("userId"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
