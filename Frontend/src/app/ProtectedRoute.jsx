import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/loading spinner/Loading";
import { useState, useEffect } from "react";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const [showLoader, setShowLoader] = useState(true);

  // Delay showing content for 1.5s even if loading is fast
  useEffect(() => {
    const delay = setTimeout(() => {
      setShowLoader(false);
    }, 1000); 

    return () => clearTimeout(delay);
  }, []);

  if (loading || showLoader) return <Loading />;

  if (!user) return <Navigate to="/" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;

  return <Outlet />;
};

export default ProtectedRoute;
