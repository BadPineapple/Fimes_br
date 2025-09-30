// frontend/src/contexts/AuthContext.jsx
import React from "react";
import api from "../services/api";

export const AuthContext = React.createContext(null);
export const useAuth = () => React.useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const isAuthenticated = !!user?.id;

  const login = async (email) => {
    setLoading(true);
    try {
      let res;
      try {
        res = await api.post("/auth/login", { email });
      } catch (e) {
        res = await api.post(`/auth/login?email=${encodeURIComponent(email)}`);
      }

      const data = res?.data;
      if (!data?.id) {
        throw new Error("Resposta de login inválida: faltando id");
      }

      setUser(data);
      localStorage.setItem("userId", String(data.id));
      return data;
    } catch (err) {
      setUser(null);
      localStorage.removeItem("userId");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userId");
  };

  React.useEffect(() => {
    let mounted = true;
    const userId = localStorage.getItem("userId");

    if (!userId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const r = await api.get(`/auth/me?user_id=${encodeURIComponent(userId)}`);
        if (mounted) setUser(r.data);
      } catch {
        if (mounted) {
          localStorage.removeItem("userId");
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "userId") {
        const next = e.newValue;
        if (!next) {
          setUser(null);
        } else {
          api
            .get(`/auth/me?user_id=${encodeURIComponent(next)}`)
            .then((r) => setUser(r.data))
            .catch(() => {
              localStorage.removeItem("userId");
              setUser(null);
            });
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
