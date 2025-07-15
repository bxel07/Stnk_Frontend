// import {
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     Button,
//     TextField,
//     FormControl,
//     InputLabel,
//     Select,
//     MenuItem,
//     Grid,
//     Alert,
//     CircularProgress,
//     Typography,
//     IconButton,
//   } from "@mui/material";
//   import { Add, Delete } from "@mui/icons-material";
//   import { useEffect, useState } from "react";
//   import axios from "axios";
  
//   const EditUserModal = ({ open, onClose, userId, onSaved }) => {
//     const BASE_URL = import.meta.env.VITE_API_URL;
//     const token = localStorage.getItem("access_token");
//     const config = { headers: { Authorization: `Bearer ${token}` } };
  
//     const [form, setForm] = useState({
//       username: "",
//       gmail: "",
//       role_id: "",
//       otorisasi: [{ pt_id: "", brand_id: "" }],
//     });
  
//     const [roles, setRoles] = useState([]);
//     const [ptList, setPtList] = useState([]);
//     const [brandList, setBrandList] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [errorMsg, setErrorMsg] = useState("");
  
//     useEffect(() => {
//       if (!userId || !open) return;
  
//       const fetchAll = async () => {
//         setLoading(true);
//         try {
//           const [roleRes, ptRes, brandRes, userRes] = await Promise.all([
//             axios.get(`${BASE_URL}/roles`, config),
//             axios.get(`${BASE_URL}/glbm-pt`, config),
//             axios.get(`${BASE_URL}/glbm-brand`, config),
//             axios.get(`${BASE_URL}/update-user/${userId}`, config),
//           ]);
  
//           setRoles(roleRes.data || []);
//           setPtList(ptRes.data.data || []);
//           setBrandList(brandRes.data.data || []);
  
//           const u = userRes.data.data;
  
//           setForm({
//             username: u.username || "",
//             gmail: u.gmail || "",
//             role_id: u.role_id || "",
//             otorisasi:
//               u.otorisasi?.map((o) => ({
//                 pt_id: o.pt_id || "",
//                 brand_id: o.brand_id || "",
//               })) || [{ pt_id: "", brand_id: "" }],
//           });
//           setErrorMsg("");
//         } catch (err) {
//           setErrorMsg("Gagal memuat data user");
//         } finally {
//           setLoading(false);
//         }
//       };
  
//       fetchAll();
//     }, [userId, open]);
  
//     const handleChange = (e) => {
//       const { name, value } = e.target;
//       setForm((prev) => ({ ...prev, [name]: value }));
//     };
  
//     const handleOtorisasiChange = (i, field, value) => {
//       const newOtorisasi = [...form.otorisasi];
//       newOtorisasi[i][field] = value;
//       setForm({ ...form, otorisasi: newOtorisasi });
//     };
  
//     const handleAddOtorisasi = () => {
//       setForm((prev) => ({
//         ...prev,
//         otorisasi: [...prev.otorisasi, { pt_id: "", brand_id: "" }],
//       }));
//     };
  
//     const handleRemoveOtorisasi = (i) => {
//       const updated = [...form.otorisasi];
//       updated.splice(i, 1);
//       setForm({ ...form, otorisasi: updated });
//     };
  
//     const handleSubmit = async () => {
//       try {
//         await axios.put(`${BASE_URL}/update-user/${userId}`, form, config);
//         onSaved(); // callback ke parent
//         onClose();
//       } catch (err) {
//         const msg =
//           err?.response?.data?.detail ||
//           JSON.stringify(err?.response?.data || err.message);
//         setErrorMsg(msg);
//       }
//     };
  
//     return (
//       <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
//         <DialogTitle>Edit Pengguna</DialogTitle>
//         <DialogContent dividers>
//           {loading ? (
//             <Grid container justifyContent="center" alignItems="center">
//               <CircularProgress />
//             </Grid>
//           ) : (
//             <>
//               {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
  
//               <TextField
//                 fullWidth
//                 margin="normal"
//                 name="username"
//                 label="Username"
//                 value={form.username}
//                 onChange={handleChange}
//               />
  
//               <TextField
//                 fullWidth
//                 margin="normal"
//                 name="gmail"
//                 label="Email"
//                 value={form.gmail}
//                 onChange={handleChange}
//               />
  
//               <FormControl fullWidth margin="normal">
//                 <InputLabel>Role</InputLabel>
//                 <Select
//                   name="role_id"
//                   value={form.role_id}
//                   onChange={handleChange}
//                   label="Role"
//                 >
//                   {roles.map((r) => (
//                     <MenuItem key={r.id} value={r.id}>
//                       {r.name}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
  
//               <Typography mt={3} mb={1} fontWeight={600}>
//                 Otorisasi PT & Brand
//               </Typography>
  
//               {form.otorisasi.map((otor, i) => (
//                 <Grid container spacing={2} alignItems="center" key={i}>
//                   <Grid item xs={5}>
//                     <FormControl fullWidth margin="dense">
//                       <InputLabel>PT</InputLabel>
//                       <Select
//                         value={otor.pt_id}
//                         onChange={(e) =>
//                           handleOtorisasiChange(i, "pt_id", e.target.value)
//                         }
//                         label="PT"
//                       >
//                         {ptList.map((pt) => (
//                           <MenuItem key={pt.id} value={pt.id}>
//                             {pt.nama_pt}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Grid>
//                   <Grid item xs={5}>
//                     <FormControl fullWidth margin="dense">
//                       <InputLabel>Brand</InputLabel>
//                       <Select
//                         value={otor.brand_id}
//                         onChange={(e) =>
//                           handleOtorisasiChange(i, "brand_id", e.target.value)
//                         }
//                         label="Brand"
//                       >
//                         {brandList.map((b) => (
//                           <MenuItem key={b.id} value={b.id}>
//                             {b.nama_brand}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Grid>
//                   <Grid item xs={2}>
//                     <IconButton
//                       color="error"
//                       onClick={() => handleRemoveOtorisasi(i)}
//                       disabled={form.otorisasi.length === 1}
//                     >
//                       <Delete />
//                     </IconButton>
//                   </Grid>
//                 </Grid>
//               ))}
  
//               <Button
//                 startIcon={<Add />}
//                 onClick={handleAddOtorisasi}
//                 size="small"
//                 sx={{ mt: 1 }}
//               >
//                 Tambah Otorisasi
//               </Button>
//             </>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={onClose}>Batal</Button>
//           <Button onClick={handleSubmit} variant="contained" disabled={loading}>
//             Simpan
//           </Button>
//         </DialogActions>
//       </Dialog>
//     );
//   };
  
//   export default EditUserModal;
  