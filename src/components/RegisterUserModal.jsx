import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Button, InputAdornment, Alert, CircularProgress, Box,
  Typography, Grid, Chip
} from "@mui/material";
import { 
  Email, 
  Phone, 
  Person, 
  Business,
  Label,
  LocationOn,
  PersonAdd,
  AdminPanelSettings,
  SupervisorAccount,
  Group,
  Stars,
  Info
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";

const baseUrl = import.meta.env.VITE_API_URL;

const RegisterUserModal = ({ open, onClose, onSuccess }) => {
  const token = localStorage.getItem("access_token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const currentUser = useSelector((state) => state.auth.user);
  const currentUserRole = currentUser?.role?.name || currentUser?.role || "";

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

  const getRoleIcon = (roleName) => {
    const iconProps = { fontSize: 'small', sx: { color: '#166534' } };
    switch (roleName?.toLowerCase()) {
      case 'superadmin':
        return <Stars {...iconProps} />;
      case 'admin':
        return <AdminPanelSettings {...iconProps} />;
      case 'cao':
        return <SupervisorAccount {...iconProps} />;
      case 'user':
        return <Group {...iconProps} />;
      default:
        return <Person {...iconProps} />;
    }
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

      const payload = {
        username: form.username,
        gmail: form.gmail,
        password: "12345678",
        role_id: parseInt(form.role_id),
        nama_lengkap: form.nama_lengkap,
        nomor_telepon: form.nomor_telepon,
        glbm_samsat_id: parseInt(form.glbm_samsat_id),
        glbm_pt_id: form.glbm_pt_id ? [parseInt(form.glbm_pt_id)] : [],
        glbm_brand_ids: form.glbm_brand_ids.map(Number),
      };

      await axios.post(`${baseUrl}/api/register`, payload, config);

      Swal.fire({
        title: "Berhasil!",
        text: "Akun berhasil dibuat!",
        icon: "success",
        confirmButtonColor: "#166534",
        confirmButtonText: "OK"
      });
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        className: "rounded-2xl",
      }}
    >
      <DialogTitle className="bg-green-50 border-b border-green-200">
        <Box className="flex items-center gap-3">
          <Box className="bg-green-100 p-2 rounded-full">
            <PersonAdd sx={{ color: '#166534', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" className="font-bold text-gray-800">
              Tambah Pengguna Baru
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Buat akun baru untuk sistem STNK Reader
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers className="p-6">
        <Box className="space-y-4">
          {errorMsg && (
            <Alert severity="error" className="rounded-xl mb-4">
              {errorMsg}
            </Alert>
          )}

          {/* Informasi Akun */}
          <Box>
            <Typography variant="subtitle1" className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Person sx={{ color: '#166534', fontSize: 18 }} />
              Informasi Akun
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  margin="normal" 
                  label="Username" 
                  name="username"
                  value={form.username} 
                  onChange={handleChange}
                  InputProps={{ 
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#166534', fontSize: 18 }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#166534',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#166534',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  margin="normal" 
                  label="Email" 
                  name="gmail"
                  value={form.gmail} 
                  onChange={handleChange}
                  InputProps={{ 
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#166534', fontSize: 18 }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#166534',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#166534',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Role */}
          <Box>
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ '&.Mui-focused': { color: '#166534' } }}>
                Role
              </InputLabel>
              <Select 
                name="role_id" 
                value={form.role_id} 
                onChange={handleChange}
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#166534',
                  },
                }}
              >
                {roles
                  .filter((r) => {
                    if (currentUserRole === "admin") {
                      return r.name === "user" || r.name === "cao";
                    }
                    return true;
                  })
                  .map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      <Box className="flex items-center gap-2">
                        {getRoleIcon(r.name)}
                        <span>{r.name}</span>
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            
            {form.role_id && (
              <Box className="mt-2">
                <Chip 
                  label={`Role dipilih: ${getRoleName()}`}
                  icon={getRoleIcon(getRoleName())}
                  sx={{ 
                    bgcolor: '#166534',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Informasi Personal */}
          <Box>
            <Typography variant="subtitle1" className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Person sx={{ color: '#166534', fontSize: 18 }} />
              Informasi Personal
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  margin="normal" 
                  label="Nama Lengkap" 
                  name="nama_lengkap"
                  value={form.nama_lengkap} 
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#166534',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#166534',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  margin="normal" 
                  label="No Telepon" 
                  name="nomor_telepon"
                  value={form.nomor_telepon} 
                  onChange={handleChange}
                  InputProps={{ 
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: '#166534', fontSize: 18 }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#166534',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#166534',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Otorisasi */}
          <Box>
            <Typography variant="subtitle1" className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Business sx={{ color: '#166534', fontSize: 18 }} />
              Otorisasi & Akses
            </Typography>
            
            <Grid container spacing={2}>
              {/* PT Field - hanya untuk superadmin dan admin */}
              {getRoleName() !== "cao" && getRoleName() !== "user" && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ '&.Mui-focused': { color: '#166534' } }}>
                      PT
                    </InputLabel>
                    <Select 
                      name="glbm_pt_id" 
                      value={form.glbm_pt_id} 
                      onChange={handleChange}
                      sx={{
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#166534',
                        },
                      }}
                    >
                      {ptList.map((pt) => (
                        <MenuItem key={pt.id} value={pt.id}>
                          <Box className="flex items-center gap-2">
                            <Business sx={{ color: '#166534', fontSize: 16 }} />
                            {pt.nama_pt}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Brand Field - tidak untuk user */}
              {getRoleName() !== "user" && (
                <Grid item xs={12} md={getRoleName() === "cao" ? 12 : 6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ '&.Mui-focused': { color: '#166534' } }}>
                      Brand {getRoleName() === "cao" ? "" : "(Multiple)"}
                    </InputLabel>
                    <Select 
                      multiple 
                      name="glbm_brand_ids" 
                      value={form.glbm_brand_ids}
                      onChange={(e) => setForm({ ...form, glbm_brand_ids: e.target.value })}
                      sx={{
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#166534',
                        },
                      }}
                    >
                      {brandList.map((b) => (
                        <MenuItem key={b.id} value={b.id}>
                          <Box className="flex items-center gap-2">
                            <Label sx={{ color: '#166534', fontSize: 16 }} />
                            {b.nama_brand}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {form.glbm_brand_ids.length > 0 && (
                    <Box className="mt-2 flex flex-wrap gap-1">
                      {form.glbm_brand_ids.map((brandId) => {
                        const brand = brandList.find(b => b.id === brandId);
                        return brand ? (
                          <Chip 
                            key={brandId}
                            label={brand.nama_brand}
                            size="small"
                            sx={{ 
                              bgcolor: '#166534',
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                          />
                        ) : null;
                      })}
                    </Box>
                  )}
                </Grid>
              )}

              {/* Samsat Field - untuk semua */}
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ '&.Mui-focused': { color: '#166534' } }}>
                    Samsat
                  </InputLabel>
                  <Select 
                    name="glbm_samsat_id" 
                    value={form.glbm_samsat_id} 
                    onChange={handleChange}
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#166534',
                      },
                    }}
                  >
                    {samsatList.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        <Box className="flex items-center gap-2">
                          <LocationOn sx={{ color: '#166534', fontSize: 16 }} />
                          <span>
                            {s.wilayah}/{s.wilayah_cakupan}/{s.nama_samsat} ({s.kode_samsat})
                          </span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Password Info */}
          <Box className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <Typography variant="body2" className="text-blue-800 font-medium flex items-center gap-2">
              <Info sx={{ color: '#1976d2', fontSize: 16 }} />
              Informasi Password
            </Typography>
            <Typography variant="body2" className="text-blue-700 mt-1">
              Password default: <strong>12345678</strong> (User dapat mengubahnya setelah login pertama)
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions className="p-6">
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: '#6b7280',
            color: '#6b7280',
            '&:hover': {
              borderColor: '#4b5563',
              bgcolor: '#f9fafb',
            },
            fontWeight: 600,
          }}
        >
          Batal
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit} 
          disabled={loading}
          sx={{
            bgcolor: '#166534',
            '&:hover': {
              bgcolor: '#0f5132',
            },
            fontWeight: 600,
            minWidth: '120px',
          }}
        >
          {loading ? (
            <Box className="flex items-center gap-2">
              <CircularProgress size={20} color="inherit" />
              <span>Menyimpan...</span>
            </Box>
          ) : (
            <Box className="flex items-center gap-2">
              <PersonAdd sx={{ fontSize: 18 }} />
              <span>Daftar</span>
            </Box>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterUserModal;