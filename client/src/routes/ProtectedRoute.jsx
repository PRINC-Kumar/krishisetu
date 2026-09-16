import { Navigate, Outlet } from "react-router-dom";
import Loader from "../components/common/Loader.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loader />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
