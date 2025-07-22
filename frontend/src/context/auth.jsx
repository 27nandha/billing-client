import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ user: null, token: "" });
  const [loading, setLoading] = useState(true); // <-- Add loading

  useEffect(() => {
    const data = localStorage.getItem("auth");
    if (data) {
      const parsed = JSON.parse(data);
      setAuth({
        user: parsed.name,
        token: parsed.jwtToken,
      });
    }
    setLoading(false); // <-- Auth loaded
  }, []);

  if (loading) return <div>Loading...</div>; // <-- block app until auth is ready

  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
