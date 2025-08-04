import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function ChatPrompt({ group }) {
  const { user } = useAuth();

  if (!group || !user) return null;

  const userId = user._id;
  const isMember = group.members.some(member => member._id === userId);
  const isApproved = group.approvedBy.some(u => u._id === userId);
  const isRejected = group.rejectedBy?.some(u => u._id === userId);

  if (isMember && !isApproved && !isRejected) {
    return (
      <div className="p-3 border rounded bg-gray-100">
        <p>Do you want to join this group chat?</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => respondToGroup(true)}
            className="bg-green-500 text-white px-2 py-1 rounded"
          >
            Accept
          </button>
          <button
            onClick={() => respondToGroup(false)}
            className="bg-red-500 text-white px-2 py-1 rounded"
          >
            Reject
          </button>
        </div>
      </div>
    );
  }

  if (isRejected && !isApproved) {
    return <p className="text-red-500">You are not authorized to join this group.</p>;
  }

  return null;

  async function respondToGroup(accept) {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat/respond`,
        { groupId: group._id, accept },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      window.location.reload(); 
    } catch (err) {
      console.error(err);
    }
  }
}
