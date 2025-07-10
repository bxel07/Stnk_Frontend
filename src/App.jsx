import { useState, useEffect } from 'react';
import { useDispatch } from "react-redux";
import { setCredentials } from "@/slices/authSlice";
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token && user) {
      dispatch(setCredentials({ token, user }));
    }
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-[#F2F2F2] overflow-hidden">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} />
      <div className={`pt-16 flex-1 overflow-auto transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-20' : 'ml-0 md:ml-56 lg:ml-62'}`}>
        <div className="container mx-auto px-4 py-6">
          <Outlet />
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </div>
    </div>
  );
}

export default App;
