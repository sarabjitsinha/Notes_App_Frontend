export default function TypingIndicator({ username }) {
  return (
    <div className="text-sm text-gray-400 italic">
      {username} is typing...
    </div>
  );
}
