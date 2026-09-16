import { Navigate, Outlet } from "react-router-dom";
import Loader from "../components/common/Loader.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function RoleBasedRoute({ allowedRoles }) {
  const { user, role, isLoading } = useAuth();
  if (isLoading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return allowedRoles.includes(role) ? (
    <Outlet />
  ) : (
    <Navigate to="/not-authorized" replace />
  );
}
