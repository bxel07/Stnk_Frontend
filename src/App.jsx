import { useState } from 'react';
import { Outlet } from 'react-router-dom';

// Components
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#F2F2F2] overflow-hidden">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} />
      <div className={` pt-16 flex-1 overflow-auto transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-20' : 'ml-0 md:ml-56 lg:ml-62'}`}>
        <div className="container mx-auto px-4 py-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;
