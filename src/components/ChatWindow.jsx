import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import ChatPrompt from "./ChatPrompt";

export default function ChatWindow({ selectedUser }) {
  const socketRef = useRef(null);
  const [chatMessages, setChatMessages] = useState({});
  const [msg, setMsg] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [availableNotes, setAvailableNotes] = useState([]);
  const [noteToShare, setNoteToShare] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [groupmsg, setgroupmsg] = useState({});
  const [chatState, setChatState] = useState("");
  const [groupData, setGroupData] = useState(null);
  const [isRejected, setIsRejected] = useState(false);
  const [sharedNotes, setSharedNotes] = useState({});
  const typingTimeout = useRef(null);
  const bottomRef = useRef();
  const user = localStorage.getItem("user");
    console.log(selectedUser)
  useEffect(() => {
    const fetchGroupData = async () => {
      if (selectedUser?.type === "group") {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/chat/groups/${selectedUser.id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          setGroupData(res.data);
          const rejectedIds = res.data.rejectedBy.map((u) =>
            typeof u === "object" ? u._id : u
          );
          const approvedIds = res.data.approvedBy.map((u) =>
            typeof u === "object" ? u._id : u
          );
          setIsRejected(rejectedIds.includes(user) && !approvedIds.includes(user));
        } catch (err) {
          console.error("Failed to fetch group data:", err);
        }
      }
    };

    fetchGroupData();
  }, [selectedUser]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAvailableNotes(res.data);
    };
    fetchNotes();
  }, []);

  useEffect(() => {
    socketRef.current?.on("note-shared", (payload) => {
        console.log(payload)
        console.log(selectedUser)
     setSharedNotes((prev) => {
     const existing = prev[selectedUser.id] || [];
      return {
        ...prev,
        [selectedUser.id]: [...existing, payload],
      };
    });
    setSuccessMessage("✅ Note shared successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
});

return () => {
    socketRef.current?.off("note-shared");
};
}, [selectedUser]);
console.log(groupmsg)

  useEffect(() => {
    if(selectedUser?.type!=="group") return
    
      socketRef.current?.emit("join-group", { groupId: selectedUser.id });
    

    const handleGroupMessage = (data) => {
      
        
        setgroupmsg((prev) =>{

            const existing=prev[data.groupId] || []
            return {...prev,
                [data.groupId]:[...existing,data],
                
            }
        } )
    };
    

    socketRef.current?.on("group-message", handleGroupMessage);
    return () => {
      socketRef.current?.off("group-message", handleGroupMessage);
    };
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser?.id) return;
    setChatState(selectedUser.type);

    const handleIncomingMessage = (data) => {
      if (data.from === selectedUser.id || data.to === selectedUser.id) {
        setChatMessages((prev) => ({
          ...prev,
          [selectedUser.id]: [...(prev[selectedUser.id] || []), data],
        }));
      }
    };

    socketRef.current?.on("message", handleIncomingMessage);

    socketRef.current?.on("typing", ({ from }) => {
      if (from === selectedUser.id) setIsTyping(true);
    });

    socketRef.current?.on("stop_typing", ({ from }) => {
      if (from === selectedUser.id) setIsTyping(false);
    });

    return () => {
      socketRef.current?.off("message", handleIncomingMessage);
      socketRef.current?.off("typing");
      socketRef.current?.off("stop_typing");
    };
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, groupmsg]);

  const handleSend = () => {
    if (!msg.trim() || !selectedUser?.id) return;

    const messageData = {
      from: user,
      to: selectedUser.id,
      type: "text",
      content: msg,
      timestamp: new Date().toISOString(),
    };

    if (selectedUser.type === "private") {
      socketRef.current?.emit("private_message", messageData);
    } else if (selectedUser.type === "group" && !isRejected) {

        const newMsg = {
    groupId: selectedUser.id,
    content: msg,
    sender: user,
    timestamp: new Date(),
  };
      socketRef.current?.emit("group-message", newMsg       );
    }

    setMsg("");
  };

  const handleTyping = () => {
    if (!typing && selectedUser.id) {
      setTyping(true);
      socketRef.current?.emit("typing", { to: selectedUser.id });
    }

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", { to: selectedUser.id });
      setTyping(false);
    }, 1000);
  };

  const handleShareNote = () => {
    if (!noteToShare || selectedUser.type !== "group") return;
        console.log("share note inside")
    
    socketRef.current?.emit("share-note", {
      groupId: selectedUser.id,
      note: noteToShare,
    });

    setNoteToShare(null);
  };

  if (selectedUser?.type === "group" && isRejected) {
    return (
      <div className="p-4 border-l w-full flex flex-col h-[90vh] items-center justify-center">
        <p className="text-red-600 text-lg font-semibold">
          🚫 You are not authorized to join this group.
        </p>
      </div>
    );
  }

  {chatState==="group" &&  (sharedNotes[selectedUser.id] || []).map((n, idx) => (
      
    <div key={`note-${idx}`} className="bg-yellow-100 p-2 rounded max-w-[70%]">
      📝 Shared Note: <strong>{n.note?.title}</strong>
      <div className="text-xs text-gray-600">
        {n.note?.content?.slice(0, 50)}...
      </div>
    </div>
  ))}
  const renderMessage = (m, i) => {
    const isMine = m.from === user;
    const bubble = isMine
      ? "bg-gray-300 text-black"
      : "bg-blue-500 text-white ml-auto";
    return (
      <div
        key={i}
        className={`my-1 px-3 py-2 rounded-md max-w-[70%] ${bubble}`}
      >
        {m.content}
      </div>
    );
  };

  return (
    <div className="p-4 border-l w-full flex flex-col h-[90vh]">
      <h2 className="text-lg font-semibold mb-2">
        Chat with {selectedUser?.username || selectedUser?.name}
      </h2>

      {groupData && <ChatPrompt group={groupData} />}

      <div className="flex-1 overflow-y-auto bg-gray-100 p-2 rounded space-y-1 ">
        {chatState === "private"
          ? (chatMessages[selectedUser.id] || []).map((m, i) => renderMessage(m, i))
          : (groupmsg[selectedUser.id] || []).map((m, idx) => {
             
            //   if (m.note) {
            //     return (
            //       <div key={idx} className="bg-yellow-100 p-2 rounded max-w-[70%]">
            //         📝 Shared Note: <strong>{m.note.title}</strong>
            //         <div className="text-xs text-gray-600">
            //           {m.note.content.slice(0, 50)}...
            //         </div>
            //       </div>
            //     );
            //   }
              return (
                <div key={idx} className="bg-gray-300 p-2 rounded max-w-[70%]">
                  {m.content}
                </div>
              );
            })}

            

        {isTyping && (
          <p className="text-sm italic text-gray-600 mt-2">Typing...</p>
        )}

        <div ref={bottomRef} />
      </div>

      {successMessage && (
        <div className="text-green-600 text-sm mt-1">{successMessage}</div>
      )}

      {chatState === "group" && (
        <div className="flex items-center gap-2 mt-2">
          <select
            className="border px-2 py-1 rounded"
            value={noteToShare?._id || ""}
            onChange={(e) => {
              const note = availableNotes.find((n) => n._id === e.target.value);
              setNoteToShare(note);
            }}
          >
            <option value="">Select note to share...</option>
            {availableNotes.map((note) => (
              <option key={note._id} value={note._id}>
                📄 {note.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleShareNote}
            disabled={!noteToShare}
            className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            Share Note
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mt-2">
        <input
          type="text"
          className="flex-1 border rounded px-2"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onInput={handleTyping}
          placeholder="Type your message..."
          disabled={selectedUser?.type === "group" && isRejected}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-1 rounded"
          disabled={selectedUser?.type === "group" && isRejected}
        >
          Send
        </button>
      </div>
    </div>
  );
}
