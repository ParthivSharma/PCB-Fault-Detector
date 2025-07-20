import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  username: string;
  email: string;
}

const AdminDashboard: React.FC = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8000/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete user");
      setUsers(users.filter(user => user.id !== userId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4">
      <div className="relative bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-4xl">
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow"
        >
          Logout
        </button>

        <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => navigate("/admin/image-history")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            View Image History
          </button>
        </div>

        {loading && <p className="text-center">Loading users...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!loading && users.length === 0 && <p className="text-center">No users found.</p>}

        {!loading && users.length > 0 && (
          <table className="min-w-full bg-slate-700 rounded-xl overflow-hidden">
            <thead>
              <tr>
                <th className="border-b border-slate-600 p-3 text-left">ID</th>
                <th className="border-b border-slate-600 p-3 text-left">Username</th>
                <th className="border-b border-slate-600 p-3 text-left">Email</th>
                <th className="border-b border-slate-600 p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-600">
                  <td className="p-3">{user.id}</td>
                  <td className="p-3">{user.username}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
