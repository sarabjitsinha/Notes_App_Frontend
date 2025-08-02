import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow px-6 py-3 flex items-center justify-between">
      <div className="text-xl font-semibold text-blue-600">
        📝 NotesApp
      </div>

      <nav className="flex gap-4 items-center">
        <Link to="/" className="text-gray-700 hover:text-blue-500">Dashboard</Link>
        <Link to="/chat" className="text-gray-700 hover:text-blue-500">Chat</Link>
      </nav>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">👤 {user?.username}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
