import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Grid,
  Button,
  CircularProgress,
  Modal,
  TextField,
  Alert,
  Avatar,
  Chip,
  Paper,
  IconButton,
  InputAdornment,
  Fade,
  Slide,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  AccountCircle,
  CalendarToday,
  Edit,
  Lock,
  Visibility,
  VisibilityOff,
  Security,
  Badge,
  Info,
  Save,
  Cancel,
  PersonOutline,
  AlternateEmail,
  PhoneIphone,
  AdminPanelSettings,
  SupervisorAccount,
  Group,
  AccountBox,
  Settings,
  VpnKey,
  Shield,
} from "@mui/icons-material";
import axios from "@/services/axiosInstance";
import { toast } from "react-toastify";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    axios
      .get("/user-profile")
      .then((res) => {
        console.log("✅ Data Profil:", res.data);
        setProfile(res.data);
      })
      .catch(() => toast.error("Gagal memuat profil"))
      .finally(() => setLoading(false));
  };

  const handleSave = async () => {
    if (!password) {
      toast.info("Hanya password yang bisa diperbarui");
      return;
    }

    if (password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }

    try {
      setSaving(true);
      await axios.put("/user-profile/update", { password });
      toast.success("Password berhasil diperbarui");
      setModalOpen(false);
      fetchProfile();
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Gagal memperbarui password");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (modalOpen) {
      setPassword("");
      setConfirmPassword("");
    }
  }, [modalOpen]);

  const getRoleIcon = (role) => {
    const iconColor = '#166534'; // Hijau tua untuk semua role
    switch (role?.toLowerCase()) {
      case 'admin':
        return <AdminPanelSettings sx={{ color: iconColor }} />;
      case 'supervisor':
        return <SupervisorAccount sx={{ color: iconColor }} />;
      case 'user':
        return <Group sx={{ color: iconColor }} />;
      default:
        return <Person sx={{ color: iconColor }} />;
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'supervisor':
        return 'warning';
      case 'user':
        return 'primary';
      default:
        return 'default';
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
              Memuat profil...
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="space-y-6 p-4">
      {/* Header Profile Card */}
      <Fade in={true} timeout={800}>
        <Card className="shadow-lg rounded-2xl overflow-hidden">
          <Box className="bg-gradient-to-r from-green-700 to-green-800 p-6">
            <Box className="flex items-center justify-between">
              <Box className="flex items-center gap-4">
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80,
                    bgcolor: 'white',
                    color: '#3b82f6',
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {getInitials(profile?.nama_lengkap || profile?.username)}
                </Avatar>
                <Box>
                  <Typography variant="h4" className="text-white font-bold">
                    {profile?.nama_lengkap || profile?.username}
                  </Typography>
                  <Box className="flex items-center gap-2 mt-2">
                    {getRoleIcon(profile?.role)}
                    <Chip 
                      label={profile?.role || 'User'}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        fontWeight: 600 
                      }}
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<VpnKey />}
                onClick={() => setModalOpen(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl px-6 py-3"
                sx={{ 
                  backdropFilter: 'blur(10px)',
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Ubah Password
              </Button>
            </Box>
          </Box>
        </Card>
      </Fade>

      {/* Profile Information Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Slide direction="right" in={true} timeout={600}>
            <Card className="shadow-lg rounded-2xl h-full">
              <CardHeader
                avatar={<PersonOutline sx={{ color: '#166534', fontSize: 28 }} />}
                title={
                  <Typography variant="h6" className="font-bold text-gray-800">
                    Informasi Personal
                  </Typography>
                }
                className="bg-green-50"
              />
              <Divider />
              <CardContent className="space-y-4">
                <ProfileInfoCard 
                  icon={<AccountBox sx={{ color: '#166534' }} />}
                  label="Nama Lengkap" 
                  value={profile?.nama_lengkap || "-"}
                  bgColor="bg-green-50"
                />
                <ProfileInfoCard 
                  icon={<Person sx={{ color: '#166534' }} />}
                  label="Username" 
                  value={profile?.username}
                  bgColor="bg-green-50"
                />
                <ProfileInfoCard 
                  icon={<AlternateEmail sx={{ color: '#166534' }} />}
                  label="Email" 
                  value={profile?.gmail}
                  bgColor="bg-green-50"
                />
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        <Grid item xs={12} md={6}>
          <Slide direction="left" in={true} timeout={600}>
            <Card className="shadow-lg rounded-2xl h-full">
              <CardHeader
                avatar={<Settings sx={{ color: '#166534', fontSize: 28 }} />}
                title={
                  <Typography variant="h6" className="font-bold text-gray-800">
                    Informasi Akun
                  </Typography>
                }
                className="bg-green-50"
              />
              <Divider />
              <CardContent className="space-y-4">
                <ProfileInfoCard 
                  icon={<PhoneIphone sx={{ color: '#166534' }} />}
                  label="No. Telepon" 
                  value={profile?.nomor_telepon || "-"}
                  bgColor="bg-green-50"
                />
                <ProfileInfoCard 
                  icon={getRoleIcon(profile?.role)}
                  label="Role" 
                  value={profile?.role}
                  bgColor="bg-green-50"
                />
                {profile?.created_at && (
                  <ProfileInfoCard 
                    icon={<CalendarToday sx={{ color: '#166534' }} />}
                    label="Bergabung Sejak" 
                    value={new Date(profile.created_at).toLocaleString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    bgColor="bg-green-50"
                  />
                )}
              </CardContent>
            </Card>
          </Slide>
        </Grid>
      </Grid>

      {/* Modal Edit Password */}
      <Modal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        closeAfterTransition
      >
        <Fade in={modalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 600,
              bgcolor: "white",
              boxShadow: 24,
              borderRadius: 4,
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <Box className="bg-gradient-to-r from-green-700 to-green-800 p-6">
              <Box className="flex items-center gap-3">
                <Shield sx={{ color: 'white', fontSize: 32 }} />
                <Typography variant="h5" className="text-white font-bold">
                  Keamanan Akun
                </Typography>
              </Box>
            </Box>

            <Box className="p-6">
              <Alert 
                severity="info" 
                icon={<Info />}
                className="mb-6 rounded-xl"
                sx={{ 
                  '& .MuiAlert-message': { 
                    fontWeight: 500 
                  }
                }}
              >
                Saat ini hanya <strong>password</strong> yang bisa diperbarui untuk menjaga keamanan akun Anda.
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Password Baru"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={password.length > 0 && password.length < 8}
                    helperText={
                      password.length > 0 && password.length < 8
                        ? "Password minimal 8 karakter"
                        : ""
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#166534' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            onClick={() => setShowPassword((prev) => !prev)} 
                            edge="end"
                            sx={{ color: '#166534' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Konfirmasi Password"
                    type={showConfirmPassword ? "text" : "password"}
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={confirmPassword.length > 0 && confirmPassword !== password}
                    helperText={
                      confirmPassword.length > 0 && confirmPassword !== password
                        ? "Password tidak cocok"
                        : ""
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Security sx={{ color: '#6b7280' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            onClick={() => setShowConfirmPassword((prev) => !prev)} 
                            edge="end"
                            sx={{ color: '#6b7280' }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />
                </Grid>
              </Grid>

              <Box className="flex justify-end gap-3 mt-6">
                <Button 
                  onClick={() => setModalOpen(false)} 
                  disabled={saving}
                  startIcon={<Cancel />}
                  variant="outlined"
                  className="rounded-xl px-6 py-3"
                  sx={{ textTransform: 'none' }}
                >
                  Batal
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  className="bg-green-700 hover:bg-green-800 text-white rounded-xl px-6 py-3"
                  sx={{ textTransform: 'none' }}
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}

const ProfileInfoCard = ({ icon, label, value, bgColor }) => (
  <Paper 
    elevation={0} 
    className={`${bgColor} p-4 rounded-xl border border-gray-100 transition-all duration-200 hover:shadow-md hover:scale-[1.02]`}
  >
    <Box className="flex items-start gap-3">
      <Box className="mt-1">
        {icon}
      </Box>
      <Box className="flex-1">
        <Typography variant="subtitle2" className="text-gray-600 font-medium mb-1">
          {label}
        </Typography>
        <Typography variant="body1" className="font-semibold text-gray-800">
          {value || "-"}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

export default ProfilePage;