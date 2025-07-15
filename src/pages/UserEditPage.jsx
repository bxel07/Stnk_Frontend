import {
    Box,
    Button,
    CircularProgress,
    Grid,
    Paper,
    TextField,
    Typography,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Alert,
  } from "@mui/material";
  import { useParams, Navigate, useNavigate } from "react-router-dom";
  import { useEffect, useState } from "react";
  import axios from "axios";
  import { useSelector } from "react-redux";
  
  const UserEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
  
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
  
    // Proteksi akses hanya admin & superadmin
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return <Navigate to="/dashboard" replace />;
    }
  
    // Fetch role, pt, brand, dan detail user
    useEffect(() => {
      const fetchAll = async () => {
        try {
          const [roleRes, ptRes, brandRes, userRes] = await Promise.all([
            axios.get(`${BASE_URL}/roles`, config),
            axios.get(`${BASE_URL}/glbm-pt`, config),
            axios.get(`${BASE_URL}/glbm-brand`, config),
            axios.get(`${BASE_URL}/update-user/${id}`, config), // Pastikan endpoint ini tersedia
          ]);
  
          setRoles(roleRes.data);
          setPtList(ptRes.data.data || []);
          setBrandList(brandRes.data.data || []);
  
          const u = userRes.data.data;
  
          setForm({
            username: u.username || "",
            gmail: u.gmail || "",
            role_id: u.role_id || "",
            otorisasi:
              u.otorisasi?.map((o) => ({
                pt_id: o.pt_id || "",
                brand_id: o.brand_id || "",
              })) || [{ pt_id: "", brand_id: "" }],
          });
  
          setErrorMsg("");
        } catch (err) {
          setErrorMsg("Gagal memuat data user");
        } finally {
          setLoading(false);
        }
      };
  
      fetchAll();
    }, [id]);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleOtorisasiChange = (i, field, value) => {
      const newOtorisasi = [...form.otorisasi];
      newOtorisasi[i][field] = value;
      setForm({ ...form, otorisasi: newOtorisasi });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setErrorMsg("");
  
      try {
        await axios.put(`${BASE_URL}/update-user/${id}`, form, config);
        navigate("/users");
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          JSON.stringify(err?.response?.data || err.message);
        setErrorMsg(msg);
      }
    };
  
    if (loading) {
      return (
        <Box p={3} textAlign="center">
          <CircularProgress />
          <Typography mt={2}>Memuat data user...</Typography>
        </Box>
      );
    }
  
    return (
      <Box p={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Edit Pengguna
          </Typography>
  
          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
  
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              name="username"
              label="Username"
              value={form.username}
              onChange={handleChange}
            />
  
            <TextField
              fullWidth
              margin="normal"
              name="gmail"
              label="Email"
              value={form.gmail}
              onChange={handleChange}
            />
  
            <FormControl fullWidth margin="normal">
              <InputLabel>Pilih Role</InputLabel>
              <Select
                name="role_id"
                value={form.role_id}
                label="Pilih Role"
                onChange={handleChange}
              >
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            {/* OTORISASI - brand dan pt */}
            <Typography mt={3} mb={1} fontWeight={600}>
              Otorisasi PT & Brand
            </Typography>
  
            {form.otorisasi.map((otor, i) => (
              <Grid container spacing={2} key={i}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>PT</InputLabel>
                    <Select
                      value={otor.pt_id}
                      onChange={(e) =>
                        handleOtorisasiChange(i, "pt_id", e.target.value)
                      }
                      label="PT"
                    >
                      {ptList.map((pt) => (
                        <MenuItem key={pt.id} value={pt.id}>
                          {pt.nama_pt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Brand</InputLabel>
                    <Select
                      value={otor.brand_id}
                      onChange={(e) =>
                        handleOtorisasiChange(i, "brand_id", e.target.value)
                      }
                      label="Brand"
                    >
                      {brandList.map((b) => (
                        <MenuItem key={b.id} value={b.id}>
                          {b.nama_brand}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            ))}
  
            <Box mt={3}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ textTransform: "none" }}
              >
                Simpan Perubahan
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    );
  };
  
  export default UserEditPage;
  