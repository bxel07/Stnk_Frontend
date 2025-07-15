import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import UserActionButton from "../components/UserActionButton";

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

  const token = localStorage.getItem("access_token");
  const BASE_URL = import.meta.env.VITE_API_URL;

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = res.data.data || [];
        setUsers(usersData);
        setFilteredUsers(usersData);
        setError("");
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Gagal memuat daftar user");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPTAndBrand = async () => {
      try {
        const [ptRes, brandRes] = await Promise.all([
          axios.get(`${BASE_URL}/glbm-pt`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/glbm-brand`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
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
      filtered = filtered.filter(
        (user) =>
          user.role?.role === roleFilter || user.role === roleFilter
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter]);

  const getPtName = (ptData) => {
    if (Array.isArray(ptData)) {
      return ptData
        .map((id) => ptList.find((p) => p.id === id)?.nama_pt)
        .filter(Boolean)
        .join(", ");
    } else {
      const pt = ptList.find((p) => p.id === ptData);
      return pt?.nama_pt || "-";
    }
  };

  const getBrandName = (brandData) => {
    if (Array.isArray(brandData)) {
      return brandData
        .map((id) => brandList.find((b) => b.id === id)?.nama_brand)
        .filter(Boolean)
        .join(", ");
    } else {
      const brand = brandList.find((b) => b.id === brandData);
      return brand?.nama_brand || "-";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "superadmin":
        return "error";
      case "admin":
        return "warning";
      case "user":
        return "primary";
      default:
        return "default";
    }
  };

  const getUniqueRoles = () => {
    const roles = users.map(user => user.role?.role || user.role).filter(Boolean);
    return [...new Set(roles)];
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center py-12">
        <CircularProgress size={40} />
        <Typography variant="body1" className="ml-4 text-gray-600">
          Memuat daftar Akun...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Card className="shadow-sm">
        <CardHeader
          title={
            <Box className="flex items-center gap-2">
              <i className="bi bi-funnel text-xl text-gray-600"></i>
              <Typography variant="h6" className="font-semibold">
                Filter Akun
              </Typography>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                label="Cari Akun"
                variant="outlined"
                size="small"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="bi bi-search text-gray-400"></i>
                    </InputAdornment>
                  ),
                  className: "rounded-lg",
                }}
                placeholder="Cari berdasarkan username, email, atau nama..."
                className="bg-white"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Filter Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-white rounded-lg"
                >
                  <MenuItem value="all">Semua Role</MenuItem>
                  {getUniqueRoles().map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Box className="text-center">
                <Typography variant="body2" className="text-gray-500">
                  Total: {filteredUsers.length} Akun
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader
          title={
            <Box className="flex items-center justify-between">
              <Box className="flex items-center gap-2">
                <i className="bi bi-people text-xl text-gray-600"></i>
                <Typography variant="h6" className="font-semibold">
                  Daftar Akun ({filteredUsers.length})
                </Typography>
              </Box>
            </Box>
          }
        />
        <Divider />
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <Box className="text-center py-12">
              <i className="bi bi-person-x text-6xl text-gray-300 mb-4 block"></i>
              <Typography variant="h6" className="text-gray-500 mb-2">
                {searchQuery || roleFilter !== "all"
                  ? "Tidak ada Akun yang sesuai filter"
                  : "Belum ada Akun"}
              </Typography>
              <Typography variant="body2" className="text-gray-400">
                {searchQuery || roleFilter !== "all"
                  ? "Coba ubah kriteria pencarian atau filter"
                  : "Belum ada Akun yang terdaftar dalam sistem"}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} className="max-h-96">
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>PT</TableCell>
                    <TableCell className="text-center">Status</TableCell>
                    <TableCell>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((userData, index) => (
                    <TableRow key={userData.id || index} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{userData.username || "-"}</TableCell>
                      <TableCell>{userData.email || userData.gmail || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={userData.role?.role || userData.role || "-"}
                          size="small"
                          color={getRoleColor(userData.role?.role || userData.role)}
                        />
                      </TableCell>
                      <TableCell>
                        {getBrandName(userData.brand_ids || userData.brand_id)}
                      </TableCell>
                      <TableCell>
                        {getPtName(userData.pt_ids || userData.pt_id)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={userData.is_active !== false ? "Aktif" : "Nonaktif"}
                          size="small"
                          color={userData.is_active !== false ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <UserActionButton userData={userData} />
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
