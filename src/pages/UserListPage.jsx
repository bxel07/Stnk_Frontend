import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Typography, Paper, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, Card, CardContent,
  CardHeader, Divider, Chip, TextField, FormControl, InputLabel,
  Select, MenuItem, Grid, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Fade, Slide, Accordion, AccordionSummary,
  AccordionDetails, FormControlLabel, Checkbox, InputAdornment
} from "@mui/material";
import { 
  Add, 
  Delete, 
  Person, 
  SupervisorAccount, 
  AdminPanelSettings, 
  Group, 
  Edit, 
  Search,
  FilterList,
  AccountCircle,
  Stars,
  Security,
  LocationOn,
  ExpandMore,
  Clear
} from "@mui/icons-material";
import RegisterUserModal from "@/components/RegisterUserModal";

const UserListPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [ptList, setPtList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("access_token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users`, config);
      const usersData = res.data.data || [];
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (err) {
      setError("Gagal memuat daftar user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const fetchPTAndBrand = async () => {
      try {
        const [ptRes, brandRes] = await Promise.all([
          axios.get(`${BASE_URL}/glbm-pt`, config),
          axios.get(`${BASE_URL}/glbm-brand`, config),
        ]);
        setPtList(ptRes.data.data || []);
        setBrandList(brandRes.data.data || []);
      } catch (err) {
        console.error("Gagal fetch PT/Brand:", err);
      }
    };
    fetchPTAndBrand();
  }, []);

  useEffect(() => {
    let filtered = [...users];
    if (searchQuery) {
      filtered = filtered.filter((user) =>
        (user.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.gmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.nama_lengkap || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) =>
        user.role?.role === roleFilter || user.role === roleFilter
      );
    }
    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter]);

  


  const getRoleIcon = (role) => {
    const iconColor = '#166534';
    const iconSize = 20;
    
    switch (role?.toLowerCase()) {
      case 'superadmin':
        return <Stars sx={{ color: iconColor, fontSize: iconSize }} />;
      case 'admin':
        return <AdminPanelSettings sx={{ color: iconColor, fontSize: iconSize }} />;
      case 'cao':
        return <SupervisorAccount sx={{ color: iconColor, fontSize: iconSize }} />;
      case 'user':
        return <Group sx={{ color: iconColor, fontSize: iconSize }} />;
      default:
        return <Person sx={{ color: iconColor, fontSize: iconSize }} />;
    }
  };
  
  const getRoleColor = (role) => {
    switch (role) {
      case "superadmin": return "error";
      case "admin": return "warning";
      case "cao": return "info";
      case "user": return "primary";
      default: return "default";
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSave = async () => {
    await fetchUsers();
    setModalOpen(false);
    
    // Toast notification untuk berhasil update user
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Data pengguna berhasil diperbarui',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'colored-toast'
      }
    });
  };

  const getUniqueRoles = () => {
    return [...new Set(users.map(user => user.role?.role || user.role).filter(Boolean))];
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-16">
        <Paper elevation={3} className="p-8 rounded-2xl">
          <Box className="flex flex-col items-center">
            <CircularProgress size={40} sx={{ color: '#166534' }} />
            <Typography className="mt-4 text-gray-600 font-medium">
              Memuat daftar Akun...
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      {/* Header Section */}
      <Fade in={true} timeout={800}>
        <Card className="shadow-lg rounded-2xl overflow-hidden">
          <Box className="bg-gradient-to-r from-green-700 to-green-800 p-6">
            <Box className="flex items-center gap-4">
              <Box className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                <AccountCircle sx={{ color: 'white', fontSize: 35 }} />
              </Box>
              <Box className="flex-1">
                <Typography 
                  variant="h5" 
                  component="h1" 
                  className="text-white font-bold mb-1">
                  Manajemen Akun
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  className="text-green-100 font-medium">
                  Kelola dan pantau akun pengguna sistem
                </Typography>
              </Box>
              <Box className="hidden md:flex items-center gap-2">
                <Group sx={{ color: 'white', fontSize: 32 }} />
                <Security sx={{ color: 'white', fontSize: 32 }} />
              </Box>
            </Box>
          </Box>
        </Card>
      </Fade>

      {error && (
        <Fade in={true} timeout={600}>
          <Alert severity="error" className="rounded-2xl">
            {error}
          </Alert>
        </Fade>
      )}

      {/* Filter Section */}
      <Slide direction="up" in={true} timeout={600}>
        <Card className="shadow-lg rounded-2xl">
          <Box className="bg-green-50 p-4 border-b border-green-200">
            <Box className="flex items-center gap-2">
              <FilterList sx={{ color: '#166534', fontSize: 24 }} />
              <Typography variant="h6" className="font-bold text-gray-800">
                Filter & Pencarian
              </Typography>
            </Box>
          </Box>
          <CardContent className="p-6">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField 
                  fullWidth 
                  label="Cari Akun" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ color: '#166534', mr: 1 }} />
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
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel sx={{ '&.Mui-focused': { color: '#166534' } }}>
                    Filter Role
                  </InputLabel>
                  <Select 
                    value={roleFilter} 
                    onChange={(e) => setRoleFilter(e.target.value)}
                    label="Filter Role"
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#166534',
                      },
                    }}>
                    <MenuItem value="all">Semua Role</MenuItem>
                    {getUniqueRoles().map((r) => (
                      <MenuItem key={r} value={r}>
                        <Box className="flex items-center gap-2">
                          {getRoleIcon(r)}
                          {r}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button 
                  fullWidth
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setRegisterModalOpen(true)}
                  sx={{
                    bgcolor: '#166534',
                    '&:hover': {
                      bgcolor: '#0f5132',
                    },
                    height: '56px',
                    fontWeight: 600,
                  }}>
                  Registrasi
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Slide>

      {/* Table Section */}
      <Fade in={true} timeout={1000}>
        <Card className="shadow-lg rounded-2xl">
          <Box className="bg-green-50 p-4 border-b border-green-200">
            <Box className="flex items-center justify-between">
              <Box className="flex items-center gap-2">
                <Group sx={{ color: '#166534', fontSize: 24 }} />
                <Typography variant="h6" className="font-bold text-gray-800">
                  Daftar Akun ({filteredUsers.length})
                </Typography>
              </Box>
              <Chip 
                label={`Total: ${filteredUsers.length} akun`}
                sx={{ 
                  bgcolor: '#166534',
                  color: 'white',
                  fontWeight: 600,
                }}/>
            </Box>
          </Box>
          <CardContent className="p-6">
            <TableContainer component={Paper} className="rounded-xl shadow-sm">
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8fafc' }}>No</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8fafc' }}>Username</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8fafc' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8fafc' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8fafc' }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((u, i) => {
                    const brandIds = Array.isArray(u.otorisasi)
                    ? u.otorisasi.map((o) => o.brand_id)
                    : [];
                  
                  const ptIds = Array.isArray(u.otorisasi)
                    ? u.otorisasi.map((o) => o.pt_id)
                    : [];                  
                    return (
                      <TableRow 
                        key={u.id}
                        sx={{ 
                          '&:hover': { 
                            bgcolor: '#f8fafc',
                            transition: 'background-color 0.2s'
                          } 
                        }}
                      >
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>
                          <Box className="flex items-center gap-2">
                            <Person sx={{ color: '#166534', fontSize: 18 }} />
                            <Typography variant="body2" className="font-medium">
                              {u.username}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{u.email || u.gmail}</TableCell>
                        <TableCell>
                          <Box className="flex items-center gap-2">
                            {getRoleIcon(u.role?.role || u.role)}
                            <Chip
                              label={u.role?.role || u.role}
                              color={getRoleColor(u.role?.role || u.role)}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Button 
                            onClick={() => handleOpenModal(u)} 
                            size="small" 
                            variant="outlined"
                            startIcon={<Edit />}
                            sx={{
                              borderColor: '#166534',
                              color: '#166534',
                              '&:hover': {
                                borderColor: '#0f5132',
                                bgcolor: '#f0fdf4',
                              },
                              fontWeight: 600,
                            }}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Fade>

      {modalOpen && selectedUser && (
        <EditUserModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          userId={selectedUser.id}
          onSaved={handleSave}
          currentUserRole={user?.role}
        />      
      )}
      
      <RegisterUserModal 
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={() => {
          fetchUsers();
          // Toast notification untuk berhasil registrasi user
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Akun pengguna baru berhasil dibuat',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
              popup: 'colored-toast'
            }
          });
        }}
      />
    </Box>
  );
};

