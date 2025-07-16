import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, FormControl, InputLabel, Select, MenuItem,
    Button, InputAdornment, Alert, CircularProgress
  } from "@mui/material";
  import { Mail, Phone, User } from "lucide-react";
  import { useEffect, useState } from "react";
  import axios from "axios";
  import Swal from "sweetalert2";
  
  const baseUrl = import.meta.env.VITE_API_URL;
  
  const RegisterUserModal = ({ open, onClose, onSuccess }) => {
    const token = localStorage.getItem("access_token");
    const config = { headers: { Authorization: `Bearer ${token}` } };
  
    const [roles, setRoles] = useState([]);
    const [ptList, setPtList] = useState([]);
    const [brandList, setBrandList] = useState([]);
    const [samsatList, setSamsatList] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);
  
    const [form, setForm] = useState({
      username: "",
      gmail: "",
      role_id: "",
      nama_lengkap: "",
      nomor_telepon: "",
      glbm_pt_id: "",
      glbm_brand_ids: [],
      glbm_samsat_id: "",
    });
  
    const getRoleName = () => {
      const r = roles.find((r) => r.id === form.role_id);
      return r?.name || "";
    };
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    };
  
    useEffect(() => {
      if (!open) return;
  
      setForm({
        username: "",
        gmail: "",
        role_id: "",
        nama_lengkap: "",
        nomor_telepon: "",
        glbm_pt_id: "",
        glbm_brand_ids: [],
        glbm_samsat_id: "",
      });
      setErrorMsg("");
  
      axios.get(`${baseUrl}/roles`, config).then((res) => setRoles(res.data)).catch(() => {});
      axios.get(`${baseUrl}/glbm-pt`, config).then((res) => setPtList(res.data.data || [])).catch(() => {});
      axios.get(`${baseUrl}/glbm-brand`, config).then((res) => setBrandList(res.data.data || [])).catch(() => {});
      axios.get(`${baseUrl}/glbm-samsat`, config).then((res) => setSamsatList(res.data.data || [])).catch(() => {});
    }, [open]);
  
    const handleSubmit = async () => {
        setErrorMsg("");
        setLoading(true);
      
        try {
          const roleName = getRoleName();
      
          if (!form.username || !form.gmail || !form.nama_lengkap || !form.nomor_telepon || !form.role_id || !form.glbm_samsat_id) {
            throw new Error("Semua field wajib diisi");
          }
      
          if ((roleName === "superadmin" || roleName === "admin" || roleName === "cao") && form.glbm_brand_ids.length === 0) {
            throw new Error("Pilih minimal 1 brand");
          }
      
          if ((roleName === "superadmin" || roleName === "admin") && !form.glbm_pt_id) {
            throw new Error("PT harus dipilih");
          }
      
          // --- Buat payload yang konsisten ---
          const payload = {
            username: form.username,
            gmail: form.gmail,
            password: "12345678",
            role_id: parseInt(form.role_id),
            nama_lengkap: form.nama_lengkap,
            nomor_telepon: form.nomor_telepon,
            glbm_samsat_id: parseInt(form.glbm_samsat_id),
            glbm_pt_id: [parseInt(form.glbm_pt_id)],  // ✅ KIRIM SEBAGAI ARRAY
            // ✅ kirim sebagai integer
            glbm_brand_ids: form.glbm_brand_ids.map(Number), // ✅ List[int]
          };
          
      
          console.log("Payload dikirim:", payload);
      
          // --- Kirim payload ---
          await axios.post(`${baseUrl}/api/register`, payload, config);
      
          Swal.fire("Berhasil", "Akun berhasil dibuat!", "success");
          onSuccess();
          onClose();
        } catch (err) {
          const msg = err?.response?.data?.detail || err.message;
          console.error("Full error:", err.response?.data || err);
          setErrorMsg(msg);
        } finally {
          setLoading(false);
        }
      };
      
  
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Tambah Pengguna Baru</DialogTitle>
        <DialogContent dividers>
          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
  
          <TextField fullWidth margin="normal" label="Username" name="username"
            value={form.username} onChange={handleChange}
            InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} /></InputAdornment> }}
          />
  
          <TextField fullWidth margin="normal" label="Email" name="gmail"
            value={form.gmail} onChange={handleChange}
            InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} /></InputAdornment> }}
          />
  
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select name="role_id" value={form.role_id} onChange={handleChange}>
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
  
          <TextField fullWidth margin="normal" label="Nama Lengkap" name="nama_lengkap"
            value={form.nama_lengkap} onChange={handleChange}
          />
  
          <TextField fullWidth margin="normal" label="No Telepon" name="nomor_telepon"
            value={form.nomor_telepon} onChange={handleChange}
            InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} /></InputAdornment> }}
          />
  
          {getRoleName() !== "cao" && getRoleName() !== "user" && (
            <FormControl fullWidth margin="normal">
              <InputLabel>PT</InputLabel>
              <Select name="glbm_pt_id" value={form.glbm_pt_id} onChange={handleChange}>
                {ptList.map((pt) => (
                  <MenuItem key={pt.id} value={pt.id}>{pt.nama_pt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
  
          {getRoleName() !== "user" && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Brand</InputLabel>
              <Select multiple name="glbm_brand_ids" value={form.glbm_brand_ids}
                onChange={(e) => setForm({ ...form, glbm_brand_ids: e.target.value })}
              >
                {brandList.map((b) => (
                  <MenuItem key={b.id} value={b.id}>{b.nama_brand}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
  
          <FormControl fullWidth margin="normal">
            <InputLabel>Samsat</InputLabel>
            <Select name="glbm_samsat_id" value={form.glbm_samsat_id} onChange={handleChange}>
              {samsatList.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.nama_samsat} ({s.kode_samsat})</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Batal</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Daftar"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default RegisterUserModal;
  