// eslint-disable-next-line no-unused-vars
export default function NoteCard({ note, selected, setSelected, refresh }) {
  const toggleSelect = () => {
    const copy = new Set(selected);
    if (copy.has(note._id)) copy.delete(note._id);
    else copy.add(note._id);
    setSelected(copy);
  };

  return (
    <div className="p-3 border rounded relative">
      <input type="checkbox" onChange={toggleSelect} checked={selected.has(note._id)} />
      {note.pinned && <span className="absolute top-2 right-2">📌</span>}
      {note.archived && <span className="absolute top-2 right-6 text-gray-400">📦</span>}
      <h3 className="text-lg font-bold">{note.title}</h3>
      <p>{note.content}</p>
      <div className="text-sm text-gray-500">{note.labels?.join(", ")}</div>
    </div>
  );
}
