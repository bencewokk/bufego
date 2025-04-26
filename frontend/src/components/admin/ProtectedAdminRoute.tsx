import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface Props {
  children: React.ReactNode;
}

const getUserRole = (): string => {
  const token = localStorage.getItem("accessToken");
  if (!token) return "user";
  try {
    // @ts-ignore
    const decoded = jwtDecode(token);
    // @ts-ignore
    return decoded.role || "user";
  } catch {
    return "user";
  }
};

export const ProtectedAdminRoute: React.FC<Props> = ({ children }) => {
  const role = getUserRole();
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
