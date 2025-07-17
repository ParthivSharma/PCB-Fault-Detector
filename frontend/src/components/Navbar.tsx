import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

const Navbar: React.FC = () => {
  const { token, logout } = useContext(AuthContext);

  return (
    <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-2xl font-bold no-underline">
          PCB Fault Detector
        </Link>

        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-gray-300 no-underline">
            Home
          </Link>
          <Link to="/about" className="hover:text-gray-300 no-underline">
            About
          </Link>

          {token && (
            <>
              <Link
                to="/dashboard"
                className="bg-blue-600 text-white font-semibold px-3 py-1 rounded shadow-md hover:bg-blue-700 hover:brightness-110 no-underline"
              >
                Dashboard
              </Link>

              <Link
                to="/admin-panel"
                className="bg-purple-600 text-white font-semibold px-3 py-1 rounded shadow-md hover:bg-purple-700 hover:brightness-110 no-underline"
              >
                Admin Panel
              </Link>
            </>
          )}

          {!token ? (
            <>
              <Link
                to="/login"
                className="bg-blue-600 text-white font-semibold px-3 py-1 rounded shadow-md hover:bg-blue-700 hover:brightness-110 no-underline"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-green-600 text-white font-semibold px-3 py-1 rounded shadow-md hover:bg-green-700 hover:brightness-110 no-underline"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="bg-red-600 text-white font-semibold px-3 py-1 rounded shadow-md hover:bg-red-700 hover:brightness-110"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
