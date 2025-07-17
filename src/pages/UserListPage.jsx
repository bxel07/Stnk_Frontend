import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Typography, Paper, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, Card, CardContent,
  CardHeader, Divider, Chip, TextField, FormControl, InputLabel,
  Select, MenuItem, Grid, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Fade, Slide
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
  Security
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

  const token = localStorage.getItem("access_token");
  const BASE_URL = import.meta.env.VITE_API_URL;
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

  const getBrandName = (brandIds) => {
    if (!brandIds || brandList.length === 0) return "-";
  
    const result = brandIds
      .map((id) => {
        const brand = brandList.find((b) => b.id === id);
        return brand?.nama_brand;
      })
      .filter(Boolean)
      .join(", ");
  
    return result || "-";
  };
  
  const getPtName = (ptData) => {
    if (!ptData || ptList.length === 0) return "-";
  
    const ids = Array.isArray(ptData) ? ptData : [ptData];
    const result = ids
      .map((id) => {
        const pt = ptList.find((p) => p.id === parseInt(id));
        if (!pt) console.warn("PT tidak ditemukan untuk ID:", id);
        return pt?.nama_pt;
      })
      .filter(Boolean)
      .join(", ");
  
    return result || "-";
  };

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
                  variant="h4" 
                  component="h1" 
                  className="text-white font-bold mb-1"
                >
                  Manajemen Akun
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  className="text-green-100 font-medium"
                >
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
                    }}
                  >
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
                  }}
                >
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
                }}
              />
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
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8fafc' }}>Brand</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8fafc' }}>PT</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8fafc' }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((u, i) => {
                    const brandIds = u.otorisasi?.map((o) => o.brand_id) || [];
                    const ptIds = u.otorisasi?.map((o) => o.pt_id) || [];
                    
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
                          <Typography variant="body2" className="text-gray-600">
                            {getBrandName(u.brand_ids)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" className="text-gray-600">
                            {getPtName(
                              Array.isArray(u.otorisasi) && u.otorisasi.length
                                ? u.otorisasi.map((o) => o.pt_id)
                                : u.pt_id
                            )}
                          </Typography>
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
        onSuccess={fetchUsers}
      />
    </Box>
  );
};

const EditUserModal = ({ open, onClose, userId, onSaved, currentUserRole }) => {
  const BASE_URL = import.meta.env.VITE_API_URL + "/api";
  const token = localStorage.getItem("access_token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const [form, setForm] = useState({
    username: "",
    gmail: "",
    role_id: "",
    otorisasi: [{ pt_id: "", brand_id: "" }],
  });

  const [roles, setRoles] = useState([]);
  const [ptList, setPtList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedRoleName, setSelectedRoleName] = useState("");

  useEffect(() => {
    if (!userId || !open) return;
  
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [roleRes, ptRes, brandRes, allUsersRes] = await Promise.all([
          axios.get(`${BASE_URL}/roles`, config),
          axios.get(`${BASE_URL}/glbm-pt`, config),
          axios.get(`${BASE_URL}/glbm-brand`, config),
          axios.get(`${BASE_URL}/users`, config),
        ]);
  
        setRoles(roleRes.data);
        setPtList(ptRes.data.data || []);
        setBrandList(brandRes.data.data || []);
  
        const userList = allUsersRes.data.data || [];
        const u = userList.find((item) => item.id === userId);
  
        if (!u) {
          setErrorMsg("User tidak ditemukan");
          return;
        }
  
        const originalOtorisasi = u.otorisasi || [];
  
        setForm({
          username: u.username || "",
          gmail: u.gmail || "",
          role_id: u.role_id || "",
          otorisasi: originalOtorisasi.length > 0
            ? originalOtorisasi.map((o) => ({
              pt_id: o.pt_id,
              brand_id: o.brand_id,
            }))            
            : [{ pt_id: u.pt_id || "", brand_id: u.brand_id || "" }],
        });
  
        setErrorMsg("");
      } catch (err) {
        setErrorMsg("Gagal memuat data user");
      } finally {
        setLoading(false);
      }
    };
  
    fetchAll();
  }, [userId, open]);

  useEffect(() => {
    if (form.role_id && roles.length > 0) {
      const selectedRole = roles.find((r) => r.id === parseInt(form.role_id));
      setSelectedRoleName(selectedRole?.name || "");
    }
  }, [form.role_id, roles]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "role_id") {
      const selectedRole = roles.find((r) => r.id === parseInt(value));
      setSelectedRoleName(selectedRole?.name || "");
    }
  };

  const handleOtorisasiChange = (i, field, value) => {
    const newOtorisasi = [...form.otorisasi];
    newOtorisasi[i][field] = value;
    setForm({ ...form, otorisasi: newOtorisasi });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        username: form.username,
        gmail: form.gmail,
        role_id: parseInt(form.role_id),
        otorisasi: form.otorisasi.map((o) => ({
          pt_id: o.pt_id ? parseInt(o.pt_id) : null,
          brand_id: o.brand_id ? parseInt(o.brand_id) : null,
        })),
      };
      
      await axios.put(`${BASE_URL}/update-user/${userId}`, payload, config);
      onSaved();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail || JSON.stringify(err?.response?.data || err.message);
      setErrorMsg(msg);
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
          </Box>
        ) : (
          <Box className="space-y-4">
            {errorMsg && (
              <Alert severity="error" className="rounded-xl">
                {errorMsg}
              </Alert>
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
              }}
            />
            
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
              }}
            />
            
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
                  {(selectedRoleName !== "cao" && selectedRoleName !== "user") && (
                    <Grid item xs={6}>
                      <FormControl fullWidth margin="dense">
                        <InputLabel sx={{ '&.Mui-focused': { color: '#166534' } }}>
                          PT
                        </InputLabel>
                        <Select
                          value={otor.pt_id}
                          onChange={(e) => handleOtorisasiChange(i, "pt_id", e.target.value)}
                          label="PT"
                          sx={{
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#166534',
                            },
                          }}
                        >
                          {ptList.map((pt) => (
                            <MenuItem key={pt.id} value={pt.id}>
                              {pt.nama_pt}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  
                  {(selectedRoleName === "cao" || selectedRoleName === "admin" || selectedRoleName === "superadmin") && (
                    <Grid item xs={selectedRoleName === "cao" ? 12 : 6}>
                      <FormControl fullWidth margin="dense">
                        <InputLabel sx={{ '&.Mui-focused': { color: '#166534' } }}>
                          Brand
                        </InputLabel>
                        <Select
                          value={otor.brand_id}
                          onChange={(e) => handleOtorisasiChange(i, "brand_id", e.target.value)}
                          label="Brand"
                          sx={{
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#166534',
                            },
                          }}
                        >
                          {brandList.map((b) => (
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
          }}
        >
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
          }}
        >
          Simpan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserListPage;