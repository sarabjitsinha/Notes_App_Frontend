import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function UserList({ onSelect }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/chat/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setUsers(res.data));
  }, []);

  return (
    <div className="w-1/3 p-4 border-r h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2">Users</h2>
      {users.map((u) => (
        <div
          key={u._id}
          className="p-2 border-b cursor-pointer hover:bg-gray-100"
          onClick={() => onSelect(u)}
        >
          {u.username}
        </div>
      ))}
    </div>
  );
}
