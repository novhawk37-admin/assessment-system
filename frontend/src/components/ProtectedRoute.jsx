import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  requireAdmin = false
}) {

  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (
    requireAdmin &&
    user.role?.toLowerCase() !== "admin"
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}