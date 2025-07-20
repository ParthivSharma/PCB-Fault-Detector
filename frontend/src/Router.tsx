import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import AdminLogin from "@/pages/AdminLogin";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminImageHistory from "@/pages/AdminImageHistory";  // ✅ import

const Router: React.FC = () => {
  const { token, isAdmin } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/dashboard"
        element={
          token && !isAdmin ? <Dashboard /> : <Navigate to={token ? "/" : "/login"} />
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          token && isAdmin ? <AdminDashboard /> : <Navigate to={token ? "/" : "/admin-login"} />
        }
      />

      {/* ✅ Admin Image History */}
      <Route
        path="/admin/image-history"
        element={
          token && isAdmin ? <AdminImageHistory /> : <Navigate to={token ? "/" : "/admin-login"} />
        }
      />

      <Route
        path="/login"
        element={token ? <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} /> : <Login />}
      />

      <Route
        path="/admin-login"
        element={token ? <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} /> : <AdminLogin />}
      />

      <Route
        path="/register"
        element={token ? <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} /> : <Register />}
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default Router;
