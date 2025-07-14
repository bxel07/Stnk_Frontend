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
  const [ptList, setPtList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [samsatList, setSamsatList] = useState([]);

  const [selectedPTs, setSelectedPTs] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSamsatId, setSelectedSamsatId] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    axios
      .get("http://127.0.0.1:8000/roles", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRoles(res.data))
      .catch(() => setRoles([]));

    axios
      .get("http://127.0.0.1:8000/api/glbm-pt", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data;
        setPtList(data || []);
      })
      .catch(() => setPtList([]));

    axios
      .get("http://127.0.0.1:8000/api/glbm-brand", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data;
        setBrandList(data || []);
      })
      .catch(() => setBrandList([]));

    axios
      .get("http://127.0.0.1:8000/api/glbm-samsat", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data;
        setSamsatList(data || []);
      })
      .catch(() => setSamsatList([]));
  }, []);

  const selectedRoleName = roles.find((r) => r.id === form.role_id)?.name?.toLowerCase();

  const showPTField = selectedRoleName === "admin" || selectedRoleName === "superadmin";
  const showBrandField = ["cao", "admin", "superadmin"].includes(selectedRoleName);
  const isMultiPT = selectedRoleName === "superadmin";
  const isMultiBrand = showBrandField;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!form.role_id || !selectedRoleName) {
      setErrorMsg("Silakan pilih role terlebih dahulu.");
      setLoading(false);
      return;
    }

    if (!selectedSamsatId) {
      setErrorMsg("Silakan pilih Samsat terlebih dahulu.");
      setLoading(false);
      return;
    }

    if (
      showPTField &&
      ((selectedRoleName === "superadmin" && selectedPTs.length === 0) ||
        (selectedRoleName === "admin" && selectedPTs.length !== 1))
    ) {
      setErrorMsg("Silakan pilih PT sesuai role.");
      setLoading(false);
      return;
    }

    if (
      showBrandField &&
      selectedBrands.length === 0
    ) {
      setErrorMsg("Silakan pilih Brand.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const payload = {
        username: form.username,
        gmail: form.gmail,
        password: "12345678",
        role_id: form.role_id,
        nama_lengkap: form.nama_lengkap,
        nomor_telepon: "+62" + form.nomor_telepon,
        glbm_samsat_id: Number(selectedSamsatId),
        ...(showPTField && { glbm_pt_id: Number(selectedPTs[0]) }),
        ...(showBrandField && { glbm_brand_ids: selectedBrands.map(Number) }),
      };

      await axios.post("http://127.0.0.1:8000/api/register", payload, {
        headers: { Authorization: `Bearer ${token}` },
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
                    .filter((role) =>
                      user.role === "admin"
                        ? role.name.toLowerCase() !== "superadmin"
                        : true
                    )
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
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 13) {
                    setForm({ ...form, nomor_telepon: value });
                  }
                }}
                type="tel"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ color: "#6b7280" }}>+62</Typography>
                    </InputAdornment>
                  ),
                }}
                error={form.nomor_telepon.length < 10}
                helperText={
                  form.nomor_telepon.length < 10
                    ? "Nomor minimal 10 digit setelah +62"
                    : ""
                }
              />

              {showPTField && (
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="pt-label">Pilih PT</InputLabel>
                  <Select
                    labelId="pt-label"
                    multiple={isMultiPT}
                    value={selectedPTs}
                    onChange={(e) => {
                      const value = e.target.value;
                      const parsed = Array.isArray(value)
                        ? value.map(String)
                        : [String(value)];
                      setSelectedPTs(
                        isMultiPT ? parsed : [parsed[parsed.length - 1]]
                      );
                    }}
                    renderValue={(selected) =>
                      ptList
                        .filter((pt) => selected.includes(pt.id.toString()))
                        .map((pt) => pt.nama_pt)
                        .join(", ")
                    }
                  >
                    {ptList.map((pt) => (
                      <MenuItem key={pt.id} value={pt.id.toString()}>
                        {pt.nama_pt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {showBrandField && (
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="brand-label">Pilih Brand</InputLabel>
                  <Select
                    labelId="brand-label"
                    multiple={isMultiBrand}
                    value={selectedBrands}
                    onChange={(e) => {
                      const value = e.target.value;
                      const parsed = Array.isArray(value)
                        ? value.map(String)
                        : [String(value)];
                      setSelectedBrands(
                        isMultiBrand ? parsed : [parsed[parsed.length - 1]]
                      );
                    }}
                    renderValue={(selected) =>
                      brandList
                        .filter((brand) => selected.includes(brand.id.toString()))
                        .map((brand) => brand.nama_brand)
                        .join(", ")
                    }
                  >
                    {brandList.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id.toString()}>
                        {brand.nama_brand}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth margin="normal" required>
                <InputLabel id="samsat-label">Pilih Samsat</InputLabel>
                <Select
                  labelId="samsat-label"
                  value={selectedSamsatId}
                  onChange={(e) => setSelectedSamsatId(e.target.value)}
                >
                  {samsatList.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.nama_samsat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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
