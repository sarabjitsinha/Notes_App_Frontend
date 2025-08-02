import { useState } from "react";
// import axios from "../api/axios";
import axios from "axios";

export default function ChatSearch({ refreshGroups }) {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const handleRequest = async () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat/start`,
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Request sent or group already exists.");
      refreshGroups(); // refresh sidebar
    } catch (err) {
      setMessage(err.response?.data?.msg || "Failed to request chat");
    }
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border rounded px-2 py-1 mr-2"
      />
      <button
        onClick={handleRequest}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Request Chat
      </button>
      {message && <p className="text-sm mt-1">{message}</p>}
    </div>
  );
}
