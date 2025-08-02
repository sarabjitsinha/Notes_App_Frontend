import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  auth: { token: localStorage.getItem("token") },
});

export default function ChatWindow({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    socket.on("message", (message) => {
      if (
        message.from === selectedUser._id ||
        message.to === selectedUser._id
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socket.off("message");
  }, [selectedUser]);

  const handleSend = () => {
    if (!msg && !file) return;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        socket.emit("private_message", {
          to: selectedUser._id,
          content: {
            name: file.name,
            data: reader.result,
          },
          type: "file",
        });
        setFile(null);
        fileInputRef.current.value = "";
      };
      reader.readAsDataURL(file);
    } else {
      socket.emit("private_message", {
        to: selectedUser._id,
        content: msg,
        type: "text",
      });
    }
    setMsg("");
  };

  const renderMessage = (m, index) => {
    if (m.type === "file") {
      return (
        <a
          key={index}
          href={m.content.data}
          download={m.content.name}
          className="block bg-yellow-100 p-2 rounded text-sm"
        >
          📎 {m.content.name}
        </a>
      );
    }
    return (
      <div
        key={index}
        className={`p-2 rounded max-w-[70%] ${
          m.from === selectedUser._id ? "bg-gray-300" : "bg-blue-500 text-white ml-auto"
        }`}
      >
        {m.content}
      </div>
    );
  };

  return (
    <div className="p-4 w-full border-l">
      <h2 className="text-lg font-semibold mb-2">Chat with {selectedUser?.username}</h2>

      <div className="h-[400px] overflow-y-auto bg-gray-100 p-2 rounded mb-2 space-y-1">
        {messages.map((m, idx) => renderMessage(m, idx))}
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          className="flex-1 border px-2 py-1 rounded"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type a message"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
          className="border px-1"
        />
        <button onClick={handleSend} className="bg-blue-600 text-white px-4 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
