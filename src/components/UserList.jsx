import { useEffect, useState } from "react";
import axios from "axios";

export default function UserList({ onSelect }) {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [userRes, groupRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/chat/users`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/chat/groups`, { headers }),
        ]);

        setUsers(userRes.data);
        setGroups(groupRes.data);
      } catch (err) {
        console.error("Failed to fetch user/group data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-1/3 p-4 border-r h-full overflow-y-auto">
      <h1 className="text-3xl" >Select User/Group to start chat</h1>
      <h2 className="text-lg font-semibold mb-2">Users</h2>
      {users.map((u) => (
        <div
          key={u._id}
          className="p-2 border-b cursor-pointer hover:bg-gray-100"
          onClick={() =>
            onSelect({ type: "private", id: u._id, name: u.username })
          }
        >
          {u.username}
        </div>
      ))}

      <h2 className="text-lg font-semibold mt-4 mb-2">Groups</h2>
      {groups.map((g) => (
        <div
          key={g._id}
          className="p-2 border-b cursor-pointer hover:bg-green-100"
          onClick={() =>
            onSelect({ type: "group", id: g._id, name: g.name })
          }
        >
          👥 {g.name}
        </div>
      ))}
    </div>
  );
}
