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
  Slide
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
  Cancel
} from "@mui/icons-material";

const BASE_URL = import.meta.env.VITE_API_URL + "/api";

const MasterDataPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState(0);
  
  // State untuk data master
  const [ptData, setPtData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [samsatData, setSamsatData] = useState([]);
  const [wilayahCakupanData, setWilayahCakupanData] = useState([]);
  
  // State untuk loading
  const [ptLoading, setPtLoading] = useState(false);
  const [brandLoading, setBrandLoading] = useState(false);
  const [samsatLoading, setSamsatLoading] = useState(false);
  
  // State untuk error
  const [ptError, setPtError] = useState(null);
  const [brandError, setBrandError] = useState(null);
  const [samsatError, setSamsatError] = useState(null);

  // State untuk dialog
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
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
    status: 'aktif'
  });

  // State untuk filter
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch wilayah cakupan untuk dropdown samsat
  const fetchWilayahCakupan = async () => {
    try {
      const response = await fetch(`${BASE_URL}/detail-otorisasi-samsat`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setWilayahCakupanData(data.data);
      }
    } catch (err) {
      console.error('Error fetching wilayah cakupan:', err);
    }
  };

  // Fetch data functions
  const fetchPtData = async () => {
    setPtLoading(true);
    setPtError(null);
    try {
      const response = await fetch(`${BASE_URL}/glbm-pt`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
      const response = await fetch(`${BASE_URL}/glbm-samsat`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setSamsatData(data.data);
      } else {
        setSamsatError(data.message || 'Failed to fetch Samsat data');
      }
    } catch (err) {
      setSamsatError(err.message);
    } finally {
      setSamsatLoading(false);
    }
  };

  // Effect untuk fetch data berdasarkan tab aktif
  useEffect(() => {
    // Fetch wilayah cakupan saat component mount
    fetchWilayahCakupan();
    
    switch (activeTab) {
      case 0:
        fetchPtData();
        break;
      case 1:
        fetchBrandData();
        break;
      case 2:
        fetchSamsatData();
        break;
      default:
        break;
    }
  }, [activeTab]);

  // Handler functions
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddNew = () => {
    setFormData({
      nama_pt: '',
      kode_pt: '',
      nama_brand: '',
      kode_brand: '',
      nama_samsat: '',
      kode_samsat: '',
      wilayah_cakupan_id: '',
      status: 'aktif'
    });
    setAddDialog(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setFormData({
      nama_pt: record.nama_pt || '',
      kode_pt: record.kode_pt || '',
      nama_brand: record.nama_brand || '',
      kode_brand: record.kode_brand || '',
      nama_samsat: record.nama_samsat || '',
      kode_samsat: record.kode_samsat || '',
      wilayah_cakupan_id: record.wilayah_cakupan_id || '',
      status: record.status || 'aktif'
    });
    setEditDialog(true);
  };

  const handleDelete = (record) => {
    setSelectedRecord(record);
    setDeleteDialog(true);
  };

  const handleFormSubmit = async () => {
    const isEdit = selectedRecord !== null;
    let endpoint, method, url, requestBody;

    if (isEdit) {
      // Edit endpoints - sesuai dengan backend
      switch (activeTab) {
        case 0: // PT
          endpoint = `/update-pt/${selectedRecord.id}`;
          requestBody = {
            nama_pt: formData.nama_pt,
            kode_pt: formData.kode_pt
          };
          break;
        case 1: // Brand
          endpoint = `/update-brand/${selectedRecord.id}`;
          requestBody = {
            nama_brand: formData.nama_brand,
            kode_brand: formData.kode_brand
          };
          break;
        case 2: // Samsat
          endpoint = `/glbm-samsat/${selectedRecord.id}`;
          requestBody = {
            nama_samsat: formData.nama_samsat,
            kode_samsat: formData.kode_samsat,
            wilayah_cakupan_id: parseInt(formData.wilayah_cakupan_id)
          };
          break;
      }
      method = 'PUT';
      url = `${BASE_URL}${endpoint}`;
    } else {
      // Add endpoints - tetap sama
      switch (activeTab) {
        case 0: // PT
          endpoint = '/add-pt';
          requestBody = {
            nama_pt: formData.nama_pt,
            kode_pt: formData.kode_pt
          };
          break;
        case 1: // Brand
          endpoint = '/add-brand';
          requestBody = {
            nama_brand: formData.nama_brand,
            kode_brand: formData.kode_brand
          };
          break;
        case 2: // Samsat
          endpoint = '/glbm-samsat/';
          requestBody = {
            nama_samsat: formData.nama_samsat,
            kode_samsat: formData.kode_samsat,
            wilayah_cakupan_id: parseInt(formData.wilayah_cakupan_id)
          };
          break;
      }
      method = 'POST';
      url = `${BASE_URL}${endpoint}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
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

  const handleDeleteConfirm = async () => {
    if (!selectedRecord) return;

    const deleteEndpoint = getDeleteEndpoint();
    try {
      const response = await fetch(`${BASE_URL}${deleteEndpoint}/${selectedRecord.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      // Check response based on endpoint format
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

  // Helper functions untuk delete endpoints
  const getDeleteEndpoint = () => {
    switch (activeTab) {
      case 0: return '/delete-pt';
      case 1: return '/delete-brand';
      case 2: return '/delete-glbm-samsat';
      default: return '/delete-pt';
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 0: return ptData;
      case 1: return brandData;
      case 2: return samsatData;
      default: return [];
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 0: return ptLoading;
      case 1: return brandLoading;
      case 2: return samsatLoading;
      default: return false;
    }
  };

  const getCurrentError = () => {
    switch (activeTab) {
      case 0: return ptError;
      case 1: return brandError;
      case 2: return samsatError;
      default: return null;
    }
  };

  const refreshCurrentData = () => {
    switch (activeTab) {
      case 0: fetchPtData(); break;
      case 1: fetchBrandData(); break;
      case 2: fetchSamsatData(); break;
      default: break;
    }
  };

  const getTabConfig = () => {
    const configs = [
      { label: 'Data PT', icon: Business, title: 'Data PT', emptyMessage: 'Belum ada data PT' },
      { label: 'Data Brand', icon: LocalOffer, title: 'Data Brand', emptyMessage: 'Belum ada data Brand' },
      { label: 'Data Samsat', icon: AccountBalance, title: 'Data Samsat', emptyMessage: 'Belum ada data Samsat' }
    ];
    return configs[activeTab];
  };

  const getFieldName = (record) => {
    switch (activeTab) {
      case 0: return record.nama_pt;
      case 1: return record.nama_brand;
      case 2: return record.nama_samsat;
      default: return record.nama || record.nama_pt || record.nama_brand || record.nama_samsat;
    }
  };

  const getFieldCode = (record) => {
    switch (activeTab) {
      case 0: return record.kode_pt;
      case 1: return record.kode_brand;
      case 2: return record.kode_samsat;
      default: return record.kode || record.kode_pt || record.kode_brand || record.kode_samsat;
    }
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
                  <Typography variant="h6" className="font-bold text-gray-800 mb-1">
                    Filter Master Data
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Saring data berdasarkan kriteria yang diinginkan
                  </Typography>
                </Box>
              </Box>
              <Button
                onClick={() => setFilterOpen(!filterOpen)}
                variant="outlined"
                size="small"
                sx={{ 
                  color: '#16a34a',
                  borderColor: '#16a34a',
                  '&:hover': {
                    borderColor: '#16a34a',
                    backgroundColor: '#dbeafe'
                  }
                }}>
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
                  <Select
                    value={statusFilter}
                    label="Filter Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ borderRadius: 2 }}>
                    <MenuItem value="">Semua Status</MenuItem>
                    <MenuItem value="aktif">Aktif</MenuItem>
                    <MenuItem value="nonaktif">Non-Aktif</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  onClick={() => setStatusFilter('')}
                  variant="outlined"
                  size="small"
                  startIcon={<Close />}
                  sx={{
                    color: '#6b7280',
                    borderColor: '#d1d5db',
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#9ca3af',
                      backgroundColor: '#f9fafb'
                    }
                  }}
                  fullWidth>
                  Reset Filter
                </Button>
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
            sx={{
              '& .MuiTab-root': {
                color: '#bbf7d0',
                fontWeight: 600,
                textTransform: 'none',
                '&.Mui-selected': {
                  color: 'white'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'white',
                height: 3,
                borderRadius: 2
              }
            }}>
            <Tab 
              label={
                <Box className="flex items-center gap-2">
                  <Business />
                  Data PT
                </Box>
              } />
            <Tab 
              label={
                <Box className="flex items-center gap-2">
                  <LocalOffer />
                  Data Brand
                </Box>
              } />
            <Tab 
              label={
                <Box className="flex items-center gap-2">
                  <AccountBalance />
                  Data Samsat
                </Box>
              } />
          </Tabs>
        </Box>
      </Card>
    </Fade>
  );

  const renderTable = () => {
    const data = getCurrentData();
    const loading = getCurrentLoading();
    const error = getCurrentError();
    const config = getTabConfig();

    // Filter data berdasarkan status
    const filteredData = statusFilter 
      ? data.filter(item => item.status === statusFilter)
      : data;

    return (
      <Slide direction="up" in={true} timeout={800}>
        <Card className="shadow-lg rounded-2xl mb-6">
          <Box className="p-4 border-b bg-green-50 border-green-200">
            <Box className="flex items-center justify-between">
              <Box className="flex items-center gap-3">
                <Box className="p-2 rounded-full shadow-sm bg-white">
                  <config.icon sx={{ color: '#16a34a', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" className="font-bold text-gray-800">
                    {config.title}
                  </Typography>
                  <Typography variant="body2" className="text-green-700 font-medium">
                    {filteredData.length} data
                  </Typography>
                </Box>
              </Box>
              <Box className="flex items-center gap-2">
                {loading && (
                  <Box className="flex items-center gap-2 bg-white px-3 py-1 rounded-full">
                    <CircularProgress size={16} sx={{ color: '#16a34a' }} />
                    <Typography variant="body2" className="text-gray-600 font-medium">
                      Loading...
                    </Typography>
                  </Box>
                )}
                <Button
                  onClick={handleAddNew}
                  variant="contained"
                  startIcon={<Add />}
                  sx={{
                    bgcolor: '#16a34a',
                    color: 'white',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#15803d'
                    }
                  }}>
                  Tambah Data
                </Button>
              </Box>
            </Box>
          </Box>

          <CardContent className="p-0">
            {error && (
              <Box className="p-6">
                <Alert severity="error" className="rounded-xl">
                  {error}
                </Alert>
              </Box>
            )}

            {filteredData.length === 0 ? (
              <Box className="text-center py-16">
                <Box className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <config.icon sx={{ fontSize: 48, color: '#9ca3af' }} />
                </Box>
                <Typography variant="h6" className="text-gray-500 mb-2 font-semibold">
                  {config.emptyMessage}
                </Typography>
                <Typography variant="body2" className="text-gray-400">
                  Klik "Tambah Data" untuk menambahkan data baru
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} className="max-h-96">
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell className="bg-green-100 font-bold text-green-800">No</TableCell>
                      <TableCell className="bg-green-100 font-bold text-green-800">
                        {activeTab === 0 ? 'Nama PT' : activeTab === 1 ? 'Nama Brand' : 'Nama Samsat'}
                      </TableCell>
                      <TableCell className="bg-green-100 font-bold text-green-800">
                        {activeTab === 0 ? 'Kode PT' : activeTab === 1 ? 'Kode Brand' : 'Kode Samsat'}
                      </TableCell>
                      <TableCell className="bg-green-100 font-bold text-green-800 justify-center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData.map((row, index) => (
                      <TableRow 
                        key={row.id} 
                        hover 
                        className="cursor-pointer">
                        <TableCell className="font-mono text-sm">{index + 1}</TableCell>
                        <TableCell className="font-medium">{getFieldName(row) || "-"}</TableCell>
                        <TableCell className="font-mono text-sm">{getFieldCode(row) || "-"}</TableCell>
                        <TableCell>
                          <Box className="justify-center gap-1">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(row)}
                                sx={{ 
                                  color: '#f59e0b',
                                  '&:hover': { 
                                    backgroundColor: '#fef3c7' 
                                  }
                                }}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Hapus">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(row)}
                                sx={{ 
                                  color: '#dc2626',
                                  '&:hover': { 
                                    backgroundColor: '#fecaca' 
                                  }
                                }}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Slide>
    );
  };

  const renderFormFields = () => {
    switch (activeTab) {
      case 0: // PT
        return (
          <>
            <TextField
              label="Nama PT"
              fullWidth
              variant="outlined"
              value={formData.nama_pt}
              onChange={(e) => setFormData({ ...formData, nama_pt: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white'
                }
              }}/>
            <TextField
              label="Kode PT"
              fullWidth
              variant="outlined"
              value={formData.kode_pt}
              onChange={(e) => setFormData({ ...formData, kode_pt: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white'
                }
              }}/>
          </>
        );
      case 1: // Brand
        return (
          <>
            <TextField
              label="Nama Brand"
              fullWidth
              variant="outlined"
              value={formData.nama_brand}
              onChange={(e) => setFormData({ ...formData, nama_brand: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white'
                }
              }}/>
            <TextField
              label="Kode Brand"
              fullWidth
              variant="outlined"
              value={formData.kode_brand}
              onChange={(e) => setFormData({ ...formData, kode_brand: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white'
                }
              }}/>
          </>
        );
      case 2: // Samsat
        return (
          <>
            <TextField
              label="Nama Samsat"
              fullWidth
              variant="outlined"
              value={formData.nama_samsat}
              onChange={(e) => setFormData({ ...formData, nama_samsat: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white'
                }
              }}/>
            <TextField
              label="Kode Samsat"
              fullWidth
              variant="outlined"
              value={formData.kode_samsat}
              onChange={(e) => setFormData({ ...formData, kode_samsat: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white'
                }
              }}/>
            <FormControl fullWidth>
              <InputLabel>Wilayah Cakupan</InputLabel>
              <Select
                value={formData.wilayah_cakupan_id}
                label="Wilayah Cakupan"
                onChange={(e) => setFormData({ ...formData, wilayah_cakupan_id: e.target.value })}
                sx={{ borderRadius: 2 }}>
                {wilayahCakupanData.map((wilayah) => (
                  <MenuItem key={wilayah.id_wilayah_cakupan} value={wilayah.id_wilayah_cakupan}>
                    {wilayah.nama_wilayah_cakupan}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box className="space-y-6">
      {/* Filter Component */}
      {renderFilter()}

      {/* Tabs */}
      {renderTabs()}

      {/* Table Content */}
      {renderTable()}

      {/* Add Dialog */}
      <Dialog
        open={addDialog}
        onClose={() => setAddDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "rounded-2xl"
        }}>
        <DialogTitle className="bg-gradient-to-r from-green-50 to-green-100 p-6">
          <Box className="flex justify-between items-center">
            <Box className="flex items-center gap-3">
              <Box className="bg-green-100 p-2 rounded-full">
                <Add sx={{ color: '#16a34a', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" className="text-green-800 font-bold">
                  Tambah {getTabConfig().title}
                </Typography>
                <Typography variant="body2" className="text-green-600">
                  Masukkan informasi data baru
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setAddDialog(false)}
              sx={{
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: '#f3f4f6'
                }
              }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent className="p-6">
          <Box className="space-y-4">
            {renderFormFields()}
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions className="p-6 bg-gray-50">
          <Box className="flex gap-3 w-full justify-end">
            <Button
              onClick={() => setAddDialog(false)}
              variant="outlined"
              startIcon={<Cancel />}
              sx={{
                color: '#6b7280',
                borderColor: '#d1d5db',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb'
                }
              }}>
              Batal
            </Button>
            <Button
              onClick={handleFormSubmit}
              variant="contained"
              startIcon={<Save />}
              sx={{
                bgcolor: '#16a34a',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#15803d'
                }
              }}>
              Simpan
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "rounded-2xl"
        }}>
        <DialogTitle className="bg-gradient-to-r from-green-50 to-green-100 p-6">
          <Box className="flex justify-between items-center">
            <Box className="flex items-center gap-3">
              <Box className="bg-green-100 p-2 rounded-full">
                <Edit sx={{ color: '#16a34a', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" className="text-green-800 font-bold">
                  Edit {getTabConfig().title}
                </Typography>
                <Typography variant="body2" className="text-green-600">
                  Perbarui informasi data
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setEditDialog(false)}
              sx={{
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: '#f3f4f6'
                }
              }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent className="p-6">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} className="space-y-4">
            {renderFormFields()}
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions className="p-6 bg-gray-50">
          <Box className="flex gap-3 w-full justify-end">
            <Button
              onClick={() => setEditDialog(false)}
              variant="outlined"
              startIcon={<Cancel />}
              sx={{
                color: '#6b7280',
                borderColor: '#d1d5db',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb'
                }
              }}>
              Batal
            </Button>
            <Button
              onClick={handleFormSubmit}
              variant="contained"
              startIcon={<Save />}
              sx={{
                bgcolor: '#16a34a',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#15803d'
                }
              }}>
              Simpan
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "rounded-2xl"
        }}>
        <DialogTitle className="bg-gradient-to-r from-red-50 to-red-100 p-6">
          <Box className="flex justify-between items-center">
            <Box className="flex items-center gap-3">
              <Box className="bg-red-100 p-2 rounded-full">
                <Delete sx={{ color: '#dc2626', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" className="text-red-800 font-bold">
                  Hapus {getTabConfig().title}
                </Typography>
                <Typography variant="body2" className="text-red-600">
                  Konfirmasi penghapusan data
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setDeleteDialog(false)}
              sx={{
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: '#f3f4f6'
                }
              }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent className="p-6">
          {selectedRecord && (
            <Box className="text-center">
              <Typography variant="body1" className="text-gray-700 mb-4">
                Apakah Anda yakin ingin menghapus data <strong>{getFieldName(selectedRecord)}</strong>?
              </Typography>
              <Typography variant="body2" className="text-red-600">
                Aksi ini tidak dapat dibatalkan.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions className="p-6 bg-gray-50">
          <Box className="flex gap-3 w-full justify-end">
            <Button
              onClick={() => setDeleteDialog(false)}
              variant="outlined"
              startIcon={<Cancel />}
              sx={{
                color: '#6b7280',
                borderColor: '#d1d5db',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb'
                }
              }}>
              Batal
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              startIcon={<Delete />}
              sx={{
                bgcolor: '#dc2626',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#b91c1c'
                }
              }}>
              Hapus
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MasterDataPage;