const EditUserModal = ({ open, onClose, userId, onSaved, currentUserRole }) => {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("access_token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const [form, setForm] = useState({
    username: "",
    gmail: "",
    role_id: "",
    otorisasi: [{ pt_id: [], brand_id: [], glbm_samsat_id: [] }],
  });

  const [roles, setRoles] = useState([]);
  const [ptList, setPtList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [samsatList, setSamsatList] = useState([]);
  const [samsatSearchQuery, setSamsatSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const currentUser = useSelector((state) => state.auth.user);

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

  // Group filtered Samsat by wilayah_cakupan for select all functionality
  const groupedSamsat = filteredSamsatList.reduce((groups, samsat) => {
    const region = samsat.wilayah_cakupan || samsat.wilayah;
    if (!groups[region]) {
      groups[region] = [];
    }
    groups[region].push(samsat);
    return groups;
  }, {});

  // Handle Select All for a specific region
  const handleSelectAllRegion = (region, isChecked, otorisasiIndex) => {
    const regionSamsatIds = groupedSamsat[region]?.map(s => s.id) || [];
    
    const newOtorisasi = [...form.otorisasi];
    let currentSamsatIds = [...(newOtorisasi[otorisasiIndex].glbm_samsat_id || [])];
    
    if (isChecked) {
      // Add all region samsat IDs that aren't already selected
      regionSamsatIds.forEach(id => {
        if (!currentSamsatIds.includes(id)) {
          currentSamsatIds.push(id);
        }
      });
    } else {
      // Remove all region samsat IDs
      currentSamsatIds = currentSamsatIds.filter(id => !regionSamsatIds.includes(id));
    }
    
    newOtorisasi[otorisasiIndex].glbm_samsat_id = currentSamsatIds;
    setForm({ ...form, otorisasi: newOtorisasi });
  };

  // Check if all samsat in a region are selected (considering filtered results)
  const isRegionFullySelected = (region, otorisasiIndex) => {
    const regionSamsatIds = groupedSamsat[region]?.map(s => s.id) || [];
    const selectedIds = form.otorisasi[otorisasiIndex]?.glbm_samsat_id || [];
    return regionSamsatIds.length > 0 && regionSamsatIds.every(id => selectedIds.includes(id));
  };

  // Check if some (but not all) samsat in a region are selected (considering filtered results)
  const isRegionPartiallySelected = (region, otorisasiIndex) => {
    const regionSamsatIds = groupedSamsat[region]?.map(s => s.id) || [];
    const selectedIds = form.otorisasi[otorisasiIndex]?.glbm_samsat_id || [];
    const selectedCount = regionSamsatIds.filter(id => selectedIds.includes(id)).length;
    return selectedCount > 0 && selectedCount < regionSamsatIds.length;
  };

  // Clear search
  const handleClearSearch = () => {
    setSamsatSearchQuery("");
  };

  // Fetch data master lists saat modal dibuka
  useEffect(() => {
    const fetchMasterData = async () => {
      if (!open) return;
      
      try {
        console.log("Fetching master data...");
        
        const [ptRes, brandRes, samsatRes] = await Promise.all([
          axios.get(`${BASE_URL}/glbm-pt`, config),
          axios.get(`${BASE_URL}/glbm-brand`, config),
          axios.get(`${BASE_URL}/glbm-samsat/`, config),
        ]);

        const ptData = ptRes.data.data || [];
        const brandData = brandRes.data.data || [];
        const samsatData = samsatRes.data.data || [];

        setPtList(ptData);
        setBrandList(brandData);
        setSamsatList(samsatData);

        console.log("Master data loaded:", {
          pt: ptData.length,
          brand: brandData.length,
          samsat: samsatData.length
        });

        // Fetch roles
        const rolesData = [
          { id: 4, name: "superadmin" },
          { id: 3, name: "admin" },
          { id: 2, name: "cao" },
          { id: 1, name: "user" }
        ];
        setRoles(rolesData);

      } catch (err) {
        console.error("Error fetching master data:", err);
        setErrorMsg("Gagal memuat data master");
      }
    };

    fetchMasterData();
  }, [open]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !open) return;
      setLoading(true);
      try {
        const usersRes = await axios.get(`${BASE_URL}/users`, config);
        const userList = usersRes.data.data || [];
        const userData = userList.find((item) => item.id === userId);

        if (!userData) {
          setErrorMsg("User tidak ditemukan");
          return;
        }

        // Process otorisasi data - struktur yang benar
        let otorisasiData = [];
        
        if (userData.otorisasi) {
          otorisasiData = [{
            pt_id: userData.otorisasi.pt_ids || [],
            brand_id: userData.otorisasi.brand_ids || [],
            glbm_samsat_id: userData.otorisasi.samsat_ids || []
          }];
        } else {
          otorisasiData = [{
            pt_id: [],
            brand_id: [],
            glbm_samsat_id: []
          }];
        }

        // Determine role_id dari string role
        let roleId = "";
        if (userData.role_id) {
          roleId = userData.role_id;
        } else if (userData.role && typeof userData.role === 'string') {
          // Map string role ke ID
          const roleMapping = {
            "superadmin": 4,
            "admin": 3, 
            "cao": 2,
            "user": 1
          };
          roleId = roleMapping[userData.role] || "";
        }

        const formData = {
          username: userData.username || "",
          gmail: userData.gmail || userData.email || "",
          role_id: roleId,
          otorisasi: otorisasiData
        };

        setForm(formData);
        
        // Set selected role name untuk conditional rendering
        if (userData.role && typeof userData.role === 'string') {
          setSelectedRoleName(userData.role);
        } else if (roleId) {
          const role = roles.find(r => r.id === parseInt(roleId));
          if (role) setSelectedRoleName(role.name);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setErrorMsg("Gagal memuat data user");
      } finally {
        setLoading(false);
      }
    };

    // Delay sedikit untuk memastikan master data sudah ter-load
    if (open && userId) {
      setTimeout(fetchUserData, 100);
    }

  }, [userId, open, roles]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setForm({
        username: "",
        gmail: "",
        role_id: "",
        otorisasi: [{ pt_id: [], brand_id: [], glbm_samsat_id: [] }],
      });
      setErrorMsg("");
      setSelectedRoleName("");
      setSamsatSearchQuery("");
      setLoading(false);
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "role_id") {
      const selectedRole = roles.find(r => r.id === parseInt(value));
      setSelectedRoleName(selectedRole?.name || "");
    }
  };

  const handleOtorisasiChange = (index, field, value) => {
    const newOtorisasi = [...form.otorisasi];
    newOtorisasi[index][field] = Array.isArray(value) ? value : [value];
    setForm({ ...form, otorisasi: newOtorisasi });
  };

  const handleSubmit = async () => {
    try {
      setErrorMsg("");
      const payload = {
        username: form.username,
        gmail: form.gmail,
        role_id: parseInt(form.role_id),
        otorisasi: form.otorisasi.map(o => ({
          pt_id: o.pt_id.filter(id => id !== null && id !== undefined && id !== "").map(Number),
          brand_id: o.brand_id.filter(id => id !== null && id !== undefined && id !== "").map(Number),
          glbm_samsat_id: o.glbm_samsat_id.filter(id => id !== null && id !== undefined && id !== "").map(Number),
        })),
      };
      
      await axios.put(`${BASE_URL}/update-user/${userId}`, payload, config);
      
      // Toast notification untuk berhasil update
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data pengguna berhasil diperbarui',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'colored-toast'
        }
      });
      
      onSaved();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err.message;
      setErrorMsg(msg);
      
      // Toast notification untuk error
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: `Gagal memperbarui data: ${msg}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        customClass: {
          popup: 'colored-toast'
        }
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle className="bg-green-50 border-b border-green-200">
        <Box className="flex items-center gap-2">
          <Edit sx={{ color: '#166534', fontSize: 24 }} />
          <Typography variant="h6" className="font-bold text-gray-800">
            Edit Pengguna
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers className="p-6">
        {loading ? (
          <Box className="flex justify-center items-center py-8">
            <CircularProgress size={40} sx={{ color: '#166534' }} />
            <Typography className="ml-3">Memuat data pengguna...</Typography>
          </Box>
        ) : (
          <Box className="space-y-4">
            {errorMsg && (
              <Alert severity="error" className="rounded-xl">{errorMsg}</Alert>
            )}

            <TextField 
              fullWidth 
              margin="normal" 
              name="username" 
              label="Username" 
              value={form.username} 
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
              }}/>
            
            <TextField 
              fullWidth 
              margin="normal" 
              name="gmail" 
              label="Email" 
              value={form.gmail} 
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
              }}/>
            
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ '&.Mui-focused': { color: '#166534' } }}>
                Role
              </InputLabel>
              <Select 
                name="role_id" 
                value={form.role_id} 
                onChange={handleChange} 
                label="Role"
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#166534',
                  },
                }}>
                {roles
                  .filter(r => {
                    if (currentUserRole === "admin") {
                      return r.name === "user" || r.name === "cao";
                    }
                    return true;
                  })
                  .map(r => (
                    <MenuItem key={r.id} value={r.id}>
                      <Box className="flex items-center gap-2">
                        {r.name === 'superadmin' && <Stars sx={{ color: '#166534', fontSize: 18 }} />}
                        {r.name === 'admin' && <AdminPanelSettings sx={{ color: '#166534', fontSize: 18 }} />}
                        {r.name === 'cao' && <SupervisorAccount sx={{ color: '#166534', fontSize: 18 }} />}
                        {r.name === 'user' && <Group sx={{ color: '#166534', fontSize: 18 }} />}
                        {r.name}
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            
            <Box className="mt-6">
              <Typography variant="h6" className="font-bold text-gray-800 mb-3">
                Otorisasi PT & Brand
              </Typography>
              
              {form.otorisasi.map((otor, i) => (
                <Grid container spacing={2} alignItems="center" key={i} className="mb-3">
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
                          Dipilih: {(otor.glbm_samsat_id || []).length} dari {samsatList.length} Samsat
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
                            sx={{ mt: 1, color: '#166534' }}>
                            Hapus pencarian
                          </Button>
                        </Box>
                      )}
                      {/* Accordion for each wilayah_cakupan (filtered) */}
                      {Object.keys(groupedSamsat).sort().map((region) => {
                        const isFullySelected = isRegionFullySelected(region, i);
                        const isPartiallySelected = isRegionPartiallySelected(region, i);
                        const samsatInRegion = groupedSamsat[region];
                        
                        return (
                          <Accordion key={region} sx={{ mb: 1 }}>
                            <AccordionSummary
                              expandIcon={<ExpandMore />}
                              sx={{
                                bgcolor: isFullySelected ? "#f0f9ff" : isPartiallySelected ? "#fffbeb" : "#f9fafb",
                                borderRadius: "8px",
                                "&:hover": { bgcolor: "#f3f4f6" }
                              }}>
                              <Box className="flex items-center justify-between w-full mr-4">
                                <Box className="flex items-center gap-2">
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={isFullySelected}
                                        indeterminate={isPartiallySelected}
                                        onChange={(e) => handleSelectAllRegion(region, e.target.checked, i)}
                                        onClick={(e) => e.stopPropagation()}
                                        sx={{
                                          color: "#166534",
                                          "&.Mui-checked": { color: "#166534" },
                                          "&.MuiCheckbox-indeterminate": { color: "#f59e0b" }
                                        }}/>
                                      }
                                    label=""
                                    sx={{ margin: 0 }}/>
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
                                  {samsatInRegion.filter(s => (otor.glbm_samsat_id || []).includes(s.id)).length}/{samsatInRegion.length}
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
                                          checked={(otor.glbm_samsat_id || []).includes(samsat.id)}
                                          onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            const currentIds = otor.glbm_samsat_id || [];
                                            const newIds = isChecked
                                              ? [...currentIds, samsat.id]
                                              : currentIds.filter(id => id !== samsat.id);
                                            handleOtorisasiChange(i, "glbm_samsat_id", newIds);
                                          }}
                                          sx={{
                                            color: "#166534",
                                            "&.Mui-checked": { color: "#166534" }
                                          }}/>
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
                                      }/>
                                  </Grid>
                                ))}
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        );
                      })}
                      {/* Selected Samsat Chips */}
                      {(otor.glbm_samsat_id || []).length > 0 && (
                        <Box className="mt-3">
                          <Typography variant="body2" className="text-gray-600 mb-2">Samsat Terpilih:</Typography>
                          <Box className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                            {(otor.glbm_samsat_id || []).map((samsatId) => {
                              const s = samsatList.find((item) => item.id === samsatId);
                              return s ? (
                                <Chip
                                  key={samsatId}
                                  label={`${s.nama_samsat} (#${s.kode_samsat})`}
                                  size="small"
                                  onDelete={() => {
                                    const newIds = (otor.glbm_samsat_id || []).filter(id => id !== samsatId);
                                    handleOtorisasiChange(i, "glbm_samsat_id", newIds);
                                  }}
                                  sx={{ bgcolor: "#166534", color: "white", fontSize: "0.75rem" }}/>
                              ) : null;
                            })}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {(selectedRoleName !== "cao" && selectedRoleName !== "user") && (
                    <Grid item xs={12} md={selectedRoleName === "superadmin" ? 6 : 12}>
                      <FormControl fullWidth margin="dense">
                        <InputLabel sx={{ '&.Mui-focused': { color: '#166534' } }}>
                          PT
                        </InputLabel>
                        <Select
                          multiple={selectedRoleName === "superadmin"}
                          value={otor.pt_id || []}
                          onChange={(e) => handleOtorisasiChange(i, "pt_id", e.target.value)}
                          label="PT"
                          sx={{
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#166534',
                            },
                          }}>
                          {ptList.map(pt => (
                            <MenuItem key={pt.id} value={pt.id}>
                              {pt.nama_pt}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>                  
                  )}
                  
                  {(selectedRoleName === "cao" || selectedRoleName === "admin" || selectedRoleName === "superadmin") && (
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="dense">
                        <InputLabel sx={{ '&.Mui-focused': { color: '#166534' } }}>
                          Brand
                        </InputLabel>
                        <Select
                          multiple={["superadmin", "admin"].includes(selectedRoleName)}
                          value={otor.brand_id || []}
                          onChange={(e) => handleOtorisasiChange(i, "brand_id", e.target.value)}
                          label="Brand"
                          sx={{
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#166534',
                            },
                          }}>
                          {brandList.map(b => (
                            <MenuItem key={b.id} value={b.id}>
                              {b.nama_brand}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>                  
                  )}
                </Grid>
              ))}
            </Box>
          </Box>
        )}
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
          }}>
          Batal
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          sx={{
            bgcolor: '#166534',
            '&:hover': {
              bgcolor: '#0f5132',
            },
            fontWeight: 600,
          }}>
          Simpan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserListPage;