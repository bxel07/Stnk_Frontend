import { useState, useEffect } from 'react';
import { useDispatch } from "react-redux";
import { setCredentials } from "@/slices/authSlice";
import axios from 'axios';
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
  
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch (err) {
      console.warn("Gagal parse user dari localStorage:", err);
      localStorage.removeItem("user"); // bersihkan kalau korup
    }
  
    if (token && user) {
      dispatch(setCredentials({ token, user }));
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
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
