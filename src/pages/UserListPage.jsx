import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Typography, Paper, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, Card, CardContent,
  CardHeader, Divider, Chip, TextField, FormControl, InputLabel,
  Select, MenuItem, Grid, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

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

  const getPtName = (ptData) => {
    if (Array.isArray(ptData)) {
      return ptData.map((id) => ptList.find((p) => p.id === id)?.nama_pt).filter(Boolean).join(", ");
    } else {
      const pt = ptList.find((p) => p.id === ptData);
      return pt?.nama_pt || "-";
    }
  };

  const getBrandName = (brandData) => {
    if (Array.isArray(brandData)) {
      return brandData.map((id) => brandList.find((b) => b.id === id)?.nama_brand).filter(Boolean).join(", ");
    } else {
      const brand = brandList.find((b) => b.id === brandData);
      return brand?.nama_brand || "-";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "superadmin": return "error";
      case "admin": return "warning";
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

  if (loading) return (
    <Box className="flex justify-center items-center py-12">
      <CircularProgress size={40} />
      <Typography variant="body1" className="ml-4 text-gray-600">
        Memuat daftar Akun...
      </Typography>
    </Box>
  );

  return (
    <Box className="space-y-6">
      {error && <Alert severity="error">{error}</Alert>}

      {/* Filter */}
      <Card><CardHeader title="Filter Akun" /><Divider /><CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Cari Akun" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter Role</InputLabel>
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <MenuItem value="all">Semua Role</MenuItem>
                {getUniqueRoles().map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent></Card>

      {/* Table */}
      <Card><CardHeader title="Daftar Akun" /><Divider /><CardContent>
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead><TableRow>
              <TableCell>No</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>PT</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {filteredUsers.map((u, i) => (
                <TableRow key={u.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email || u.gmail}</TableCell>
                  <TableCell><Chip label={u.role?.role || u.role} color={getRoleColor(u.role?.role || u.role)} size="small" /></TableCell>
                  <TableCell>{getBrandName(u.brand_ids || u.brand_id)}</TableCell>
                  <TableCell>{getPtName(u.pt_ids || u.pt_id)}</TableCell>
                  <TableCell><Chip label={u.is_active ? "Aktif" : "Nonaktif"} color={u.is_active ? "success" : "default"} variant="outlined" size="small" /></TableCell>
                  <TableCell>
                    <Button onClick={() => handleOpenModal(u)} size="small" variant="outlined">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent></Card>

      {modalOpen && selectedUser && (
        <EditUserModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          userId={selectedUser.id}
          onSaved={handleSave}
        />
      )}
    </Box>
  );
};

const EditUserModal = ({ open, onClose, userId, onSaved }) => {
  const BASE_URL = import.meta.env.VITE_API_URL;
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

  useEffect(() => {
    if (!userId || !open) return;
  
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [roleRes, ptRes, brandRes, allUsersRes] = await Promise.all([
          axios.get(`${BASE_URL}/roles`, config),
          axios.get(`${BASE_URL}/glbm-pt`, config),
          axios.get(`${BASE_URL}/glbm-brand`, config),
          axios.get(`${BASE_URL}/users`, config), // Ganti dari update-user/{id}
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
  
        setForm({
          username: u.username || "",
          gmail: u.gmail || "",
          role_id: u.role_id || "",
  
          // Sesuaikan jika otorisasi tidak tersedia
          otorisasi: (u.otorisasi || [{ pt_id: u.pt_id || "", brand_id: u.brand_id || "" }]),
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtorisasiChange = (i, field, value) => {
    const newOtorisasi = [...form.otorisasi];
    newOtorisasi[i][field] = value;
    setForm({ ...form, otorisasi: newOtorisasi });
  };

  const handleAddOtorisasi = () => {
    setForm((prev) => ({
      ...prev,
      otorisasi: [...prev.otorisasi, { pt_id: "", brand_id: "" }],
    }));
  };

  const handleRemoveOtorisasi = (i) => {
    const updated = [...form.otorisasi];
    updated.splice(i, 1);
    setForm({ ...form, otorisasi: updated });
  };

  const handleSubmit = async () => {
    try {
      await axios.put(`${BASE_URL}/update-user/${userId}`, form, config);
      onSaved();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail || JSON.stringify(err?.response?.data || err.message);
      setErrorMsg(msg);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Pengguna</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Grid container justifyContent="center" alignItems="center"><CircularProgress /></Grid>
        ) : (
          <>
            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
            <TextField fullWidth margin="normal" name="username" label="Username" value={form.username} onChange={handleChange} />
            <TextField fullWidth margin="normal" name="gmail" label="Email" value={form.gmail} onChange={handleChange} />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select name="role_id" value={form.role_id} onChange={handleChange} label="Role">
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography mt={3} mb={1} fontWeight={600}>Otorisasi PT & Brand</Typography>
            {form.otorisasi.map((otor, i) => (
              <Grid container spacing={2} alignItems="center" key={i}>
                <Grid item xs={5}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>PT</InputLabel>
                    <Select
                      value={otor.pt_id}
                      onChange={(e) => handleOtorisasiChange(i, "pt_id", e.target.value)}
                      label="PT"
                    >
                      {ptList.map((pt) => (
                        <MenuItem key={pt.id} value={pt.id}>{pt.nama_pt}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={5}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Brand</InputLabel>
                    <Select
                      value={otor.brand_id}
                      onChange={(e) => handleOtorisasiChange(i, "brand_id", e.target.value)}
                      label="Brand"
                    >
                      {brandList.map((b) => (
                        <MenuItem key={b.id} value={b.id}>{b.nama_brand}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <IconButton color="error" onClick={() => handleRemoveOtorisasi(i)} disabled={form.otorisasi.length === 1}>
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button startIcon={<Add />} onClick={handleAddOtorisasi} size="small" sx={{ mt: 1 }}>
              Tambah Otorisasi
            </Button>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Batal</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>Simpan</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserListPage;
