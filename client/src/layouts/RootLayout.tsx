import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold">AegisGrid</h1>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
