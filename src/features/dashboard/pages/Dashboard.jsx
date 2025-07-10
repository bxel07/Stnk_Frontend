import { useEffect, useState } from "react";
import { Typography } from "@mui/material";

// Import Komponen Role
import SuperAdminDashboard from "@/features/dashboard/pages/SuperAdminDashboard";
import AdminDashboard from "@/features/dashboard/pages/AdminDashboard";
import CaoDashboard from "@/features/dashboard/pages/CaoDashboard";
import OrlapDashboard from "@/features/dashboard/pages/OrlapDashboard";

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setUser(savedUser);
  }, []);

  if (!user) return null;

  return (
    <div className="">
      <div className="mb-8">
        <Typography
          variant="h4"
          component="h1"
          className="text-gray-800 font-bold mb-2">
          <i className="bi bi-card-text me-3"></i>
          STNK Reader Application
        </Typography>
        <Typography variant="subtitle1" className="text-gray-600">
          Selamat datang, <strong>{user.name || user.userName}</strong>!<br />
          Anda login sebagai <strong>{user.role}</strong>.
        </Typography>
      </div>

      {/* Render Komponen Sesuai Role */}
      {user.role === "superadmin" && <SuperAdminDashboard />}
      {user.role === "admin" && <AdminDashboard />}
      {user.role === "cao" && <CaoDashboard />}
      {user.role === "orlap" && <OrlapDashboard />}
    </div>
  );
}

export default Dashboard;
