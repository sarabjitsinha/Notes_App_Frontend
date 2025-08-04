import { useState } from "react";
import axios from "axios";

export default function ChatSearch({ refreshGroups }) {
  const [usernames, setUsernames] = useState(""); // comma-separated string
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const handleRequest = async () => {
    const usernameArray = usernames
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (usernameArray.length === 0) {
      setMessage("Please enter at least one username.");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat/start`,
        { usernames: usernameArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Request sent or group already exists.");
      refreshGroups(); // refresh sidebar
      setUsernames(""); // clear input
    } catch (err) {
      setMessage(err.response?.data?.msg || "Failed to request chat");
    }
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Enter usernames (comma-separated)"
        value={usernames}
        onChange={(e) => setUsernames(e.target.value)}
        className="border rounded px-2 py-1 mr-2 w-full max-w-md"
      />
      <button
        onClick={handleRequest}
        className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
      >
        Request Chat
      </button>
      {message && <p className="text-sm mt-1">{message}</p>}
    </div>
  );
}
