import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppShell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="flex min-h-screen bg-[#f4f2ec]">
      <aside className={`fixed left-0 top-0 h-full z-40 transition-all duration-300
                         ${sidebarOpen ? 'w-60' : 'w-16'} bg-[#2c3128]`}>
        <Sidebar collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      </aside>
      <div className={`flex-1 flex flex-col transition-all duration-300
                       ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <header className="h-[60px] bg-[#2c3128] border-b border-[#4a5240]
                           sticky top-0 z-30 flex items-center px-6">
          <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        </header>
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1400px] mx-auto px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
