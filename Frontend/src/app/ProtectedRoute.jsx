// בקובץ זה נמצא רכיב ההגנה על נתיבים במערכת
// הקובץ בודק את תפקיד המשתמש ומאפשר גישה רק למשתמשים מורשים
// הוא מספק אבטחה ומניעת גישה לא מורשית לדפים רגישים
// ProtectedRoute.js
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/loading spinner/Loading";
import { useState, useEffect } from "react";

/**
 * A route that checks the user's role and redirects if not allowed.
 *
 * @prop {string[]} allowedRoles - The roles that are allowed to access this route.
 * @returns {JSX.Element} The rendered route or a redirect to /.
 */
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
