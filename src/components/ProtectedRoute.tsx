import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export const ProtectedRoute = () => {
  const { accessToken, user } = useAuthStore();
  const location = useLocation();

  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  const { accessToken, user } = useAuthStore();

  if (accessToken && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};