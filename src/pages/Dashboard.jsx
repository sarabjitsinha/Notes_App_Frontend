import { useEffect, useState } from "react";
import { fetchNotes } from "../api/notes";
import NoteCard from "../components/NoteCard";
import BulkActions from "../components/BulkActions";
import NoteEditor from "../components/NoteEditor";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [filter, setFilter] = useState("all"); // 'all' | 'pinned' | 'archived'
  const { user} =useAuth()

  const loadNotes = async () => {
    const res = await fetchNotes();
    setNotes(res.data);
  };

  useEffect(() => {
    if(user)
    loadNotes();
  }, [user]);

  const filteredNotes = notes.filter((n) => {
    if (filter === "pinned") return n.pinned;
    if (filter === "archived") return n.archived;
    return true;
  });

  return (
    <div className="p-4">
      <Header/>
      <h2 className="text-xl mb-4">Your Notes</h2>

      {/* Filter Controls */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={filter === "all" ? "font-bold" : ""}
        >
          All
        </button>
        <button
          onClick={() => setFilter("pinned")}
          className={filter === "pinned" ? "font-bold" : ""}
        >
          📌 Pinned
        </button>
        <button
          onClick={() => setFilter("archived")}
          className={filter === "archived" ? "font-bold" : ""}
        >
          📦 Archived
        </button>
      </div>

      <NoteEditor onCreated={loadNotes} />

      {selected.size > 0 && (
        <BulkActions
          selected={selected}
          clearSelection={() => setSelected(new Set())}
          refresh={loadNotes}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredNotes.map(note => (
          <NoteCard
            key={note._id}
            note={note}
            selected={selected}
            setSelected={setSelected}
            refresh={loadNotes}
          />
        ))}
      </div>
    </div>
  );
}
