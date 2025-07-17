import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import AdminLogin from "@/pages/AdminLogin";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";

const Router: React.FC = () => {
  const { token, isAdmin } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public Home page */}
      <Route path="/" element={<Home />} />

      {/* User Dashboard - only for logged-in users who are NOT admins */}
      <Route
        path="/dashboard"
        element={
          token && !isAdmin ? <Dashboard /> : <Navigate to={token ? "/" : "/login"} />
        }
      />

      {/* Admin Dashboard - only for logged-in admins */}
      <Route
        path="/admin-dashboard"
        element={
          token && isAdmin ? <Dashboard /> : <Navigate to={token ? "/" : "/admin-login"} />
        }
      />

      {/* User Login */}
      <Route
        path="/login"
        element={token ? <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} /> : <Login />}
      />

      {/* Admin Login */}
      <Route
        path="/admin-login"
        element={token ? <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} /> : <AdminLogin />}
      />

      {/* Register */}
      <Route
        path="/register"
        element={token ? <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} /> : <Register />}
      />
    </Routes>
  );
};

export default Router;
