import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Button, InputAdornment, Alert, CircularProgress, Box,
  Typography, Grid, Chip, Checkbox, Autocomplete,
  Accordion, AccordionSummary, AccordionDetails,
  FormControlLabel, IconButton
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
  Info,
  ExpandMore,
  SelectAll,
  Search,
  Clear
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import Popper from '@mui/material/Popper';

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
  const [samsatSearchQuery, setSamsatSearchQuery] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    gmail: "",
    role_id: "",
    nama_lengkap: "",
    nomor_telepon: "",
    glbm_pt_id: [],        
    glbm_brand_ids: [],      
    glbm_samsat_id: [],
  });

  // Filter Samsat berdasarkan search query
  const filteredSamsatList = samsatList.filter(samsat => {
    if (!samsatSearchQuery) return true;
    
    const query = samsatSearchQuery.toLowerCase();
    return (
      samsat.nama_samsat?.toLowerCase().includes(query) ||
      samsat.kode_samsat?.toLowerCase().includes(query) ||
      samsat.wilayah?.toLowerCase().includes(query) ||
      samsat.wilayah_cakupan?.toLowerCase().includes(query)
    );
  });

  // Group filtered Samsat by wilayah_cakupan
  const groupedSamsat = filteredSamsatList.reduce((groups, samsat) => {
    const region = samsat.wilayah_cakupan || samsat.wilayah;
    if (!groups[region]) {
      groups[region] = [];
    }
    groups[region].push(samsat);
    return groups;
  }, {});

  const getRoleName = () => {
    const r = roles.find((r) => r.id === form.role_id);
    return r?.name || "";
  };

  const getRoleIcon = (roleName) => {
    const iconProps = { fontSize: "small", sx: { color: "#166534" } };
    switch (roleName?.toLowerCase()) {
      case "superadmin":
        return <Stars {...iconProps} />;
      case "admin":
        return <AdminPanelSettings {...iconProps} />;
      case "cao":
        return <SupervisorAccount {...iconProps} />;
      case "user":
        return <Group {...iconProps} />;
      default:
        return <Person {...iconProps} />;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Select All for a specific region
  const handleSelectAllRegion = (region, isChecked) => {
    const regionSamsatIds = groupedSamsat[region]?.map(s => s.id) || [];
    
    setForm((prev) => {
      let newSamsatIds = [...prev.glbm_samsat_id];
      
      if (isChecked) {
        // Add all region samsat IDs that aren't already selected
        regionSamsatIds.forEach(id => {
          if (!newSamsatIds.includes(id)) {
            newSamsatIds.push(id);
          }
        });
      } else {
        // Remove all region samsat IDs
        newSamsatIds = newSamsatIds.filter(id => !regionSamsatIds.includes(id));
      }
      
      return {
        ...prev,
        glbm_samsat_id: newSamsatIds
      };
    });
  };

  // Check if all samsat in a region are selected (considering filtered results)
  const isRegionFullySelected = (region) => {
    const regionSamsatIds = groupedSamsat[region]?.map(s => s.id) || [];
    return regionSamsatIds.length > 0 && regionSamsatIds.every(id => form.glbm_samsat_id.includes(id));
  };

  // Check if some (but not all) samsat in a region are selected (considering filtered results)
  const isRegionPartiallySelected = (region) => {
    const regionSamsatIds = groupedSamsat[region]?.map(s => s.id) || [];
    const selectedCount = regionSamsatIds.filter(id => form.glbm_samsat_id.includes(id)).length;
    return selectedCount > 0 && selectedCount < regionSamsatIds.length;
  };

  // Clear search
  const handleClearSearch = () => {
    setSamsatSearchQuery("");
  };

  useEffect(() => {
    if (!open) return;

    setForm({
      username: "",
      gmail: "",
      role_id: "",
      nama_lengkap: "",
      nomor_telepon: "",
      glbm_pt_id: [],
      glbm_brand_ids: [],
      glbm_samsat_id: [],
    });
    setErrorMsg("");
    setSamsatSearchQuery("");

    Promise.all([
      axios.get(`${baseUrl}/roles`, config),
      axios.get(`${baseUrl}/glbm-pt`, config),
      axios.get(`${baseUrl}/glbm-brand`, config),
      axios.get(`${baseUrl}/glbm-samsat`, config),
    ])
      .then(([rolesRes, ptRes, brandRes, samsatRes]) => {
        setRoles(rolesRes.data || []);
        setPtList(ptRes.data.data || []);
        setBrandList(brandRes.data.data || []);
        setSamsatList(samsatRes.data.data || []);
      })
      .catch((err) => {
        console.error("Fetch options error", err);
        setErrorMsg("Gagal memuat opsi, coba lagi.");
      });
  }, [open]);

  const handleSubmit = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      const roleName = getRoleName();
      if (
        !form.username ||
        !form.gmail ||
        !form.nama_lengkap ||
        !form.nomor_telepon ||
        !form.role_id ||
        !form.glbm_samsat_id.length
      ) {
        throw new Error("Semua field wajib diisi");
      }
     if (["superadmin", "admin"].includes(roleName) && form.glbm_pt_id.length === 0) {
        throw new Error("PT harus dipilih");
      }
      if (roleName === "admin" && form.glbm_pt_id.length !== 1) {
        throw new Error("Admin hanya boleh memilih 1 PT");
      }
      if (["superadmin", "admin", "cao"].includes(roleName) && form.glbm_brand_ids.length === 0) {
        throw new Error("Pilih minimal 1 brand");
      }
      if (roleName === "cao" && form.glbm_brand_ids.length !== 1) {
        throw new Error("CAO hanya boleh memilih 1 brand");
      }
      if (!form.glbm_samsat_id || form.glbm_samsat_id.length === 0) {
        throw new Error("Pilih minimal satu Samsat");
      }
      
      const payload = {
        username: form.username,
        gmail: form.gmail,
        password: "12345678",
        role_id: Number(form.role_id),
        nama_lengkap: form.nama_lengkap,
        nomor_telepon: form.nomor_telepon,
        glbm_samsat_id: form.glbm_samsat_id.map(Number),
        glbm_pt_id: form.glbm_pt_id.map(Number),
        glbm_brand_ids: form.glbm_brand_ids.map(Number),
      };
      
      await axios.post(`${baseUrl}/api/register`, payload, config);
      Swal.fire({
        title: "Berhasil!",
        text: "Akun berhasil dibuat!",
        icon: "success",
        confirmButtonColor: "#166534",
      });
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message;
      console.error("Submit error", err);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputFocusStyles = {
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": { borderColor: "#166534" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#166534" },
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ className: "rounded-2xl" }}>
      {/* Header */}
      <DialogTitle className="bg-green-50 border-b border-green-200">
        <Box className="flex items-center gap-3">
          <Box className="bg-green-100 p-2 rounded-full">
            <PersonAdd sx={{ color: "#166534", fontSize: 24 }} />
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

      {/* Body */}
      <DialogContent dividers className="p-6">
        <Box className="space-y-4">
          {/* error */}
          {errorMsg && (
            <Alert severity="error" className="rounded-xl mb-4">
              {errorMsg}
            </Alert>
          )}

          {/* ==== Informasi Akun =================================== */}
          <Box>
            <Typography variant="subtitle1" className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Person sx={{ color: "#166534", fontSize: 18 }} /> Informasi Akun
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
                        <Person sx={{ color: "#166534", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputFocusStyles}
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
                        <Email sx={{ color: "#166534", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputFocusStyles}
                />
              </Grid>
            </Grid>
          </Box>

          {/* ==== Role ============================================ */}
          <Box>
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ "&.Mui-focused": { color: "#166534" } }}>Role</InputLabel>
              <Select
                name="role_id"
                value={form.role_id}
                onChange={handleChange}
                sx={{ "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#166534" } }}
              >
                {roles
                  .filter((r) => (currentUserRole === "admin" ? ["user", "cao"].includes(r.name) : true))
                  .map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      <Box className="flex items-center gap-2">
                        {getRoleIcon(r.name)} <span>{r.name}</span>
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
                  sx={{ bgcolor: "#166534", color: "white", fontWeight: 600 }}
                />
              </Box>
            )}
          </Box>

          {/* ==== Informasi Personal ============================== */}
          <Box>
            <Typography variant="subtitle1" className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Person sx={{ color: "#166534", fontSize: 18 }} /> Informasi Personal
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
                  sx={inputFocusStyles}
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
                        <Phone sx={{ color: "#166534", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputFocusStyles}
                />
              </Grid>
            </Grid>
          </Box>

          {/* ==== Otorisasi & Akses =============================== */}
          <Box>
            <Typography variant="subtitle1" className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Business sx={{ color: "#166534", fontSize: 18 }} /> Otorisasi & Akses
            </Typography>
            <Grid container spacing={2}>
              {/* PT */}
              {["superadmin", "admin"].includes(getRoleName()) && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ "&.Mui-focused": { color: "#166534" } }}>
                      PT {getRoleName() === "superadmin" ? "(Multiple)" : ""}
                    </InputLabel>
                    <Select
                      name="glbm_pt_id"
                      multiple={getRoleName() === "superadmin"}
                      value={
                        getRoleName() === "superadmin"
                          ? form.glbm_pt_id
                          : form.glbm_pt_id[0] || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          glbm_pt_id:
                            getRoleName() === "superadmin" ? value : [value],
                        }));
                      }}
                      sx={{ "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#166534" } }}
                    >
                      {ptList.map((pt) => (
                        <MenuItem key={pt.id} value={pt.id}>
                          <Box className="flex items-center gap-2">
                            <Business sx={{ color: "#166534", fontSize: 16 }} /> {pt.nama_pt}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Chips Superadmin */}
                  {getRoleName() === "superadmin" && form.glbm_pt_id.length > 0 && (
                    <Box className="mt-2 flex flex-wrap gap-1">
                      {form.glbm_pt_id.map((ptId) => {
                        const pt = ptList.find((p) => p.id === ptId);
                        return pt ? (
                          <Chip
                            key={ptId}
                            label={pt.nama_pt}
                            size="small"
                            sx={{ bgcolor: "#166534", color: "white", fontSize: "0.75rem" }}
                          />
                        ) : null;
                      })}
                    </Box>
                  )}
                </Grid>
              )}

              {/* Brand */}
              {["superadmin", "admin", "cao"].includes(getRoleName()) && (
                <Grid item xs={12} md={getRoleName() === "cao" ? 12 : 6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel sx={{ "&.Mui-focused": { color: "#166534" } }}>
                      Brand {getRoleName() === "cao" ? "" : "(Multiple)"}
                    </InputLabel>
                    <Select
                      name="glbm_brand_ids"
                      multiple={getRoleName() !== "cao"}
                      value={
                        getRoleName() === "cao"
                          ? form.glbm_brand_ids[0] || ""
                          : form.glbm_brand_ids
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          glbm_brand_ids:
                            getRoleName() === "cao" ? [value] : value,
                        }));
                      }}
                      sx={{
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#166534",
                        },
                      }}
                      >
                      {brandList.map((b) => (
                        <MenuItem key={b.id} value={b.id}>
                          <Box className="flex items-center gap-2">
                            <Label sx={{ color: "#166534", fontSize: 16 }} /> {b.nama_brand}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Brand Chips */}
                  {form.glbm_brand_ids.length > 0 && (
                    <Box className="mt-2 flex flex-wrap gap-1">
                      {form.glbm_brand_ids.map((brandId) => {
                        const brand = brandList.find((b) => b.id === brandId);
                        return brand ? (
                          <Chip
                            key={brandId}
                            label={brand.nama_brand}
                            size="small"
                            sx={{ bgcolor: "#166534", color: "white", fontSize: "0.75rem" }}
                          />
                        ) : null;
                      })}
                    </Box>
                  )}
                </Grid>
              )}

              {/* Enhanced Samsat Selection with Search and Select All by Region */}
              <Grid item xs={12}>
                <Box className="border border-gray-300 rounded-lg p-4">
                  <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <LocationOn sx={{ color: "#166534", fontSize: 18 }} /> Pilih Samsat (Berdasarkan Wilayah Cakupan)
                  </Typography>
                  
                  {/* Search Samsat */}
                  <Box className="mb-4">
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Cari berdasarkan nama samsat, kode, atau wilayah..."
                      value={samsatSearchQuery}
                      onChange={(e) => setSamsatSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ color: "#166534", fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        endAdornment: samsatSearchQuery && (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={handleClearSearch}
                              sx={{ color: "#666" }}
                            >
                              <Clear sx={{ fontSize: 18 }} />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#166534',
                          },
                        },
                        bgcolor: '#f9fafb',
                      }}
                    />
                  </Box>

                  {/* Display selected count and search results */}
                  <Box className="mb-3">
                    <Typography variant="body2" className="text-gray-600">
                      Dipilih: {form.glbm_samsat_id.length} dari {samsatList.length} Samsat
                      {samsatSearchQuery && (
                        <span className="ml-2 text-blue-600">
                          • Ditemukan: {filteredSamsatList.length} hasil
                        </span>
                      )}
                    </Typography>
                  </Box>

                  {/* Show message if no search results */}
                  {samsatSearchQuery && filteredSamsatList.length === 0 && (
                    <Box className="text-center py-8">
                      <Typography variant="body2" className="text-gray-500">
                        Tidak ada Samsat yang ditemukan untuk "{samsatSearchQuery}"
                      </Typography>
                      <Button
                        size="small"
                        onClick={handleClearSearch}
                        sx={{ mt: 1, color: '#166534' }}
                      >
                        Hapus pencarian
                      </Button>
                    </Box>
                  )}

                  {/* Accordion for each wilayah_cakupan (filtered) */}
                  {Object.keys(groupedSamsat).sort().map((region) => {
                    const isFullySelected = isRegionFullySelected(region);
                    const isPartiallySelected = isRegionPartiallySelected(region);
                    const samsatInRegion = groupedSamsat[region];
                    
                    return (
                      <Accordion key={region} sx={{ mb: 1 }}>
                        <AccordionSummary
                          expandIcon={<ExpandMore />}
                          sx={{
                            bgcolor: isFullySelected ? "#f0f9ff" : isPartiallySelected ? "#fffbeb" : "#f9fafb",
                            borderRadius: "8px",
                            "&:hover": { bgcolor: "#f3f4f6" }
                          }}
                        >
                          <Box className="flex items-center justify-between w-full mr-4">
                            <Box className="flex items-center gap-2">
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={isFullySelected}
                                    indeterminate={isPartiallySelected}
                                    onChange={(e) => handleSelectAllRegion(region, e.target.checked)}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{
                                      color: "#166534",
                                      "&.Mui-checked": { color: "#166534" },
                                      "&.MuiCheckbox-indeterminate": { color: "#f59e0b" }
                                    }}
                                  />
                                }
                                label=""
                                sx={{ margin: 0 }}
                              />
                              <Box>
                                <Typography variant="subtitle2" className="font-semibold">
                                  {region}
                                  {samsatSearchQuery && (
                                    <span className="ml-2 text-xs text-blue-600 font-normal">
                                      ({samsatInRegion.length} hasil)
                                    </span>
                                  )}
                                </Typography>
                                <Typography variant="caption" className="text-gray-500">
                                  {samsatInRegion[0]?.wilayah} • {samsatInRegion.length} Samsat
                                </Typography>
                              </Box>
                            </Box>
                            <Typography variant="body2" className="text-gray-500">
                              {samsatInRegion.filter(s => form.glbm_samsat_id.includes(s.id)).length}/{samsatInRegion.length}
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={1}>
                            {samsatInRegion.map((samsat) => (
                              <Grid item xs={12} sm={6} md={4} key={samsat.id}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={form.glbm_samsat_id.includes(samsat.id)}
                                      onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        setForm((prev) => ({
                                          ...prev,
                                          glbm_samsat_id: isChecked
                                            ? [...prev.glbm_samsat_id, samsat.id]
                                            : prev.glbm_samsat_id.filter(id => id !== samsat.id)
                                        }));
                                      }}
                                      sx={{
                                        color: "#166534",
                                        "&.Mui-checked": { color: "#166534" }
                                      }}
                                    />
                                  }
                                  label={
                                    <Box>
                                      <Typography variant="body2" className="text-sm font-medium">
                                        {samsat.nama_samsat}
                                      </Typography>
                                      <Typography variant="caption" className="text-gray-500">
                                        #{samsat.kode_samsat}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}

                  {/* Selected Samsat Chips */}
                  {form.glbm_samsat_id.length > 0 && (
                    <Box className="mt-3">
                      <Typography variant="body2" className="text-gray-600 mb-2">Samsat Terpilih:</Typography>
                      <Box className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                        {form.glbm_samsat_id.map((samsatId) => {
                          const s = samsatList.find((item) => item.id === samsatId);
                          return s ? (
                            <Chip
                              key={samsatId}
                              label={`${s.nama_samsat} (#${s.kode_samsat})`}
                              size="small"
                              onDelete={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  glbm_samsat_id: prev.glbm_samsat_id.filter(id => id !== samsatId)
                                }));
                              }}
                              sx={{ bgcolor: "#166534", color: "white", fontSize: "0.75rem" }}
                            />
                          ) : null;
                        })}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* ==== Password Info ==================================== */}
          <Box className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <Typography variant="body2" className="text-blue-800 font-medium flex items-center gap-2">
              <Info sx={{ color: "#1976d2", fontSize: 16 }} /> Informasi Password
            </Typography>
            <Typography variant="body2" className="text-blue-700 mt-1">
              Password default: <strong>12345678</strong> (User dapat mengubahnya setelah login pertama)
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions className="p-6">
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: "#6b7280",
            color: "#6b7280",
            "&:hover": { borderColor: "#4b5563", bgcolor: "#f9fafb" },
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
            bgcolor: "#166534",
            "&:hover": { bgcolor: "#0f5132" },
            fontWeight: 600,
            minWidth: "120px",
          }}
        >
          {loading ? (
            <Box className="flex items-center gap-2">
              <CircularProgress size={20} color="inherit" /> <span>Menyimpan...</span>
            </Box>
          ) : (
            <Box className="flex items-center gap-2">
              <PersonAdd sx={{ fontSize: 18 }} /> <span>Daftar</span>
            </Box>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterUserModal;