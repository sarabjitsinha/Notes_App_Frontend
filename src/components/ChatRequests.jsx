// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function ChatRequests({ refreshGroups }) {
//   const [pendingGroups, setPendingGroups] = useState([]);
//   const token=localStorage.getItem("token")

//   useEffect(() => {
//     axios.get(`${import.meta.env.VITE_API_URL}/api/chat/groups`,{headers:{Authorization:`Bearer ${token}`}}).then((res) => {
//       const groups = res.data.filter(g => !g.approvedBy.includes((localStorage.getItem("user"))._id));
//       setPendingGroups(groups);
//     });
//   }, [token]);

//   const respond = async (groupId, accept) => {
//     await axios.post(`${import.meta.env.VITE_API_URL}/api/chat/respond`, { groupId, accept },{headers:{Authorization:`Bearer ${token}`}});
//     setPendingGroups((prev) => prev.filter((g) => g._id !== groupId));
//     refreshGroups();
//   };

//   return (
//     <div className="mt-4">
//       <h3 className="font-semibold">Pending Chat Requests</h3>
//       {pendingGroups.length === 0 ? (
//         <p className="text-sm text-gray-500">No pending requests</p>
//       ) : (
//         <ul className="mt-2 space-y-2">
//           {pendingGroups.map((g) => (
//             <li key={g._id} className="border p-2 rounded">
//               <span className="block font-medium">{g.name}</span>
//               <div className="mt-1 flex gap-2">
//                 <button
//                   onClick={() => respond(g._id, true)}
//                   className="bg-green-500 text-white px-2 py-1 rounded text-sm"
//                 >
//                   Accept
//                 </button>
//                 <button
//                   onClick={() => respond(g._id, false)}
//                   className="bg-red-500 text-white px-2 py-1 rounded text-sm"
//                 >
//                   Reject
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import axios from "axios";

export default function ChatRequests({ refreshGroups }) {
  const [pendingGroups, setPendingGroups] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user").toString();

  useEffect(() => {
    if (!user || !token) return;

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/chat/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log(res)
        // const groups = res.data.filter(
        //   (g) => !g.approvedBy.includes(user._id)
        // );
        const groups = res.data.filter(
  (g) => !g.approvedBy.map((id) => id.toString()).includes(user._id.toString())
);

        setPendingGroups(groups);
        setShowAlert(groups.length > 0);
        // refreshGroups()
      });
  }, [token,user]);

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
          {pendingGroups.map((g) => (
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
