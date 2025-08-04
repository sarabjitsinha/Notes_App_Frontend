import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function UserList({ onSelect }) {
  const {user}=useAuth()
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const userId = user?._id;

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

//   return (
//     <div className="w-1/3 p-4 border-r h-full overflow-y-auto">
//       <h1 className="text-3xl" >Select User/Group to start chat</h1>
//       <h2 className="text-lg font-semibold mb-2">Users</h2>
//       {users.map((u) => (
//         <div
//           key={u._id}
//           className="p-2 border-b cursor-pointer hover:bg-gray-100"
//           onClick={() =>
//             onSelect({ type: "private", id: u._id, name: u.username })
//           }
//         >
//           {u.username}
//         </div>
//       ))}

//       <h2 className="text-lg font-semibold mt-4 mb-2">Groups</h2>
//       {groups.map((g) => (
//         <div
//           key={g._id}
//           className="p-2 border-b cursor-pointer hover:bg-green-100"
//           onClick={() =>
//             onSelect({ type: "group", id: g._id, name: g.name })
//           }
//         >
//           👥 {g.name}
//         </div>
//       ))}
//     </div>
//   );
// }


  return (
    <div className="w-1/3 p-4 border-r h-full overflow-y-auto">
      <h1 className="text-3xl">Select User/Group to start chat</h1>

      <h2 className="text-lg font-semibold mb-2">Users</h2>
      {users.map((u) => (
        <div
          key={u._id}
          className="p-2 border-b cursor-pointer hover:bg-gray-100"
          onClick={() => onSelect({ type: "private", id: u._id, name: u.username })}
        >
          {u.username}
        </div>
      ))}

      <h2 className="text-lg font-semibold mt-4 mb-2">Groups</h2>
      {groups.map((g) => {
        const memberIds = g.members.map((m) => m._id || m);
        const approvedIds = g.approvedBy.map((a) => a._id || a);
        const rejectedIds = (g.rejectedBy || []).map((r) => r._id || r);

        const isMember = memberIds.includes(userId);
        const isApproved = approvedIds.includes(userId);
        const isRejected = rejectedIds.includes(userId);

        const unauthorized = isMember && isRejected && !isApproved;

        return (
          <div
            key={g._id}
            className={`p-2 border-b cursor-pointer ${
              unauthorized ? "bg-red-100 cursor-not-allowed text-gray-400" : "hover:bg-green-100"
            }`}
            onClick={() => {
              if (!unauthorized) {
                onSelect({ type: "group", id: g._id, name: g.name });
              }
            }}
            title={unauthorized ? "You are not authorized to join this group" : ""}
          >
            👥 {g.name}
            {unauthorized && <span className="ml-2 text-xs">(Not authorized)</span>}
          </div>
        );
      })}
    </div>
  );
}