import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * A route that only allows access if the user is logged in and has one of the
 * allowed roles. If the user is not logged in, they will be redirected to
 * /login. If the user is logged in but lacks the required role, they will be
 * redirected to /unauthorized.
 *
 * 
 * ************  IN PROGRESS   ****************
 * 
 * 
 * @param {{ allowedRoles: string[] }} props
 * @param {string[]} props.allowedRoles - The roles that are allowed to access
 *   this route.
 * @returns {ReactElement} The element to render if the user is allowed to
 *   access this route.
 */

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    console.log("not logged in");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log("not authorized");
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

