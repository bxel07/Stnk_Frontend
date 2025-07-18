import { useEffect, useState } from "react";
import { 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  Paper,
  Fade,
  Slide,
  CircularProgress
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Person,
  SupervisorAccount,
  AdminPanelSettings,
  Badge,
  DirectionsCar,
  Description,
  Security,
  Group,
  AccountCircle,
  Stars,
  Verified
} from "@mui/icons-material";

// Import Komponen Role
import SuperAdminDashboard from "@/features/dashboard/pages/SuperAdminDashboard";
import AdminDashboard from "@/features/dashboard/pages/AdminDashboard";
import CaoDashboard from "@/features/dashboard/pages/CaoDashboard";
import OrlapDashboard from "@/features/dashboard/pages/OrlapDashboard";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulasi loading untuk efek yang lebih smooth
    setTimeout(() => {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      setUser(savedUser);
      setLoading(false);
    }, 500);
  }, []);

  const getRoleIcon = (role) => {
    const iconColor = '#166534'; // Hijau tua
    const iconSize = 32;
    
    switch (role?.toLowerCase()) {
      case 'superadmin':
        return <Stars sx={{ color: iconColor, fontSize: iconSize }} />;
      case 'admin':
        return <AdminPanelSettings sx={{ color: iconColor, fontSize: iconSize }} />;
      case 'cao':
        return <SupervisorAccount sx={{ color: iconColor, fontSize: iconSize }} />;
      case 'orlap':
        return <Group sx={{ color: iconColor, fontSize: iconSize }} />;
      default:
        return <Person sx={{ color: iconColor, fontSize: iconSize }} />;
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role?.toLowerCase()) {
      case 'superadmin':
        return 'Super Administrator';
      case 'admin':
        return 'Administrator';
      case 'cao':
        return 'CAO (Chief Administrative Officer)';
      case 'orlap':
        return 'ORLAP (Operator Lapangan)';
      default:
        return role;
    }
  };

  const getRoleDescription = (role) => {
    switch (role?.toLowerCase()) {
      case 'superadmin':
        return 'Akses penuh ke seluruh sistem dan pengaturan';
      case 'admin':
        return 'Mengelola data dan pengaturan administratif';
      case 'cao':
        return 'Mengawasi operasional dan administrasi';
      case 'orlap':
        return 'Operator lapangan untuk input data STNK';
      default:
        return 'Pengguna sistem STNK Reader';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-16">
        <Paper elevation={3} className="p-8 rounded-2xl">
          <Box className="flex flex-col items-center">
            <CircularProgress size={40} sx={{ color: '#166534' }} />
            <Typography className="mt-4 text-gray-600 font-medium">
              Memuat dashboard...
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box className="flex justify-center items-center py-16">
        <Paper elevation={3} className="p-8 rounded-2xl text-center">
          <Security sx={{ color: '#166534', fontSize: 48, mb: 2 }} />
          <Typography variant="h6" className="text-gray-800 font-semibold">
            Sesi Tidak Ditemukan
          </Typography>
          <Typography variant="body2" className="text-gray-600 mt-2">
            Silakan login kembali untuk mengakses dashboard
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      {/* Header Section */}
      <Fade in={true} timeout={800}>
        <Card className="shadow-lg rounded-2xl overflow-hidden">
          <Box className="bg-gradient-to-r from-green-700 to-green-800 p-6">
            <Box className="flex items-center gap-4">
              <Box className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                <DirectionsCar sx={{ color: 'white', fontSize: 35 }} />
              </Box>
              <Box className="flex-1">
                <Typography 
                  variant="h5" 
                  component="h1" 
                  className="text-white font-bold mb-1"
                >
                  STNK Reader Application
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  className="text-green-100 font-medium"
                >
                  Sistem Manajemen dan Pembaca STNK Digital
                </Typography>
              </Box>
              <Box className="hidden md:flex items-center gap-2">
                <Description sx={{ color: 'white', fontSize: 32 }} />
                <Verified sx={{ color: 'white', fontSize: 32 }} />
              </Box>
            </Box>
          </Box>
        </Card>
      </Fade>

      {/* Welcome Card */}
      <Slide direction="up" in={true} timeout={600}>
        <Card className="shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <Box className="flex items-center gap-4">
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80,
                  bgcolor: '#166534',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              >
                {getInitials(user.name || user.userName)}
              </Avatar>
              
              <Box className="flex-1">
                <Box className="flex items-center gap-3 mb-2">
                  <Typography variant="h5" className="font-bold text-gray-800">
                    Selamat Datang Kembali!
                  </Typography>
                  <AccountCircle sx={{ color: '#166534', fontSize: 28 }} />
                </Box>
                
                <Typography variant="h6" className="text-green-700 font-semibold mb-2">
                  {user.name || user.userName}
                </Typography>
                
                <Box className="flex items-center gap-3 flex-wrap">
                  <Box className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    <Chip 
                      label={getRoleDisplayName(user.role)}
                      sx={{ 
                        bgcolor: '#166534',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" className="text-gray-600">
                    {getRoleDescription(user.role)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Slide>

      {/* Dashboard Content */}
      <Fade in={true} timeout={1000}>
        <Card className="shadow-lg rounded-2xl">
          <Box className="bg-green-50 p-4 border-b border-green-200">
            <Box className="flex items-center gap-2">
              <DashboardIcon sx={{ color: '#166534', fontSize: 24 }} />
              <Typography variant="h6" className="font-bold text-gray-800">
                Dashboard {getRoleDisplayName(user.role)}
              </Typography>
            </Box>
          </Box>
          
          <CardContent className="p-6">
            {/* Render Komponen Sesuai Role */}
            {user.role === "superadmin" && (
              <Box className="space-y-4">
                <Box className="flex items-center gap-2 mb-4">
                  <Stars sx={{ color: '#166534' }} />
                  <Typography variant="subtitle1" className="font-semibold text-gray-700">
                    Super Administrator Control Panel
                  </Typography>
                </Box>
                <SuperAdminDashboard />
              </Box>
            )}
            
            {user.role === "admin" && (
              <Box className="space-y-4">
                <Box className="flex items-center gap-2 mb-4">
                  <AdminPanelSettings sx={{ color: '#166534' }} />
                  <Typography variant="subtitle1" className="font-semibold text-gray-700">
                    Administrator Panel
                  </Typography>
                </Box>
                <AdminDashboard />
              </Box>
            )}
            
            {user.role === "cao" && (
              <Box className="space-y-4">
                <Box className="flex items-center gap-2 mb-4">
                  <SupervisorAccount sx={{ color: '#166534' }} />
                  <Typography variant="subtitle1" className="font-semibold text-gray-700">
                    CABANG Management 
                  </Typography>
                </Box>
                <CaoDashboard />
              </Box>
            )}
            
            {user.role === "orlap" && (
              <Box className="space-y-4">
                <Box className="flex items-center gap-2 mb-4">
                  <Group sx={{ color: '#166534' }} />
                  <Typography variant="subtitle1" className="font-semibold text-gray-700">
                    ORLAP Operation Panel
                  </Typography>
                </Box>
                <OrlapDashboard />
              </Box>
            )}
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}

export default Dashboard;