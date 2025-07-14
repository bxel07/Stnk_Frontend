// src/pages/UserListPage.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Typography, Paper, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert, Card, CardContent, CardHeader,
  Divider, Chip, TextField, InputAdornment, FormControl, InputLabel, Select,
  MenuItem, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from "@mui/material";

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
  const [roleList, setRoleList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const token = localStorage.getItem("access_token");
  const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = res.data.data || [];
        setUsers(usersData);
        setFilteredUsers(usersData);
        setError("");
      } catch (err) {
        setError("Gagal memuat daftar user");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [ptRes, brandRes, roleRes] = await Promise.all([
          axios.get(`${BASE_URL}/glbm-pt`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/glbm-brand`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/roles`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setPtList(ptRes.data.data || []);
        setBrandList(brandRes.data.data || []);
        setRoleList(roleRes.data || []);
      } catch (err) {
        console.error("Gagal fetch PT/Brand/Role:", err);
      }
    };

    fetchLists();
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
      filtered = filtered.filter(
        (user) => user.role?.role === roleFilter || user.role === roleFilter
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter]);

  const getPtNameById = (pt_id) => ptList.find((pt) => pt.id === pt_id)?.nama_pt || "";
  const getBrandNameById = (brand_id) => brandList.find((b) => b.id === brand_id)?.nama_brand || "";

  const getPtNames = (otorisasi) =>
    otorisasi?.map((o) => getPtNameById(o.pt_id)).filter(Boolean).join(", ") || "-";

  const getBrandNames = (otorisasi) =>
    otorisasi?.map((o) => getBrandNameById(o.brand_id)).filter(Boolean).join(", ") || "-";

  const getRoleColor = (role) => {
    switch (role) {
      case "superadmin": return "error";
      case "admin": return "warning";
      case "user": return "primary";
      default: return "default";
    }
  };

  const getUniqueRoles = () => [...new Set(users.map(u => u.role?.role || u.role).filter(Boolean))];

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-12">
        <CircularProgress size={40} />
        <Typography className="ml-4 text-gray-600">Memuat daftar Akun...</Typography>
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardHeader title="Filter Akun" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Cari Akun"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="bi bi-search text-gray-400" />
                    </InputAdornment>
                  )}}/>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Filter Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">Semua Role</MenuItem>
                  {getUniqueRoles().map((role) => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={`Daftar Akun (${filteredUsers.length})`} />
        <Divider />
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <Box className="text-center py-12 text-gray-500">Tidak ada Akun ditemukan.</Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>PT</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((userData, index) => (
                    <TableRow key={userData.id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{userData.username}</TableCell>
                      <TableCell>{userData.gmail || userData.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={userData.role?.role || userData.role}
                          size="small"
                          color={getRoleColor(userData.role?.role || userData.role)}
                        />
                      </TableCell>
                      <TableCell>{getBrandNames(userData.otorisasi)}</TableCell>
                      <TableCell>{getPtNames(userData.otorisasi)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={userData.is_active !== false ? "Aktif" : "Nonaktif"}
                          size="small"
                          color={userData.is_active !== false ? "success" : "default"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserListPage;
