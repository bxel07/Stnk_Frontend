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
} from "@mui/material";
import axios from "@/services/axiosInstance";
import { toast } from "react-toastify";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    axios
      .get("/user-profile")
      .then((res) => {
        console.log("✅ Data Profil:", res.data); // Log data profil
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

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
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

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-12">
        <CircularProgress size={30} />
        <Typography className="ml-3 text-gray-600">Memuat profil...</Typography>
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      {/* Profil Card */}
      <Card className="shadow-md">
        <CardHeader
          title={
            <Box className="flex justify-between items-center">
              <Box className="flex items-center gap-2">
                <i className="bi bi-person-circle text-xl text-gray-600"></i>
                <Typography variant="h6" className="font-semibold">
                  Profil Saya
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setModalOpen(true)}
                className="rounded-lg"
              >
                <i className="bi bi-gear-fill mr-1"></i>Edit Password
              </Button>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ProfileInfo label="Nama Lengkap" value={profile.nama_lengkap ?? "-"} />
              <ProfileInfo label="Username" value={profile.username} />
              <ProfileInfo label="Email" value={profile.gmail} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ProfileInfo label="No. Telepon" value={profile.nomor_telepon ?? "-"} />
              <ProfileInfo label="Role" value={profile.role} />
              {profile.created_at && (
                <ProfileInfo
                  label="Bergabung Sejak"
                  value={new Date(profile.created_at).toLocaleString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Modal Edit Password */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
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
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" className="mb-4">
            <i className="bi bi-lock-fill mr-2 text-blue-600"></i>
            Ganti Password
          </Typography>

          <Alert severity="info" className="mb-4">
            Saat ini hanya <strong>password</strong> yang bisa diperbarui.
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Password Baru"
                type="password"
                fullWidth
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Konfirmasi Password"
                type="password"
                fullWidth
                size="small"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={password && confirmPassword && password !== confirmPassword}
                helperText={
                  password &&
                  confirmPassword &&
                  password !== confirmPassword &&
                  "Password tidak cocok"
                }
              />
            </Grid>
          </Grid>

          <Box className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setModalOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button
              variant="contained"
              className="bg-blue-600 text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

const ProfileInfo = ({ label, value }) => (
  <Box className="mb-4 bg-gray-50 p-4 rounded-lg">
    <Typography variant="subtitle2" className="text-gray-500 mb-1">
      {label}
    </Typography>
    <Typography variant="body1" className="font-medium">
      {value || "-"}
    </Typography>
  </Box>
);

export default ProfilePage;
