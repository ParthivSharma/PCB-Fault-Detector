import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post("http://localhost:8000/register", { username, password });
      setSuccess("🎉 Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-8 rounded-2xl shadow-xl w-96 space-y-5"
      >
        <h2 className="text-3xl text-white font-bold text-center">Register</h2>
        <p className="text-gray-400 text-sm text-center">
            Sign up to Experience AI-Powered PCB Fault Analysis
        </p>


        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        {success && <p className="text-green-400 text-sm text-center">{success}</p>}

       
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
          required
          
        />

        <Button
        
          type="submit"
          variant="success"
          size="lg"
          className="w-full font-bold shadow-lg no-underline hover:scale-105 hover:brightness-110 transition-transform"
        >
          Register
          
        </Button>
      </form>
    </div>
  );
};

export default Register;
