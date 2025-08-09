import { useEffect, useState } from "react";
import {
  Typography, Box, Card, CardHeader, CardContent, Divider, Grid, Button,
  CircularProgress, Modal, TextField, Alert, Avatar, Chip, Paper,
  IconButton, InputAdornment, Fade, Slide, useTheme, useMediaQuery
} from "@mui/material";
import {
  Person, Email, Phone, AccountBox, CalendarToday, Lock,
  Visibility, VisibilityOff, Security, Shield, VpnKey,
  AlternateEmail, PhoneIphone, PersonOutline, AdminPanelSettings,
  SupervisorAccount, Group
} from "@mui/icons-material";
import axios from "@/services/axiosInstance";
import { toast } from "react-toastify";

function ProfilePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => { fetchProfile(); }, []);
  useEffect(() => {
    if (modalOpen) {
      setPassword("");
      setConfirmPassword("");
    }
  }, [modalOpen]);

  const fetchProfile = () => {
    axios.get("/user-profile")
      .then((res) => setProfile(res.data))
      .catch(() => toast.error("Gagal memuat profil"))
      .finally(() => setLoading(false));
  };

  const handleSave = async () => {
    if (!password) return toast.info("Hanya password yang bisa diperbarui");
    if (password.length < 8) return toast.error("Password minimal 8 karakter");
    if (password !== confirmPassword) return toast.error("Password tidak cocok");

    try {
      setSaving(true);
      await axios.put("/user-profile/update", { password });
      toast.success("Password berhasil diperbarui");
      setModalOpen(false);
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Gagal memperbarui password");
    } finally {
      setSaving(false);
    }
  };

  const getRoleIcon = (role) => {
    const iconColor = '#166534';
    const iconSize = isSmallMobile ? 20 : 24;
    switch (role?.toLowerCase()) {
      case 'admin': return <AdminPanelSettings sx={{ color: iconColor, fontSize: iconSize }} />;
      case 'supervisor': return <SupervisorAccount sx={{ color: iconColor, fontSize: iconSize }} />;
      case 'user': return <Group sx={{ color: iconColor, fontSize: iconSize }} />;
      default: return <Person sx={{ color: iconColor, fontSize: iconSize }} />;
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-16 px-4">
        <Paper elevation={3} className="p-8 rounded-2xl w-full max-w-sm">
          <Box className="flex flex-col items-center">
            <CircularProgress size={40} sx={{ color: '#166534' }} />
            <Typography className="mt-4 text-gray-600 font-medium text-center">
              Memuat profil...
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="space-y-6 p-2 sm:p-4 max-w-6xl mx-auto">
      {/* Header */}
      <Fade in timeout={800}>
        <Card className="shadow-lg rounded-2xl overflow-hidden">
          <Box className="bg-gradient-to-r from-green-700 to-green-800 p-4 sm:p-6">
            <Box className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center ${isMobile ? 'text-center' : 'justify-between'} gap-4`}>
              <Box className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center gap-4`}>
                <Avatar sx={{
                  width: isMobile ? 60 : 80, 
                  height: isMobile ? 60 : 80, 
                  bgcolor: 'white', 
                  color: '#3b82f6',
                  fontSize: isMobile ? '1.5rem' : '2rem', 
                  fontWeight: 'bold'
                }}>
                  {getInitials(profile?.nama_lengkap || profile?.username)}
                </Avatar>
                <Box className={isMobile ? 'text-center' : ''}>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    className="text-white font-bold break-words"
                  >
                    {profile?.nama_lengkap || profile?.username}
                  </Typography>
                  <Box className={`flex items-center gap-2 mt-2 ${isMobile ? 'justify-center' : ''}`}>
                    {getRoleIcon(profile?.role)}
                    <Chip 
                      label={profile?.role || 'User'} 
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white', 
                        fontWeight: 600,
                        fontSize: isSmallMobile ? '0.75rem' : '0.875rem'
                      }} 
                      size="small" 
                    />
                  </Box>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<VpnKey sx={{ fontSize: isSmallMobile ? 16 : 20 }} />}
                onClick={() => setModalOpen(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl"
                sx={{
                  backdropFilter: 'blur(10px)', 
                  textTransform: 'none', 
                  fontWeight: 600,
                  px: isSmallMobile ? 2 : 3,
                  py: isSmallMobile ? 1 : 1.5,
                  fontSize: isSmallMobile ? '0.75rem' : '0.875rem',
                  minWidth: isSmallMobile ? 'auto' : '140px'
                }}
              >
                {isSmallMobile ? 'Ubah' : 'Ubah Password'}
              </Button>
            </Box>
          </Box>
        </Card>
      </Fade>

      {/* Content */}
      <Grid container spacing={2} sx={{ margin: 0, width: '100%' }}>
        <Grid item xs={12} lg={6} sx={{ paddingLeft: '0 !important' }}>
          <Slide in direction="right" timeout={600}>
            <Card className="shadow-lg rounded-2xl h-full">
              <CardHeader
                avatar={<PersonOutline sx={{ color: '#166534', fontSize: isMobile ? 24 : 28 }} />}
                title={
                  <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    className="font-bold text-gray-800"
                  >
                    Informasi Personal
                  </Typography>
                }
                className="bg-green-50"
                sx={{ pb: 1 }}
              />
              <Divider />
              <CardContent className="space-y-3 sm:space-y-4" sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <ProfileInfoCard 
                  icon={<AccountBox sx={{ fontSize: isMobile ? 20 : 24 }} />} 
                  label="Nama Lengkap" 
                  value={profile?.nama_lengkap || "-"} 
                  isMobile={isMobile}
                />
                <ProfileInfoCard 
                  icon={<Person sx={{ fontSize: isMobile ? 20 : 24 }} />} 
                  label="Username" 
                  value={profile?.username} 
                  isMobile={isMobile}
                />
                <ProfileInfoCard 
                  icon={<AlternateEmail sx={{ fontSize: isMobile ? 20 : 24 }} />} 
                  label="Email" 
                  value={profile?.gmail} 
                  isMobile={isMobile}
                />
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        <Grid item xs={12} lg={6} sx={{ paddingLeft: '0 !important' }}>
          <Slide in direction="left" timeout={600}>
            <Card className="shadow-lg rounded-2xl h-full">
              <CardHeader
                avatar={<Shield sx={{ color: '#166534', fontSize: isMobile ? 24 : 28 }} />}
                title={
                  <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    className="font-bold text-gray-800"
                  >
                    Informasi Akun
                  </Typography>
                }
                className="bg-green-50"
                sx={{ pb: 1 }}
              />
              <Divider />
              <CardContent className="space-y-3 sm:space-y-4" sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <ProfileInfoCard 
                  icon={<PhoneIphone sx={{ fontSize: isMobile ? 20 : 24 }} />} 
                  label="No. Telepon" 
                  value={profile?.nomor_telepon || "-"} 
                  isMobile={isMobile}
                />
                <ProfileInfoCard 
                  icon={getRoleIcon(profile?.role)} 
                  label="Role" 
                  value={profile?.role} 
                  isMobile={isMobile}
                />
                {profile?.created_at && (
                  <ProfileInfoCard
                    icon={<CalendarToday sx={{ fontSize: isMobile ? 20 : 24 }} />}
                    label="Bergabung Sejak"
                    value={new Date(profile.created_at).toLocaleString("id-ID", {
                      year: "numeric", month: "long", day: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}
                    isMobile={isMobile}
                  />
                )}
              </CardContent>
            </Card>
          </Slide>
        </Grid>
      </Grid>

      {/* Modal Ubah Password */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} closeAfterTransition>
        <Fade in={modalOpen}>
          <Box sx={{
            position: "absolute", 
            top: "50%", 
            left: "50%",
            transform: "translate(-50%, -50%)", 
            width: "95%", 
            maxWidth: isMobile ? 400 : 600,
            bgcolor: "white", 
            boxShadow: 24, 
            borderRadius: 4, 
            overflow: 'hidden',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <Box className="bg-gradient-to-r from-green-700 to-green-800 p-4 sm:p-6 flex gap-3 items-center">
              <Shield sx={{ color: 'white', fontSize: isMobile ? 24 : 32 }} />
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                className="text-white font-bold"
              >
                Keamanan Akun
              </Typography>
            </Box>

            <Box className="p-4 sm:p-6">
              <Alert severity="info" className="mb-4 sm:mb-6 rounded-xl">
                Saat ini hanya <strong>password</strong> yang bisa diperbarui untuk menjaga keamanan akun Anda.
              </Alert>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <PasswordField
                    label="Password Baru"
                    value={password}
                    onChange={setPassword}
                    show={showPassword}
                    setShow={setShowPassword}
                    icon={<Lock sx={{ fontSize: isMobile ? 20 : 24 }} />}
                    error={password.length > 0 && password.length < 8}
                    helper="Password minimal 8 karakter"
                    isMobile={isMobile}
                  />
                </Grid>
                <Grid item xs={12}>
                  <PasswordField
                    label="Konfirmasi Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirmPassword}
                    setShow={setShowConfirmPassword}
                    icon={<Security sx={{ fontSize: isMobile ? 20 : 24 }} />}
                    error={confirmPassword.length > 0 && confirmPassword !== password}
                    helper="Password tidak cocok"
                    isMobile={isMobile}
                  />
                </Grid>
              </Grid>

              <Box className={`flex ${isMobile ? 'flex-col' : 'flex-row'} ${isMobile ? 'gap-2' : 'justify-end gap-3'}`}>
                <Button 
                  onClick={() => setModalOpen(false)} 
                  disabled={saving} 
                  variant="outlined"
                  fullWidth={isMobile}
                  sx={{ order: isMobile ? 2 : 1 }}
                >
                  Batal
                </Button>
                <Button
                  variant="contained" 
                  onClick={handleSave} 
                  disabled={saving}
                  className="bg-green-700 hover:bg-green-800 text-white"
                  startIcon={saving ? <CircularProgress size={16} /> : <VpnKey sx={{ fontSize: 16 }} />}
                  fullWidth={isMobile}
                  sx={{ order: isMobile ? 1 : 2 }}
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

// Komponen Informasi Profil - Updated with mobile responsiveness
const ProfileInfoCard = ({ icon, label, value, isMobile }) => (
  <Paper className="bg-green-50 p-3 sm:p-4 rounded-xl border border-gray-100 hover:shadow-md hover:scale-[1.02] transition-all duration-200">
    <Box className="flex items-start gap-2 sm:gap-3">
      <Box mt={0.5}>{icon}</Box>
      <Box className="min-w-0 flex-1">
        <Typography 
          variant={isMobile ? "caption" : "subtitle2"} 
          className="text-gray-600 font-medium mb-1"
        >
          {label}
        </Typography>
        <Typography 
          variant={isMobile ? "body2" : "body1"} 
          className="font-semibold text-gray-800 break-words"
        >
          {value || "-"}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

// Komponen Input Password - Updated with mobile responsiveness
const PasswordField = ({ label, value, onChange, show, setShow, icon, error, helper, isMobile }) => (
  <TextField
    fullWidth 
    label={label} 
    type={show ? "text" : "password"} 
    value={value}
    onChange={(e) => onChange(e.target.value)}
    error={error} 
    helperText={error ? helper : ""}
    size={isMobile ? "small" : "medium"}
    InputProps={{
      startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={() => setShow(!show)} edge="end" size={isMobile ? "small" : "medium"}>
            {show ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      )
    }}
    sx={{ 
      '& .MuiOutlinedInput-root': { 
        borderRadius: '12px',
        fontSize: isMobile ? '0.875rem' : '1rem'
      },
      '& .MuiInputLabel-root': {
        fontSize: isMobile ? '0.875rem' : '1rem'
      }
    }}
  />
);

export default ProfilePage;