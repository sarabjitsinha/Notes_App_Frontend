import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "./AuthLayout";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, form);
      setUser(res.data.user);
      alert("Registration succesful. Please login to continue")
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Register failed");
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Register
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-green-500 hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
