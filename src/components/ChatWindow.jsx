import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "../api/axios";

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
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [noteToShare, setNoteToShare] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  console.log(selectedUser)
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
      if (data.groupId === selectedUser._id) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => socket.off("connect");
  }, [selectedUser._id]);

  useEffect(() => {
    if (!selectedUser._id || !socketConnected) return;
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/chat/messages/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMessages(res.data);
      
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };
    fetchMessages();
  }, [selectedUser._id, socketConnected]);

  useEffect(() => {
    // if (!selectedUser._id) return;

    const handleIncomingMessage = (data) => {
      if (data.from === selectedUser._id || data.to === selectedUser._id) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("message", handleIncomingMessage);
    socket.on("typing", ({ from }) => {
      if (from === selectedUser._id) setIsTyping(true);
    });
    socket.on("stop_typing", ({ from }) => {
      if (from === selectedUser._id) setIsTyping(false);
    });

    return () => {
      socket.off("message", handleIncomingMessage);
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [selectedUser._id]);

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
      setMessages((prev) => [...prev, payload]);
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
    if (msg.trim() && selectedUser._id) {
      socket.emit("private_message", {
        to: selectedUser._id,
        type: "text",
        content: msg,
      });
      setMsg("");
    }
  };

  const handleTyping = () => {
    if (!typing && selectedUser._id) {
      setTyping(true);
      socket.emit("typing", { to: selectedUser._id });
    }
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", { to: selectedUser._id });
      setTyping(false);
    }, 1000);
  };

  const renderMessage = (m, i) => {
    const isMine = m.sender === user ;
    console.log(user)
    console.log(m.sender)
    const bubble = isMine ?  "bg-gray-300 text-black": "bg-blue-500 text-white ml-auto";
    if (m.note) {
      return (
        <div key={i} className="bg-yellow-100 p-2 rounded max-w-[70%]">
          📝 Shared Note: <strong>{m.note.title}</strong>
          <div className="text-xs text-gray-600">{m.note.content.slice(0, 50)}...</div>
        </div>
      );
    }
    return (
      <div key={i} className={`my-1 px-3 py-2 rounded-md max-w-[70%] ${bubble}`}>
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
        {messages.map((m, i) => renderMessage(m, i))}
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


