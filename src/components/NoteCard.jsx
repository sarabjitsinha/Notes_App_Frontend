import axios from "axios";

export default function NoteCard({ note, selected, setSelected, refresh }) {
  const toggleSelect = () => {
    const copy = new Set(selected);
    if (copy.has(note._id)) copy.delete(note._id);
    else copy.add(note._id);
    setSelected(copy);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/notes/${note._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      refresh(); // re-fetch notes after delete
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  return (
    <div className="p-3 border rounded relative">
      <input type="checkbox" onChange={toggleSelect} checked={selected.has(note._id)} />
      {note.pinned && <span className="absolute top-2 right-2">📌</span>}
      {note.archived && <span className="absolute top-2 right-6 text-gray-400">📦</span>}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-12 text-red-500 hover:underline"
        title="Delete Note"
      >
        🗑️
      </button>
      <h3 className="text-lg font-bold">{note.title}</h3>
      <p>{note.content}</p>
      <div className="text-sm text-gray-500">{note.labels?.join(", ")}</div>
    </div>
  );
}
