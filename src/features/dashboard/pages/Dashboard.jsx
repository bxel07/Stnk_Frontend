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
  CircularProgress,
  useTheme,
  useMediaQuery
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
    const iconSize = isMobile ? 24 : 32;
    
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
        return isSmallMobile ? 'CAO' : 'CAO (Chief Administrative Officer)';
      case 'orlap':
        return isSmallMobile ? 'ORLAP' : 'ORLAP (Operator Lapangan)';
      default:
        return role;
    }
  };

  const getRoleDescription = (role) => {
    switch (role?.toLowerCase()) {
      case 'superadmin':
        return isMobile ? 'Akses penuh sistem' : 'Akses penuh ke seluruh sistem dan pengaturan';
      case 'admin':
        return isMobile ? 'Kelola data administratif' : 'Mengelola data dan pengaturan administratif';
      case 'cao':
        return isMobile ? 'Awasi operasional' : 'Mengawasi operasional dan administrasi';
      case 'user':
        return isMobile ? 'Input data STNK' : 'Operator lapangan untuk input data STNK';
      default:
        return isMobile ? 'Pengguna sistem' : 'Pengguna sistem STNK Reader';
    }
  };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-16 px-4">
        <Paper elevation={3} className="p-6 sm:p-8 rounded-2xl w-full max-w-sm">
          <Box className="flex flex-col items-center">
            <CircularProgress size={40} sx={{ color: '#166534' }} />
            <Typography className="mt-4 text-gray-600 font-medium text-center">
              Memuat dashboard...
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box className="flex justify-center items-center py-16 px-4">
        <Paper elevation={3} className="p-6 sm:p-8 rounded-2xl text-center w-full max-w-md">
          <Security sx={{ color: '#166534', fontSize: isMobile ? 40 : 48, mb: 2 }} />
          <Typography variant={isMobile ? "subtitle1" : "h6"} className="text-gray-800 font-semibold">
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
    <Box className="space-y-4 sm:space-y-6 p-2 sm:p-4 max-w-7xl mx-auto">
      {/* Header Section */}
      <Fade in={true} timeout={800}>
        <Card className="shadow-lg rounded-2xl overflow-hidden">
          <Box className="bg-gradient-to-r from-green-700 to-green-800 p-4 sm:p-6">
            <Box className={`flex items-center gap-3 sm:gap-4 ${isMobile ? 'flex-col sm:flex-row text-center sm:text-left' : ''}`}>
              <Box className="bg-white/10 p-2 sm:p-3 rounded-full backdrop-blur-sm">
                <DirectionsCar sx={{ color: 'white', fontSize: isMobile ? 28 : 35 }} />
              </Box>
              <Box className="flex-1">
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  component="h1" 
                  className="text-white font-bold mb-1">
                  STNK Reader Application
                </Typography>
                <Typography 
                  variant={isMobile ? "body2" : "subtitle1"} 
                  className="text-green-100 font-medium">
                  {isMobile ? 'Sistem STNK Digital' : 'Sistem Manajemen dan Pembaca STNK Digital'}
                </Typography>
              </Box>
              <Box className={`${isMobile ? 'flex' : 'hidden md:flex'} items-center gap-2`}>
                <Description sx={{ color: 'white', fontSize: isMobile ? 24 : 32 }} />
                <Verified sx={{ color: 'white', fontSize: isMobile ? 24 : 32 }} />
              </Box>
            </Box>
          </Box>
        </Card>
      </Fade>

      {/* Welcome Card */}
      <Slide direction="up" in={true} timeout={600}>
        <Card className="shadow-lg rounded-2xl">
          <CardContent className="p-4 sm:p-6">
            <Box className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center gap-4`}>
              <Avatar 
                sx={{ 
                  width: isMobile ? 60 : 80, 
                  height: isMobile ? 60 : 80,
                  bgcolor: '#166534',
                  color: 'white',
                  fontSize: isMobile ? '1.5rem' : '2rem',
                  fontWeight: 'bold',
                  alignSelf: isMobile ? 'center' : 'flex-start'
                }}>
                {getInitials(user.username)}
              </Avatar>
              
              <Box className={`flex-1 ${isMobile ? 'text-center' : ''}`}>
                <Box className={`flex items-center ${isMobile ? 'justify-center' : ''} gap-2 sm:gap-3 mb-2`}>
                  <Typography variant={isMobile ? "h6" : "h5"} className="font-bold text-gray-800">
                    {isMobile ? 'Selamat Datang!' : 'Selamat Datang Kembali!'}
                  </Typography>
                  <AccountCircle sx={{ color: '#166534', fontSize: isMobile ? 24 : 28 }} />
                </Box>
                
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  className="text-green-700 font-semibold mb-2 break-words"
                >
                  {user.name || user.userName || user.username}
                </Typography>
                
                <Box className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center ${isMobile ? '' : 'gap-3'} ${isMobile ? 'space-y-2' : 'flex-wrap'}`}>
                  <Box className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    <Chip 
                      label={getRoleDisplayName(user.role)}
                      sx={{ 
                        bgcolor: '#166534',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: isSmallMobile ? '0.75rem' : '0.875rem',
                        height: isSmallMobile ? 24 : 32
                      }}
                      size={isSmallMobile ? "small" : "medium"}
                    />
                  </Box>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    className="text-gray-600"
                  >
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
          <Box className="bg-green-50 p-3 sm:p-4 border-b border-green-200">
            <Box className="flex items-center gap-2">
              <DashboardIcon sx={{ color: '#166534', fontSize: isMobile ? 20 : 24 }} />
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                className="font-bold text-gray-800"
              >
                Dashboard {isMobile ? getRoleDisplayName(user.role).split('(')[0].trim() : getRoleDisplayName(user.role)}
              </Typography>
            </Box>
          </Box>
          
          <CardContent className="p-3 sm:p-6">
            {/* Render Komponen Sesuai Role */}
            {user.role === "superadmin" && (
              <Box className="space-y-3 sm:space-y-4">
                <Box className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Stars sx={{ color: '#166534', fontSize: isMobile ? 20 : 24 }} />
                  <Typography 
                    variant={isMobile ? "body1" : "subtitle1"} 
                    className="font-semibold text-gray-700"
                  >
                    {isMobile ? 'Super Admin Panel' : 'Super Administrator Control Panel'}
                  </Typography>
                </Box>
                <Box className="overflow-x-auto">
                  <SuperAdminDashboard />
                </Box>
              </Box>
            )}
            
            {user.role === "admin" && (
              <Box className="space-y-3 sm:space-y-4">
                <Box className="flex items-center gap-2 mb-3 sm:mb-4">
                  <AdminPanelSettings sx={{ color: '#166534', fontSize: isMobile ? 20 : 24 }} />
                  <Typography 
                    variant={isMobile ? "body1" : "subtitle1"} 
                    className="font-semibold text-gray-700"
                  >
                    {isMobile ? 'Admin Panel' : 'Administrator Panel'}
                  </Typography>
                </Box>
                <Box className="overflow-x-auto">
                  <AdminDashboard />
                </Box>
              </Box>
            )}
            
            {user.role === "cao" && (
              <Box className="space-y-3 sm:space-y-4">
                <Box className="flex items-center gap-2 mb-3 sm:mb-4">
                  <SupervisorAccount sx={{ color: '#166534', fontSize: isMobile ? 20 : 24 }} />
                  <Typography 
                    variant={isMobile ? "body1" : "subtitle1"} 
                    className="font-semibold text-gray-700"
                  >
                    {isMobile ? 'CAO Management' : 'CABANG Management'}
                  </Typography>
                </Box>
                <Box className="overflow-x-auto">
                  <CaoDashboard />
                </Box>
              </Box>
            )}
            
            {user.role === "orlap" && (
              <Box className="space-y-3 sm:space-y-4">
                <Box className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Group sx={{ color: '#166534', fontSize: isMobile ? 20 : 24 }} />
                  <Typography 
                    variant={isMobile ? "body1" : "subtitle1"} 
                    className="font-semibold text-gray-700"
                  >
                    {isMobile ? 'ORLAP Panel' : 'ORLAP Operation Panel'}
                  </Typography>
                </Box>
                <Box className="overflow-x-auto">
                  <OrlapDashboard />
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}

export default Dashboard;