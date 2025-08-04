import { useEffect, useState } from "react";
import axios from "axios";

export default function ChatRequests({ refreshGroups }) {
  const [pendingGroups, setPendingGroups] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/chat/groups`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const groups = res.data || [];
         
   const filtered = groups.filter((group) => {
  const memberIds = group.members.map((m) => m.toString());
  const approvedIds = group.approvedBy?.map((a) => a.toString());
  const rejectedIds = (group.rejectedBy || []).map((r) => r.toString());

  
  return (
    memberIds?.includes(userId) &&
    ! approvedIds?.includes(userId) &&
    !rejectedIds?.includes(userId)
  );
});
        setPendingGroups(filtered);
        setShowAlert(filtered.length > 0);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      }
    };

    if (token && userId) {
      fetchGroups();
    }
  }, [token, userId, refreshGroups]); // Add refreshGroups to re-fetch if it's updated

  const respond = async (groupId, accept) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat/respond`,
        { groupId, accept },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPendingGroups((prev) => prev.filter((g) => g._id !== groupId));
      refreshGroups(); // update global chat list
    } catch (err) {
      console.error("Failed to respond to chat request:", err);
    }
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
          {pendingGroups.map((group) => (
            <li key={group._id} className="border p-2 rounded">
              <span className="block font-medium">{group.name}</span>
              <div className="mt-1 flex gap-2">
                <button
                  onClick={() => respond(group._id, true)}
                  className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                >
                  Accept
                </button>
                <button
                  onClick={() => respond(group._id, false)}
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
