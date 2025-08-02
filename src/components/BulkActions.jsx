import { bulkUpdateNotes } from "../api/notes";

export default function BulkActions({ selected, clearSelection, refresh }) {
  const ids = [...selected];

  const bulk = async (update) => {
    await bulkUpdateNotes(ids, update);
    clearSelection();
    refresh();
  };

  return (
    <div className="flex gap-2 mb-4">
      <button onClick={() => bulk({ pinned: true })}>📌 Pin</button>
      <button onClick={() => bulk({ archived: true })}>📦 Archive</button>
      <button onClick={() => bulk({ archived: false })}>♻️ Restore</button>
    </div>
  );
}
