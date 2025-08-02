export default function AuthLayout({ children }) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        {children}
      </div>
    </div>
  );
}
