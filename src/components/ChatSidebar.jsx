import ChatSearch from "./ChatSearch";
import ChatRequests from "./ChatRequests";
import { useEffect,useState } from "react";
import axios from "axios";

export default function ChatSidebar({ setActiveChat, activeChat }) {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);

  const fetchSidebarData = async () => {
    const token = localStorage.getItem("token");
    const [userRes, groupRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/api/chat/users`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${import.meta.env.VITE_API_URL}/api/chat/groups`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    setUsers(userRes.data);
    setGroups(groupRes.data);
  };

  useEffect(() => {
    fetchSidebarData();
  }, []);

  return (
    <div className="w-76 border-r p-4 space-y-4 overflow-y-auto">
      <ChatSearch refreshGroups={fetchSidebarData} />
      <ChatRequests refreshGroups={fetchSidebarData} />

      <div>
        <h3 className="font-bold mb-1">Private Chats</h3>
        <ul>
          { users?.map((user) => (
            <li
              key={user._id}
              onClick={() => setActiveChat({ type: "private", id: user._id, name: user.username })}
              className={`p-2 rounded cursor-pointer hover:bg-blue-100 ${
                activeChat?.id === user._id ? "bg-blue-200" : ""
              }`}
            >
              {user.username}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-bold mb-1 mt-4">Groups</h3>
        <ul>
          {groups.map((group) => (
            <li
              key={group._id}
              onClick={() => {
                setActiveChat({ type: "group", id: group._id, name: group.name });
              }}
              className={`p-2 rounded cursor-pointer hover:bg-green-100 ${
                activeChat?.id === group._id ? "bg-green-200" : ""
              }`}
            >
              {group.name}
              {group.unreadCount > 0 && (
                <span className="text-xs bg-red-500 text-white rounded-full px-2 ml-2">
                  {group.unreadCount}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


