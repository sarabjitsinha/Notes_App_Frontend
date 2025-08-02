import { useState } from "react";
import { createNote } from "../api/notes";

export default function NoteEditor({ onCreated }) {
  const [form, setForm] = useState({ title: "", content: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createNote(form);
    setForm({ title: "", content: "" });
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        className="border p-1 mb-1 w-full"
        placeholder="Title"
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
      />
      <textarea
        className="border p-1 w-full"
        placeholder="Content"
        value={form.content}
        onChange={e => setForm({ ...form, content: e.target.value })}
      />
      <button className="mt-2 bg-blue-500 text-white px-3 py-1">Add Note</button>
    </form>
  );
}
