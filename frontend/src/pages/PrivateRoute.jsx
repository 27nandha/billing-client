import { useAuth } from "../context/auth";
import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, Outlet } from "react-router-dom";
import Spinner from "../pages/Spinner";

export default function PrivateRoute() {
  const [ok, setOk] = useState(null); // null = loading, true = authed, false = not authed
  const [auth] = useAuth();

  useEffect(() => {
    const authCheck = async () => {
      try {
        const response = await axios.get("/products/", {
          headers: {
            Authorization: auth?.token,
          },
        });
        setOk(response.data.success === true);
      } catch (err) {
        setOk(false);
      }
    };
    if (auth?.token) {
      authCheck();
    } else {
      setOk(false);
    }
  }, [auth?.token]);

  if (ok === null) return <Spinner />; // or any loading indicator

  return ok ? <Outlet /> : <Navigate to="/login" replace />;
}
