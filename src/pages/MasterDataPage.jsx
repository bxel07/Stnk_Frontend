import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Box,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Fade,
  Slide,
  // RESPONSIVE: Import useMediaQuery and useTheme
  useMediaQuery,
  useTheme,
  CardActions
} from "@mui/material";
import {
  FilterList,
  Visibility,
  Edit,
  Add,
  Delete,
  Close,
  TableChart,
  Business,
  LocalOffer,
  AccountBalance,
  Save,
  Cancel,
  LocationOn,
  Map
} from "@mui/icons-material";

const BASE_URL = import.meta.env.VITE_API_URL + "/api";

const MasterDataPage = () => {
  const _dispatch = useDispatch();
  const { _user } = useSelector((state) => state.auth);

  // RESPONSIVE: Hook to check for mobile screen size
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState(0);
  
  // State untuk data master
  const [ptData, setPtData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [samsatData, setSamsatData] = useState([]);
  const [wilayahData, setWilayahData] = useState([]);
  const [wilayahCakupanData, setWilayahCakupanData] = useState([]);
  const [samsatWilayahCakupanData, setSamsatWilayahCakupanData] = useState([]); 
  
  // State untuk loading
  const [ptLoading, setPtLoading] = useState(false);
  const [brandLoading, setBrandLoading] = useState(false);
  const [samsatLoading, setSamsatLoading] = useState(false);
  const [wilayahLoading, setWilayahLoading] = useState(false);
  const [_wilayahCakupanLoading, setWilayahCakupanLoading] = useState(false);
  
  // State untuk error
  const [ptError, setPtError] = useState(null);
  const [brandError, setBrandError] = useState(null);
  const [samsatError, setSamsatError] = useState(null);
  const [wilayahError, setWilayahError] = useState(null);
  const [_wilayahCakupanError, setWilayahCakupanError] = useState(null);

  // State untuk dialog
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [addWilayahCakupanDialog, setAddWilayahCakupanDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // State untuk form
  const [formData, setFormData] = useState({
    nama_pt: '',
    kode_pt: '',
    nama_brand: '',
    kode_brand: '',
    nama_samsat: '',
    kode_samsat: '',
    wilayah_cakupan_id: '',
    nama_wilayah: '',
    wilayah_id: '',
    status: 'aktif'
  });

  // State untuk filter
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch functions (No changes needed here)
  const fetchWilayahData = async () => {
    setWilayahLoading(true);
    setWilayahError(null);
    try {
      const response = await fetch(`${BASE_URL}/wilayah`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setWilayahData(data.data);
      } else {
        setWilayahError(data.message || 'Failed to fetch Wilayah data');
      }
    } catch (err) {
      setWilayahError(err.message);
    } finally {
      setWilayahLoading(false);
    }
  };

  const fetchWilayahCakupanData = async () => {
    setWilayahCakupanLoading(true);
    setWilayahCakupanError(null);
    try {
      const response = await fetch(`${BASE_URL}/wilayah-cakupan`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setWilayahCakupanData(data.data);
      } else {
        setWilayahCakupanError(data.message || 'Failed to fetch Wilayah Cakupan data');
      }
    } catch (err) {
      setWilayahCakupanError(err.message);
    } finally {
      setWilayahCakupanLoading(false);
    }
  };

  const fetchSamsatWilayahCakupan = async () => {
    try {
      const response = await fetch(`${BASE_URL}/wilayah-cakupan`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.status === 'success') {
        const transformedData = data.data.map(item => ({
          id_wilayah_cakupan: item.id,
          nama_wilayah_cakupan: item.nama_wilayah
        }));
        setSamsatWilayahCakupanData(transformedData);
      }
    } catch (err) {
      console.error('Error fetching samsat wilayah cakupan:', err);
    }
  };

  const fetchPtData = async () => {
    setPtLoading(true);
    setPtError(null);
    try {
      const response = await fetch(`${BASE_URL}/glbm-pt`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setPtData(data.data);
      } else {
        setPtError(data.message || 'Failed to fetch PT data');
      }
    } catch (err) {
      setPtError(err.message);
    } finally {
      setPtLoading(false);
    }
  };

  const fetchBrandData = async () => {
    setBrandLoading(true);
    setBrandError(null);
    try {
      const response = await fetch(`${BASE_URL}/glbm-brand`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setBrandData(data.data);
      } else {
        setBrandError(data.message || 'Failed to fetch Brand data');
      }
    } catch (err) {
      setBrandError(err.message);
    } finally {
      setBrandLoading(false);
    }
  };

  const fetchSamsatData = async () => {
    setSamsatLoading(true);
    setSamsatError(null);
    try {
      const response = await fetch(`${BASE_URL}/glbm-samsat/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success') {
        setSamsatData(data.data);
      } else {
        setSamsatError(data.message || 'Failed to fetch Samsat data');
        console.error('Samsat fetch error:', data.message);
      }
    } catch (err) {
      setSamsatError(err.message);
      console.error('Error fetching samsat data:', err);
    } finally {
      setSamsatLoading(false);
    }
  };

  // useEffect and handler functions (No major changes needed, logic remains the same)
  useEffect(() => {
    fetchSamsatWilayahCakupan();
    switch (activeTab) {
      case 0: fetchPtData(); break;
      case 1: fetchBrandData(); break;
      case 2: fetchSamsatData(); break;
      case 3: fetchWilayahData(); fetchWilayahCakupanData(); break;
      default: break;
    }
  }, [activeTab]);

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const handleAddNew = () => {
    setFormData({
      nama_pt: '', kode_pt: '', nama_brand: '', kode_brand: '',
      nama_samsat: '', kode_samsat: '', wilayah_cakupan_id: '',
      nama_wilayah: '', wilayah_id: '', status: 'aktif'
    });
    setAddDialog(true);
  };

  const handleAddWilayahCakupan = () => {
    setFormData({
      nama_pt: '', kode_pt: '', nama_brand: '', kode_brand: '',
      nama_samsat: '', kode_samsat: '', wilayah_cakupan_id: '',
      nama_wilayah: '', wilayah_id: '', status: 'aktif'
    });
    setAddWilayahCakupanDialog(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setFormData({
      nama_pt: record.nama_pt || '', kode_pt: record.kode_pt || '',
      nama_brand: record.nama_brand || '', kode_brand: record.kode_brand || '',
      nama_samsat: record.nama_samsat || '', kode_samsat: record.kode_samsat || '',
      wilayah_cakupan_id: record.wilayah_cakupan_id || '',
      nama_wilayah: record.nama_wilayah || '', wilayah_id: record.wilayah_id || '',
      status: record.status || 'aktif'
    });
    setEditDialog(true);
  };
  
  const handleDelete = (record) => {
    setSelectedRecord(record);
    setDeleteDialog(true);
  };

  // Form submission and delete logic remains the same
  const handleFormSubmit = async () => {
    const isEdit = selectedRecord !== null;
    let endpoint, method, url, requestBody;

    if (isEdit) {
      switch (activeTab) {
        case 0: endpoint = `/update-pt/${selectedRecord.id}`; requestBody = { nama_pt: formData.nama_pt, kode_pt: formData.kode_pt }; break;
        case 1: endpoint = `/update-brand/${selectedRecord.id}`; requestBody = { nama_brand: formData.nama_brand, kode_brand: formData.kode_brand }; break;
        case 2: endpoint = `/glbm-samsat/${selectedRecord.id}`; requestBody = { nama_samsat: formData.nama_samsat, kode_samsat: formData.kode_samsat, wilayah_cakupan_id: parseInt(formData.wilayah_cakupan_id) }; break;
        case 3: endpoint = `/update-wilayah/${selectedRecord.id}`; requestBody = { nama_wilayah: formData.nama_wilayah }; break;
      }
      method = 'PUT';
      url = `${BASE_URL}${endpoint}`;
    } else {
      switch (activeTab) {
        case 0: endpoint = '/add-pt'; requestBody = { nama_pt: formData.nama_pt, kode_pt: formData.kode_pt }; break;
        case 1: endpoint = '/add-brand'; requestBody = { nama_brand: formData.nama_brand, kode_brand: formData.kode_brand }; break;
        case 2: endpoint = '/glbm-samsat/'; requestBody = { nama_samsat: formData.nama_samsat, kode_samsat: formData.kode_samsat, wilayah_cakupan_id: parseInt(formData.wilayah_cakupan_id) }; break;
        case 3: endpoint = '/wilayah'; requestBody = { nama_wilayah: formData.nama_wilayah }; break;
      }
      method = 'POST';
      url = `${BASE_URL}${endpoint}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast.success(isEdit ? 'Data berhasil diperbarui' : 'Data berhasil ditambahkan');
        setAddDialog(false);
        setEditDialog(false);
        setSelectedRecord(null);
        refreshCurrentData();
      } else {
        toast.error(data.message || 'Gagal menyimpan data');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };
  
  const handleWilayahCakupanSubmit = async () => {
     try {
       const response = await fetch(`${BASE_URL}/wilayah-cakupan`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
         body: JSON.stringify({ nama_wilayah: formData.nama_wilayah, wilayah_id: parseInt(formData.wilayah_id) })
       });
       const data = await response.json();
       if (data.status === 'success') {
         toast.success('Wilayah Cakupan berhasil ditambahkan');
         setAddWilayahCakupanDialog(false);
         fetchWilayahCakupanData();
       } else {
         toast.error(data.message || 'Gagal menambahkan wilayah cakupan');
       }
     } catch (err) {
       toast.error(err.message);
     }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecord) return;
    const deleteEndpoint = getDeleteEndpoint();
    try {
      const response = await fetch(`${BASE_URL}${deleteEndpoint}/${selectedRecord.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      const isSuccess = data.status === 'success' || data.message?.includes('berhasil dihapus');
      if (isSuccess) {
        toast.success('Data berhasil dihapus');
        setDeleteDialog(false);
        setSelectedRecord(null);
        refreshCurrentData();
      } else {
        toast.error(data.message || 'Gagal menghapus data');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Helper functions (No changes needed)
  const getDeleteEndpoint = () => {
    switch (activeTab) {
      case 0: return '/delete-pt'; case 1: return '/delete-brand';
      case 2: return '/delete-glbm-samsat'; case 3: return '/delete-wilayah';
      default: return '/delete-pt';
    }
  };
  const getCurrentData = () => {
    switch (activeTab) {
      case 0: return ptData; case 1: return brandData;
      case 2: return samsatData; case 3: return wilayahData;
      default: return [];
    }
  };
  const getCurrentLoading = () => {
    switch (activeTab) {
      case 0: return ptLoading; case 1: return brandLoading;
      case 2: return samsatLoading; case 3: return wilayahLoading;
      default: return false;
    }
  };
  const getCurrentError = () => {
    switch (activeTab) {
      case 0: return ptError; case 1: return brandError;
      case 2: return samsatError; case 3: return wilayahError;
      default: return null;
    }
  };
  const refreshCurrentData = () => {
    switch (activeTab) {
      case 0: fetchPtData(); break; case 1: fetchBrandData(); break;
      case 2: fetchSamsatData(); break; case 3: fetchWilayahData(); break;
      default: break;
    }
  };
  const getTabConfig = () => {
    const configs = [
      { label: 'Data PT', icon: Business, title: 'Data PT', emptyMessage: 'Belum ada data PT' },
      { label: 'Data Brand', icon: LocalOffer, title: 'Data Brand', emptyMessage: 'Belum ada data Brand' },
      { label: 'Data Samsat', icon: AccountBalance, title: 'Data Samsat', emptyMessage: 'Belum ada data Samsat' },
      { label: 'Data Wilayah', icon: LocationOn, title: 'Data Wilayah', emptyMessage: 'Belum ada data Wilayah' }
    ];
    return configs[activeTab];
  };
  const getFieldName = (record) => {
    switch (activeTab) {
      case 0: return record.nama_pt; case 1: return record.nama_brand;
      case 2: return record.nama_samsat; case 3: return record.nama_wilayah;
      default: return record.nama || record.nama_pt || record.nama_brand || record.nama_samsat || record.nama_wilayah;
    }
  };
  const getFieldCode = (record) => {
    switch (activeTab) {
      case 0: return record.kode_pt; case 1: return record.kode_brand;
      case 2: return record.kode_samsat; case 3: return record.id;
      default: return record.kode || record.kode_pt || record.kode_brand || record.kode_samsat || record.id;
    }
  };

  const getTableColumns = () => {
    let baseColumns = [{ id: 'no', label: 'No', minWidth: 50 }];
    switch (activeTab) {
      case 0: baseColumns.push({ id: 'nama', label: 'Nama PT', minWidth: 200 }, { id: 'kode', label: 'Kode PT', minWidth: 120 }); break;
      case 1: baseColumns.push({ id: 'nama', label: 'Nama Brand', minWidth: 200 }, { id: 'kode', label: 'Kode Brand', minWidth: 120 }); break;
      case 2: baseColumns.push({ id: 'wilayah', label: 'Wilayah', minWidth: 150 }, { id: 'wilayah_cakupan', label: 'Wilayah Cakupan', minWidth: 150 }, { id: 'nama', label: 'Nama Samsat', minWidth: 200 }, { id: 'kode', label: 'Kode Samsat', minWidth: 120 }); break;
      case 3: baseColumns.push({ id: 'nama', label: 'Nama Wilayah', minWidth: 200 }, { id: 'wilayah_cakupan', label: 'Wilayah Cakupan', minWidth: 250 }); break;
    }
    baseColumns.push({ id: 'actions', label: 'Actions', minWidth: 120, align: 'center' });
    return baseColumns;
  };

  // Render functions
  const renderFilter = () => (
    <Fade in={true} timeout={600}>
      <Card className="shadow-lg rounded-2xl mb-6">
        <CardHeader
          title={
            <Box className="flex items-center justify-between">
              <Box className="flex items-center gap-3">
                <Box className="bg-green-100 p-2 rounded-full">
                  <FilterList sx={{ color: '#16a34a', fontSize: 24 }} />
                </Box>
                <Box className="flex-1">
                  <Typography variant="h6" className="font-bold text-gray-800 mb-1">Filter Master Data</Typography>
                  <Typography variant="body2" className="text-gray-600">Saring data berdasarkan kriteria</Typography>
                </Box>
              </Box>
              <Button onClick={() => setFilterOpen(!filterOpen)} variant="outlined" size="small" sx={{ color: '#16a34a', borderColor: '#16a34a', '&:hover': { borderColor: '#16a34a', backgroundColor: '#dbeafe' } }}>
                {filterOpen ? 'Tutup' : 'Buka'} Filter
              </Button>
            </Box>
          }/>
        <Collapse in={filterOpen}>
          <Divider />
          <CardContent className="p-6">
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter Status</InputLabel>
                  <Select value={statusFilter} label="Filter Status" onChange={(e) => setStatusFilter(e.target.value)} sx={{ borderRadius: 2 }}>
                    <MenuItem value="">Semua Status</MenuItem>
                    <MenuItem value="aktif">Aktif</MenuItem>
                    <MenuItem value="nonaktif">Non-Aktif</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button onClick={() => setStatusFilter('')} variant="outlined" size="small" startIcon={<Close />} sx={{ color: '#6b7280', borderColor: '#d1d5db', borderRadius: 2, '&:hover': { borderColor: '#9ca3af', backgroundColor: '#f9fafb' } }} fullWidth>Reset Filter</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Collapse>
      </Card>
    </Fade>
  );

  const renderTabs = () => (
    <Fade in={true} timeout={700}>
      <Card className="shadow-lg rounded-2xl">
        <Box className="bg-gradient-to-r from-green-700 to-green-800 p-4">
          <Tabs 
             value={activeTab} 
              onChange={handleTabChange} 
              aria-label="Master data tabs"
              // ✅ PENGATURAN BARU: Selalu bisa di-scroll agar semua tab muat
              variant="scrollable"
              scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { color: '#bbf7d0', fontWeight: 600, textTransform: 'none', minWidth: 100, '&.Mui-selected': { color: 'white' } },
              '& .MuiTabs-indicator': { backgroundColor: 'white', height: 3, borderRadius: 2 }
            }}>
            <Tab label={<Box className="flex items-center gap-2"><Business />{!isMobile && 'Data PT'}</Box>} />
            <Tab label={<Box className="flex items-center gap-2"><LocalOffer />{!isMobile && 'Data Brand'}</Box>} />
            <Tab label={<Box className="flex items-center gap-2"><AccountBalance />{!isMobile && 'Data Samsat'}</Box>} />
            <Tab label={<Box className="flex items-center gap-2"><LocationOn />{!isMobile && 'Data Wilayah'}</Box>} />
          </Tabs>
        </Box>
      </Card>
    </Fade>
  );
  
  // RESPONSIVE: New function to render data as a list of cards on mobile
  const renderCardList = () => {
    const data = getCurrentData();
    const _config = getTabConfig();
    const filteredData = statusFilter ? data.filter(item => item.status === statusFilter) : data;

    return (
        <Box className="space-y-4">
            {filteredData.map((row, index) => (
                <Card key={row.id} className="shadow-md rounded-xl">
                    <CardContent className="space-y-2 p-4">
                        <Box display="flex" justifyContent="space-between" alignItems="start">
                            <Box>
                                <Typography variant="h6" className="font-bold text-gray-800">{getFieldName(row) || "-"}</Typography>
                                <Typography variant="body2" color="text.secondary" className="font-mono">{`#${getFieldCode(row) || "-"}`}</Typography>
                            </Box>
                            <Chip label={`#${index + 1}`} size="small" color="primary" variant="outlined" />
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        {activeTab === 2 && ( // Specific fields for Samsat
                          <>
                            <Typography variant="body2"><strong>Wilayah:</strong> {row.wilayah || "-"}</Typography>
                            <Typography variant="body2"><strong>Wilayah Cakupan:</strong> {row.wilayah_cakupan || "-"}</Typography>
                          </>
                        )}
                        {activeTab === 3 && ( // Specific fields for Wilayah
                          <>
                             <Typography variant="body2">
                                <strong>Wilayah Cakupan:</strong>
                                {' '}
                                {wilayahCakupanData
                                  .filter(cakupan => cakupan.wilayah_induk && cakupan.wilayah_induk.id === row.id)
                                  .map(cakupan => cakupan.nama_wilayah)
                                  .filter((value, index, self) => self.indexOf(value) === index)
                                  .join(', ') || "-"}
                              </Typography>
                          </>
                        )}
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                        <IconButton size="small" onClick={() => handleEdit(row)} sx={{ color: '#f59e0b' }}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleDelete(row)} sx={{ color: '#dc2626' }}><Delete fontSize="small" /></IconButton>
                    </CardActions>
                </Card>
            ))}
        </Box>
    );
  };


  const renderTable = () => {
    const data = getCurrentData();
    const loading = getCurrentLoading();
    const error = getCurrentError();
    const config = getTabConfig();
    const columns = getTableColumns();
    const filteredData = statusFilter ? data.filter(item => item.status === statusFilter) : data;

    return (
      <Slide direction="up" in={true} timeout={800}>
        <Card className="shadow-lg rounded-2xl mb-6">
          <Box className="p-4 border-b bg-green-50 border-green-200">
            {/* RESPONSIVE: Header box now stacks on mobile */}
            <Box sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2
            }}>
              <Box className="flex items-center gap-3">
                <Box className="p-2 rounded-full shadow-sm bg-white"><config.icon sx={{ color: '#16a34a', fontSize: 24 }} /></Box>
                <Box>
                  <Typography variant="h6" className="font-bold text-gray-800">{config.title}</Typography>
                  <Typography variant="body2" className="text-green-700 font-medium">{filteredData.length} data</Typography>
                </Box>
              </Box>
              <Box className="flex items-center gap-2 w-full sm:w-auto">
                {loading && (
                  <Box className="flex items-center gap-2 bg-white px-3 py-1 rounded-full">
                    <CircularProgress size={16} sx={{ color: '#16a34a' }} />
                    <Typography variant="body2" className="text-gray-600 font-medium">Loading...</Typography>
                  </Box>
                )}
                {/* RESPONSIVE: Buttons will now be full-width on mobile if needed */}
                <Button onClick={handleAddNew} variant="contained" startIcon={<Add />} sx={{ bgcolor: '#16a34a', color: 'white', px: 3, py: 1, borderRadius: 2, fontWeight: 600, '&:hover': { bgcolor: '#15803d' }, flexGrow: 1 }}>Tambah</Button>
                {activeTab === 3 && (
                  <Button onClick={handleAddWilayahCakupan} variant="outlined" startIcon={<Map />} sx={{ color: '#16a34a', borderColor: '#16a34a', px: 3, py: 1, borderRadius: 2, fontWeight: 600, '&:hover': { borderColor: '#15803d', backgroundColor: '#f0fdf4' }, flexGrow: 1 }}>Wil. Cakupan</Button>
                )}
              </Box>
            </Box>
          </Box>
          <CardContent sx={{ p: { xs: 2, sm: 0 } }}> {/* RESPONSIVE: Adjust padding for mobile */}
            {error && <Box className="p-6"><Alert severity="error" className="rounded-xl">{error}</Alert></Box>}
            {filteredData.length === 0 ? (
              <Box className="text-center py-16">
                <Box className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"><config.icon sx={{ fontSize: 48, color: '#9ca3af' }} /></Box>
                <Typography variant="h6" className="text-gray-500 mb-2 font-semibold">{config.emptyMessage}</Typography>
                <Typography variant="body2" className="text-gray-400">Klik "Tambah Data" untuk menambahkan data baru</Typography>
              </Box>
            ) : (
                // RESPONSIVE: Conditional rendering based on screen size
                isMobile ? renderCardList() : (
                <TableContainer component={Paper} className="max-h-96">
                    <Table stickyHeader>
                    <TableHead>
                        <TableRow>{columns.map((column) => (<TableCell key={column.id} className="bg-green-100 font-bold text-green-800" style={{ minWidth: column.minWidth, textAlign: column.align || 'left' }}>{column.label}</TableCell>))}</TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.map((row, index) => (
                        <TableRow key={row.id} hover className="cursor-pointer">
                            {(activeTab === 0 || activeTab === 1) && (<><TableCell className="font-mono text-sm">{index + 1}</TableCell><TableCell className="font-medium">{getFieldName(row) || "-"}</TableCell><TableCell className="font-mono text-sm">{getFieldCode(row) || "-"}</TableCell></>)}
                            {activeTab === 2 && (<><TableCell className="font-mono text-sm">{index + 1}</TableCell><TableCell className="font-medium">{row.wilayah || "-"}</TableCell><TableCell className="font-medium">{row.wilayah_cakupan || "-"}</TableCell><TableCell className="font-medium">{getFieldName(row) || "-"}</TableCell><TableCell className="font-mono text-sm">{getFieldCode(row) || "-"}</TableCell></>)}
                            {activeTab === 3 && (<><TableCell className="font-mono text-sm">{index + 1}</TableCell><TableCell className="font-medium">{getFieldName(row) || "-"}</TableCell><TableCell className="font-medium">{wilayahCakupanData.filter(cakupan => cakupan.wilayah_induk && cakupan.wilayah_induk.id === row.id).map(cakupan => cakupan.nama_wilayah).filter((value, index, self) => self.indexOf(value) === index).join(', ') || "-"}</TableCell></>)}
                            <TableCell style={{ textAlign: 'center' }}><Box className="flex justify-center gap-1"><Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(row)} sx={{ color: '#f59e0b', '&:hover': { backgroundColor: '#fef3c7' } }}><Edit fontSize="small" /></IconButton></Tooltip><Tooltip title="Hapus"><IconButton size="small" onClick={() => handleDelete(row)} sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fecaca' } }}><Delete fontSize="small" /></IconButton></Tooltip></Box></TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
              )
            )}
          </CardContent>
        </Card>
      </Slide>
    );
  };
  
  const renderFormFields = () => { /* No changes needed */
      switch (activeTab) {
      case 0: return (<><TextField label="Nama PT" fullWidth variant="outlined" value={formData.nama_pt} onChange={(e) => setFormData({ ...formData, nama_pt: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'white' } }}/><TextField label="Kode PT" fullWidth variant="outlined" value={formData.kode_pt} onChange={(e) => setFormData({ ...formData, kode_pt: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'white' } }}/></>);
      case 1: return (<><TextField label="Nama Brand" fullWidth variant="outlined" value={formData.nama_brand} onChange={(e) => setFormData({ ...formData, nama_brand: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'white' } }}/><TextField label="Kode Brand" fullWidth variant="outlined" value={formData.kode_brand} onChange={(e) => setFormData({ ...formData, kode_brand: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'white' } }}/></>);
      case 2: return (<><TextField label="Nama Samsat" fullWidth variant="outlined" value={formData.nama_samsat} onChange={(e) => setFormData({ ...formData, nama_samsat: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'white' } }}/><TextField label="Kode Samsat" fullWidth variant="outlined" value={formData.kode_samsat} onChange={(e) => setFormData({ ...formData, kode_samsat: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'white' } }}/><FormControl fullWidth><InputLabel>Wilayah Cakupan</InputLabel><Select value={formData.wilayah_cakupan_id} label="Wilayah Cakupan" onChange={(e) => setFormData({ ...formData, wilayah_cakupan_id: e.target.value })} sx={{ borderRadius: 2 }}>{samsatWilayahCakupanData.map((wilayah) => (<MenuItem key={wilayah.id_wilayah_cakupan} value={wilayah.id_wilayah_cakupan}>{wilayah.nama_wilayah_cakupan}</MenuItem>))}</Select></FormControl></>);
      case 3: return (<><TextField label="Nama Wilayah" fullWidth variant="outlined" value={formData.nama_wilayah} onChange={(e) => setFormData({ ...formData, nama_wilayah: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'white' } }}/></>);
      default: return null;
    }
  };

  return (
    <Box className="space-y-6">
      {renderFilter()}
      {renderTabs()}
      {renderTable()}

      {/* Dialogs */}
      {/* Add Wilayah Cakupan Dialog */}
      <Dialog open={addWilayahCakupanDialog} onClose={() => setAddWilayahCakupanDialog(false)} maxWidth="sm" fullWidth PaperProps={{ className: "rounded-2xl" }}>
        <DialogTitle className="bg-gradient-to-r from-blue-50 to-blue-100 p-6">
          <Box className="flex justify-between items-center">
            <Box className="flex items-center gap-3"><Box className="bg-blue-100 p-2 rounded-full"><Map sx={{ color: '#2563eb', fontSize: 24 }} /></Box><Box><Typography variant="h6" className="text-blue-800 font-bold">Tambah Wilayah Cakupan</Typography><Typography variant="body2" className="text-blue-600">Masukkan informasi wilayah cakupan baru</Typography></Box></Box>
            <IconButton onClick={() => setAddWilayahCakupanDialog(false)} sx={{ color: '#6b7280', '&:hover': { backgroundColor: '#f3f4f6' } }}><Close /></IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent className="p-6"><Box className="space-y-4"><TextField label="Nama Wilayah Cakupan" fullWidth variant="outlined" value={formData.nama_wilayah} onChange={(e) => setFormData({ ...formData, nama_wilayah: e.target.value })} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'white' } }}/><FormControl fullWidth><InputLabel>Wilayah Induk</InputLabel><Select value={formData.wilayah_id} label="Wilayah Induk" onChange={(e) => setFormData({ ...formData, wilayah_id: e.target.value })} sx={{ borderRadius: 2 }}>{wilayahData.map((wilayah) => (<MenuItem key={wilayah.id} value={wilayah.id}>{wilayah.nama_wilayah}</MenuItem>))}</Select></FormControl></Box></DialogContent>
        <Divider />
        {/* RESPONSIVE: Dialog actions stack on mobile */}
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'grey.50', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1 }}>
            <Button onClick={() => setAddWilayahCakupanDialog(false)} variant="outlined" startIcon={<Cancel />} fullWidth={isMobile} sx={{ color: '#6b7280', borderColor: '#d1d5db', borderRadius: 2, fontWeight: 600 }}>Batal</Button>
            <Button onClick={handleWilayahCakupanSubmit} variant="contained" startIcon={<Save />} fullWidth={isMobile} sx={{ bgcolor: '#2563eb', color: 'white', borderRadius: 2, fontWeight: 600, '&:hover': { bgcolor: '#1d4ed8' } }}>Simpan</Button>
        </DialogActions>
      </Dialog>

      {/* Add / Edit Dialogs */}
      <Dialog open={addDialog || editDialog} onClose={() => { setAddDialog(false); setEditDialog(false); }} maxWidth="sm" fullWidth PaperProps={{ className: "rounded-2xl" }}>
        <DialogTitle className="bg-gradient-to-r from-green-50 to-green-100 p-6">
          <Box className="flex justify-between items-center">
            <Box className="flex items-center gap-3"><Box className="bg-green-100 p-2 rounded-full">{editDialog ? <Edit sx={{ color: '#16a34a', fontSize: 24 }} /> : <Add sx={{ color: '#16a34a', fontSize: 24 }} />}</Box><Box><Typography variant="h6" className="text-green-800 font-bold">{editDialog ? 'Edit' : 'Tambah'} {getTabConfig().title}</Typography><Typography variant="body2" className="text-green-600">{editDialog ? 'Perbarui' : 'Masukkan'} informasi data</Typography></Box></Box>
            <IconButton onClick={() => { setAddDialog(false); setEditDialog(false); }} sx={{ color: '#6b7280', '&:hover': { backgroundColor: '#f3f4f6' } }}><Close /></IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent className="p-6"><Box className="space-y-4">{renderFormFields()}</Box></DialogContent>
        <Divider />
        {/* RESPONSIVE: Dialog actions stack on mobile */}
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'grey.50', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1 }}>
            <Button onClick={() => { setAddDialog(false); setEditDialog(false); }} variant="outlined" startIcon={<Cancel />} fullWidth={isMobile} sx={{ color: '#6b7280', borderColor: '#d1d5db', borderRadius: 2, fontWeight: 600 }}>Batal</Button>
            <Button onClick={handleFormSubmit} variant="contained" startIcon={<Save />} fullWidth={isMobile} sx={{ bgcolor: '#16a34a', color: 'white', borderRadius: 2, fontWeight: 600, '&:hover': { bgcolor: '#15803d' } }}>Simpan</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth PaperProps={{ className: "rounded-2xl" }}>
        <DialogTitle className="bg-gradient-to-r from-red-50 to-red-100 p-6">
          <Box className="flex justify-between items-center">
            <Box className="flex items-center gap-3"><Box className="bg-red-100 p-2 rounded-full"><Delete sx={{ color: '#dc2626', fontSize: 24 }} /></Box><Box><Typography variant="h6" className="text-red-800 font-bold">Hapus {getTabConfig().title}</Typography><Typography variant="body2" className="text-red-600">Konfirmasi penghapusan data</Typography></Box></Box>
            <IconButton onClick={() => setDeleteDialog(false)} sx={{ color: '#6b7280', '&:hover': { backgroundColor: '#f3f4f6' } }}><Close /></IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent className="p-6">{selectedRecord && (<Box className="text-center"><Typography variant="body1" className="text-gray-700 mb-4">Apakah Anda yakin ingin menghapus data <strong>{getFieldName(selectedRecord)}</strong>?</Typography><Typography variant="body2" className="text-red-600">Aksi ini tidak dapat dibatalkan.</Typography></Box>)}</DialogContent>
        <Divider />
        {/* RESPONSIVE: Dialog actions stack on mobile */}
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'grey.50', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1 }}>
            <Button onClick={() => setDeleteDialog(false)} variant="outlined" startIcon={<Cancel />} fullWidth={isMobile} sx={{ color: '#6b7280', borderColor: '#d1d5db', borderRadius: 2, fontWeight: 600 }}>Batal</Button>
            <Button onClick={handleDeleteConfirm} variant="contained" startIcon={<Delete />} fullWidth={isMobile} sx={{ bgcolor: '#dc2626', color: 'white', borderRadius: 2, fontWeight: 600, '&:hover': { bgcolor: '#b91c1c' } }}>Hapus</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MasterDataPage;