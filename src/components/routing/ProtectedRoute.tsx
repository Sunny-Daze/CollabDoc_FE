import type { ReactNode } from "react";
import { Navigate } from "react-router";
import useAuth from "../../hooks/useAuth";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
