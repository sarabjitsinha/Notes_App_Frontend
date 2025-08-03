import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io(import.meta.env.VITE_API_URL, {
  auth: { token: localStorage.getItem("token") },
  transports: ["websocket"],
});

export default function ChatWindow({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [availableNotes, setAvailableNotes] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [noteToShare, setNoteToShare] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [groupmsg, setgroupmsg] = useState([]);
  const [chatState, setChatState] = useState("");

  console.log(selectedUser.id);
  console.log(selectedUser.type);
  const typingTimeout = useRef(null);
  const bottomRef = useRef();
  const user = localStorage.getItem("user");

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
    if (socket.connected) {
      setSocketConnected(true);
    } else {
      socket.on("connect", () => setSocketConnected(true));
    }

    socket.on("group-note", (data) => {
      if (data.groupId === selectedUser.id) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => socket.off("connect");
  }, [selectedUser.id]);

  useEffect(() => {
    if (selectedUser?.type === "group") {
      socket.emit("join-group", { groupId: selectedUser.id });
    }

    const handleGroupMessage = (data) => {
      if (data.groupId === selectedUser.id) {
        console.log("Inside group handler");
        setgroupmsg((prev) => [...prev, data]);
      }
    };

    socket.on("group-message", handleGroupMessage);
    return () => {
      socket.off("group-message", handleGroupMessage);
    };
  }, [selectedUser]);

  // useEffect(() => {
  //   if (!selectedUser._id || !socketConnected) return;
  //   const fetchMessages = async () => {
  //     try {
  //       const res = await axios.get(
  //         `${import.meta.env.VITE_API_URL}/api/chat/messages/${selectedUser._id}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           },
  //         }
  //       );
  //       setflag(true)
  //       setMessages(res.data);

  //     } catch (err) {
  //       console.error("Failed to fetch messages", err);
  //     }
  //   };
  //   fetchMessages();
  // }, [selectedUser._id, socketConnected]);

  useEffect(() => {
    if (!selectedUser.id) return;
    setChatState(selectedUser.type);
    const handleIncomingMessage = (data) => {
      console.log(data);
      if (data.from === selectedUser.id || data.to === selectedUser.id) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("message", handleIncomingMessage);
    socket.on("typing", ({ from }) => {
      if (from === selectedUser.id) setIsTyping(true);
    });
    socket.on("stop_typing", ({ from }) => {
      if (from === selectedUser.id) setIsTyping(false);
    });

    return () => {
      socket.off("message", handleIncomingMessage);
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [selectedUser.id, selectedUser.type]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // useEffect(() => {
  //   socket.on("note-shared", (payload) => {
  //     setMessages((prev) => [...prev, payload]);
  //   });
  //   return () => socket.off("note-shared");
  // }, []);

  useEffect(() => {
    socket.on("note-shared", (payload) => {
      console.log(payload);
      setgroupmsg((prev) => [...prev, payload]);
      setSuccessMessage("✅ Note shared successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    });

    return () => {
      socket.off("note-shared");
    };
  }, []);

  const handleShareNote = () => {
    if (!noteToShare) return;
    socket.emit("share-note", {
      groupId: selectedUser.id,
      note: noteToShare,
    });
    setNoteToShare(null);
  };

  const handleSend = () => {
    if (selectedUser.type === "private") {
      if (msg.trim() && selectedUser.id) {
        socket.emit("private_message", {
          to: selectedUser.id,
          type: "text",
          content: msg,
        });
        setMsg("");
      }
    } else if (selectedUser.type === "group") {
      if (msg.trim() && selectedUser.id) {
        socket.emit("group-message", {
          groupId: selectedUser.id,
          content: msg,
        });
        setMsg("");
      }
    }
  };

  const handleTyping = () => {
    if (!typing && selectedUser.id) {
      setTyping(true);
      socket.emit("typing", { to: selectedUser.id });
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", { to: selectedUser.id });
      setTyping(false);
    }, 1000);
  };
  console.log(groupmsg);
  console.log(chatState);
  const renderMessage = (m, i) => {
    const isMine = m.from === user;
    console.log(user);
    console.log(m.from);

    const bubble = isMine
      ? "bg-gray-300 text-black"
      : "bg-blue-500 text-white ml-auto";
    // if (m.note) {
    //   return (
    //     <div key={i} className="bg-yellow-100 p-2 rounded max-w-[70%]">
    //       📝 Shared Note: <strong>{m.note.title}</strong>
    //       <div className="text-xs text-gray-600">
    //         {m.note.content.slice(0, 50)}...
    //       </div>
    //     </div>
    //   );
    // }
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
    <div className="p-4 border-l w-full flex flex-col h-screen">
      <h2 className="text-lg font-semibold mb-2">
        Chat with {selectedUser?.username || selectedUser?.name}
      </h2>

      <div className="flex-1 overflow-y-auto bg-gray-100 p-2 rounded space-y-1 ">
        {chatState == "private"
          ? messages.map((m, i) => renderMessage(m, i))
          : groupmsg?.map((m, idx) => {
            if (m.note) {
      return (
        <div key={idx} className="bg-yellow-100 p-2 rounded max-w-[70%]">
          📝 Shared Note: <strong>{m.note.title}</strong>
          <div className="text-xs text-gray-600">
            {m.note.content.slice(0, 50)}...
          </div>
        </div>
      );
    }
              return <div key={idx}>{m.content}</div>;
            })}
        {isTyping && (
          <p className="text-sm italic text-gray-600 mt-2">Typing...</p>
        )}

        <div ref={bottomRef} />
      </div>

      {successMessage && (
        <div className="text-green-600 text-sm mt-1">{successMessage}</div>
      )}

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

      <div className="flex items-center gap-2 mt-2">
        <select
          className="border px-2 py-1 rounded"
          onChange={(e) => {
            const note = availableNotes.find((n) => n._id === e.target.value);
            if (note) {
              socket.emit("share-note", { groupId: selectedUser.id, note });
            }
          }}
        >
          <option value="">Share a note...</option>
          {availableNotes.map((note) => (
            <option key={note._id} value={note._id}>
              📄 {note.title}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="flex-1 border rounded px-2"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onInput={handleTyping}
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
