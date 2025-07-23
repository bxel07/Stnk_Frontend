import { useEffect, useState } from "react";
import {
  Typography, Box, Card, CardHeader, CardContent, Divider, Grid, Button,
  CircularProgress, Modal, TextField, Alert, Avatar, Chip, Paper,
  IconButton, InputAdornment, Fade, Slide
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
    switch (role?.toLowerCase()) {
      case 'admin': return <AdminPanelSettings sx={{ color: iconColor }} />;
      case 'supervisor': return <SupervisorAccount sx={{ color: iconColor }} />;
      case 'user': return <Group sx={{ color: iconColor }} />;
      default: return <Person sx={{ color: iconColor }} />;
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U';
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
      {/* Header */}
      <Fade in timeout={800}>
        <Card className="shadow-lg rounded-2xl overflow-hidden">
          <Box className="bg-gradient-to-r from-green-700 to-green-800 p-6 flex items-center justify-between">
            <Box className="flex items-center gap-4">
              <Avatar sx={{
                width: 80, height: 80, bgcolor: 'white', color: '#3b82f6',
                fontSize: '2rem', fontWeight: 'bold'
              }}>
                {getInitials(profile?.nama_lengkap || profile?.username)}
              </Avatar>
              <Box>
                <Typography variant="h4" className="text-white font-bold">
                  {profile?.nama_lengkap || profile?.username}
                </Typography>
                <Box className="flex items-center gap-2 mt-2">
                  {getRoleIcon(profile?.role)}
                  <Chip label={profile?.role || 'User'} sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white', fontWeight: 600
                  }} size="small" />
                </Box>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<VpnKey />}
              onClick={() => setModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-xl px-6 py-3"
              sx={{
                backdropFilter: 'blur(10px)', textTransform: 'none', fontWeight: 600
              }}>
              Ubah Password
            </Button>
          </Box>
        </Card>
      </Fade>

      {/* Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Slide in direction="right" timeout={600}>
            <Card className="shadow-lg rounded-2xl h-full">
              <CardHeader
                avatar={<PersonOutline sx={{ color: '#166534', fontSize: 28 }} />}
                title={<Typography variant="h6" className="font-bold text-gray-800">Informasi Personal</Typography>}
                className="bg-green-50"
              />
              <Divider />
              <CardContent className="space-y-4">
                <ProfileInfoCard icon={<AccountBox />} label="Nama Lengkap" value={profile?.nama_lengkap || "-"} />
                <ProfileInfoCard icon={<Person />} label="Username" value={profile?.username} />
                <ProfileInfoCard icon={<AlternateEmail />} label="Email" value={profile?.gmail} />
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        <Grid item xs={12} md={6}>
          <Slide in direction="left" timeout={600}>
            <Card className="shadow-lg rounded-2xl h-full">
              <CardHeader
                avatar={<Shield sx={{ color: '#166534', fontSize: 28 }} />}
                title={<Typography variant="h6" className="font-bold text-gray-800">Informasi Akun</Typography>}
                className="bg-green-50"/>
              <Divider />
              <CardContent className="space-y-4">
                <ProfileInfoCard icon={<PhoneIphone />} label="No. Telepon" value={profile?.nomor_telepon || "-"} />
                <ProfileInfoCard icon={getRoleIcon(profile?.role)} label="Role" value={profile?.role} />
                {profile?.created_at && (
                  <ProfileInfoCard
                    icon={<CalendarToday />}
                    label="Bergabung Sejak"
                    value={new Date(profile.created_at).toLocaleString("id-ID", {
                      year: "numeric", month: "long", day: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}/>
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
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)", width: "90%", maxWidth: 600,
            bgcolor: "white", boxShadow: 24, borderRadius: 4, overflow: 'hidden'
          }}>
            <Box className="bg-gradient-to-r from-green-700 to-green-800 p-6 flex gap-3 items-center">
              <Shield sx={{ color: 'white', fontSize: 32 }} />
              <Typography variant="h5" className="text-white font-bold">Keamanan Akun</Typography>
            </Box>

            <Box className="p-6">
              <Alert severity="info" className="mb-6 rounded-xl">
                Saat ini hanya <strong>password</strong> yang bisa diperbarui untuk menjaga keamanan akun Anda.
            </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <PasswordField
                    label="Password Baru"
                    value={password}
                    onChange={setPassword}
                    show={showPassword}
                    setShow={setShowPassword}
                    icon={<Lock />}
                    error={password.length > 0 && password.length < 8}
                    helper="Password minimal 8 karakter"/>
                </Grid>
                <Grid item xs={12}>
                  <PasswordField
                    label="Konfirmasi Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirmPassword}
                    setShow={setShowConfirmPassword}
                    icon={<Security />}
                    error={confirmPassword.length > 0 && confirmPassword !== password}
                    helper="Password tidak cocok"/>
                </Grid>
              </Grid>

              <Box className="flex justify-end gap-3 mt-6">
                <Button onClick={() => setModalOpen(false)} disabled={saving} variant="outlined">
                  Batal
                </Button>
                <Button
                  variant="contained" onClick={handleSave} disabled={saving}
                  className="bg-green-700 hover:bg-green-800 text-white"
                  startIcon={saving ? <CircularProgress size={20} /> : <VpnKey />}>
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

// Komponen Informasi Profil
const ProfileInfoCard = ({ icon, label, value }) => (
  <Paper className="bg-green-50 p-4 rounded-xl border border-gray-100 hover:shadow-md hover:scale-[1.02] transition-all duration-200">
    <Box className="flex items-start gap-3">
      <Box mt={1}>{icon}</Box>
      <Box>
        <Typography variant="subtitle2" className="text-gray-600 font-medium mb-1">{label}</Typography>
        <Typography variant="body1" className="font-semibold text-gray-800">{value || "-"}</Typography>
      </Box>
    </Box>
  </Paper>
);

// Komponen Input Password
const PasswordField = ({ label, value, onChange, show, setShow, icon, error, helper }) => (
  <TextField
    fullWidth label={label} type={show ? "text" : "password"} value={value}
    onChange={(e) => onChange(e.target.value)}
    error={error} helperText={error ? helper : ""}
    InputProps={{
      startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={() => setShow(!show)} edge="end">
            {show ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      )
    }}
    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
  />
);

export default ProfilePage;
