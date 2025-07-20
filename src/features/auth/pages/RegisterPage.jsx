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

const baseUrl = import.meta.env.VITE_API_URL;

const RegisterPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [form, setForm] = useState({
    username: "",
    gmail: "",
    role_id: "",
    nama_lengkap: "",
    nomor_telepon: "",
    glbm_pt_id: "", // PT tunggal
    glbm_brand_ids: [],
    glbm_samsat_id: "",
  });

  const [roles, setRoles] = useState([]);
  const [ptList, setPtList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [samsatList, setSamsatList] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    axios.get(`${baseUrl}/roles`, config)
      .then((res) => setRoles(res.data))
      .catch(() => setRoles([]));

    axios.get(`${baseUrl}/glbm-pt`, config)
      .then((res) => setPtList(res.data.data || []))
      .catch(() => setPtList([]));

    axios.get(`${baseUrl}/glbm-brand`, config)
      .then((res) => setBrandList(res.data.data || []))
      .catch(() => setBrandList([]));

    axios.get(`${baseUrl}/glbm-samsat`, config)
      .then((res) => setSamsatList(res.data.data || []))
      .catch(() => setSamsatList([]));
  }, []);

  if (!user || (user.role !== "admin" && user.role !== "superadmin" && user.role !== "cao")) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getSelectedRoleName = () => {
    const selectedRole = roles.find((r) => r.id === form.role_id);
    return selectedRole?.name || "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const roleName = getSelectedRoleName();

      const payload = {
        username: form.username,
        gmail: form.gmail,
        password: "12345678",
        role_id: form.role_id,
        nama_lengkap: form.nama_lengkap,
        nomor_telepon: form.nomor_telepon,
        glbm_samsat_id: parseInt(form.glbm_samsat_id),
        glbm_pt_id: null,
        glbm_brand_ids: [],
      };

      if (roleName === "superadmin" || roleName === "admin") {
        if (!form.glbm_pt_id) throw new Error("PT harus dipilih");
        if (form.glbm_brand_ids.length === 0) throw new Error("Pilih minimal 1 brand");
        payload.glbm_pt_id = parseInt(form.glbm_pt_id);
        payload.glbm_brand_ids = form.glbm_brand_ids.map(Number);
      }

      if (roleName === "cao") {
        if (form.glbm_brand_ids.length === 0) throw new Error("Pilih minimal 1 brand");
        payload.glbm_pt_id = null;
        payload.glbm_brand_ids = form.glbm_brand_ids.map(Number);
      }

      await axios.post(`${baseUrl}/api/register`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Berhasil", "Akun berhasil dibuat!", "success");
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message;
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
                fullWidth required margin="normal" label="Username" name="username"
                value={form.username} onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><User size={18} /></InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth required margin="normal" label="Email" name="gmail" type="email"
                value={form.gmail} onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><Mail size={18} /></InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth margin="normal" required>
                <InputLabel id="role-label">Pilih Role</InputLabel>
                <Select
                  labelId="role-label" name="role_id" value={form.role_id}
                  label="Pilih Role" onChange={handleChange}
                  startAdornment={
                    <InputAdornment position="start"><Shield size={18} /></InputAdornment>
                  }
                >
                  {roles
                    .filter((role) => {
                      if (user.role === "admin") return role.name !== "superadmin";
                      return true;
                    })
                    .map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth required margin="normal" label="Nama Lengkap" name="nama_lengkap"
                value={form.nama_lengkap} onChange={handleChange}
              />

              <TextField
                fullWidth required margin="normal" label="Nomor Telepon" name="nomor_telepon"
                value={form.nomor_telepon} onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><Phone size={18} /></InputAdornment>
                  ),
                }}
              />

              {getSelectedRoleName() !== "cao" && getSelectedRoleName() !== "user" && (
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="pt-label">Pilih PT</InputLabel>
                  <Select
                    labelId="pt-label" name="glbm_pt_id" value={form.glbm_pt_id}
                    label="Pilih PT" onChange={handleChange}
                  >
                    {ptList.map((pt) => (
                      <MenuItem key={pt.id} value={pt.id}>{pt.nama_pt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {getSelectedRoleName() !== "user" && (
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="brand-label">Pilih Brand</InputLabel>
                  <Select
                    labelId="brand-label" name="glbm_brand_ids"
                    multiple value={form.glbm_brand_ids}
                    onChange={(e) => setForm({ ...form, glbm_brand_ids: e.target.value })}
                  >
                    {brandList.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>{brand.nama_brand}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth margin="normal" required>
                <InputLabel id="samsat-label">Pilih Samsat</InputLabel>
                <Select
                  labelId="samsat-label" name="glbm_samsat_id"
                  value={form.glbm_samsat_id} label="Pilih Samsat"
                  onChange={handleChange}
                >
                  {samsatList.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.nama_samsat} ({s.kode_samsat})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                fullWidth variant="contained" type="submit" disabled={loading}
                startIcon={<UserCheck />}
                sx={{
                  mt: 2, backgroundColor: "#065f46", textTransform: "none",
                  "&:hover": { backgroundColor: "#047857" },
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
