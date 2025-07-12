import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Alert,
  Grid,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  UserPlus,
  User,
  Shield,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import { useSelector } from "react-redux";

const RegisterPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [form, setForm] = useState({
    username: "",
    gmail: "",
    role_id: "",
    nama_lengkap: "",
    nomor_telepon: "",
  });

  const [roles, setRoles] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ⛔️ Proteksi: hanya admin/superadmin yang bisa akses
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    axios
      .get("http://127.0.0.1:8000/roles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setRoles(res.data))
      .catch((err) => {
        console.error("Gagal mengambil roles:", err);
        setRoles([]);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const payload = {
        ...form,
        password: "12345678", // ✅ Set password default di sini
      };

      await axios.post("http://127.0.0.1:8000/api/register", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire("Berhasil", "Akun berhasil dibuat!", "success");
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        JSON.stringify(err?.response?.data || err.message);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <UserPlus style={{ marginRight: 12, color: "#1e3a1c" }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Tambah Pengguna Baru
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb" }}>
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                required
                margin="normal"
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={18} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                required
                margin="normal"
                label="Email"
                name="gmail"
                type="email"
                value={form.gmail}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={18} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth margin="normal" required>
                <InputLabel id="role-label">Pilih Role</InputLabel>
                <Select
  labelId="role-label"
  name="role_id"
  value={form.role_id}
  label="Pilih Role"
  onChange={handleChange}
  startAdornment={
    <InputAdornment position="start">
      <Shield size={18} />
    </InputAdornment>
  }
>
  {roles
    .filter((role) => {
      // Jika user adalah admin, sembunyikan role superadmin
      if (user.role === "admin") return role.name.toLowerCase() !== "superadmin";
      return true; // Superadmin bisa lihat semua
    })
    .map((role) => (
      <MenuItem key={role.id} value={role.id}>
        {role.name}
      </MenuItem>
    ))}
</Select>

              </FormControl>

              <TextField
                fullWidth
                required
                margin="normal"
                label="Nama Lengkap"
                name="nama_lengkap"
                value={form.nama_lengkap}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                required
                margin="normal"
                label="Nomor Telepon"
                name="nomor_telepon"
                value={form.nomor_telepon}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone size={18} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                startIcon={<UserCheck />}
                sx={{
                  mt: 2,
                  backgroundColor: "#065f46",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#047857",
                  },
                }}
              >
                {loading ? "Memproses..." : "Daftarkan Pengguna"}
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegisterPage;
