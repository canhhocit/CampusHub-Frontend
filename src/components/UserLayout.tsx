import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const UserLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
