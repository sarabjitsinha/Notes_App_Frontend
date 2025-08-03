
import { useEffect, useState } from "react";
import axios from "axios";

export default function ChatRequests({ refreshGroups }) {
  const [pendingGroups, setPendingGroups] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [showAlert, setShowAlert] = useState(false);

  const token = localStorage.getItem("token");
 
 const userId = localStorage.getItem("user");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/groups`, {headers:{Authorization:`Bearer ${token}`}});
        const data = res.data;

        const filtered = data.filter((group) => {
          const memberIds = group.members.map((m) => m.toString());
          const approvedIds = group.approvedBy.map((a) => a.toString());

          return memberIds.includes(userId) && !approvedIds.includes(userId);
        });


        setPendingGroups(filtered);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      }
    };

    fetchGroups();
  }, [userId,token]);


  const respond = async (groupId, accept) => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/chat/respond`,
      { groupId, accept },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setPendingGroups((prev) => prev.filter((g) => g._id !== groupId));
    refreshGroups();
  };

  return (
    <div className="mt-4">
      <h3 className="font-semibold">Pending Chat Requests</h3>

      {showAlert && (
        <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-sm mb-2">
          You have pending chat requests to approve!
        </div>
      )}

      {pendingGroups.length === 0 ? (
        <p className="text-sm text-gray-500">No pending requests</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {pendingGroups?.map((g) => (
            <li key={g._id} className="border p-2 rounded">
              <span className="block font-medium">{g.name}</span>
              <div className="mt-1 flex gap-2">
                <button
                  onClick={() => respond(g._id, true)}
                  className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                >
                  Accept
                </button>
                <button
                  onClick={() => respond(g._id, false)}
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
