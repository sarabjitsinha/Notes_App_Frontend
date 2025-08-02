import Header from "../components/Header";
import { useState } from "react";
import UserList from "../components/UserList";
import ChatWindow from "../components/ChatWindow";
import ChatSidebar from "../components/ChatSidebar";

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="flex flex-col">
      <Header/>
      <div className="flex max-h-screen">
      <ChatSidebar setActiveChat={setActiveChat} activeChat={activeChat} />
      <UserList onSelect={setSelectedUser} />
      {selectedUser && <ChatWindow selectedUser={selectedUser} />}
      </div>
    </div>
  );
}
