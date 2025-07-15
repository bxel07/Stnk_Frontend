import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { fetchStnkList, fetchStnkListByCorrection, fetchStnkListByDate, editStnk,   updateStnkInfoThunk } from "@/slices/stnkSlice";
  // Filter data based on date when data or filter changes
import { useCallback } from "react";
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
  Collapse
} from "@mui/material";
import Swal from "sweetalert2";
import ProtectedImage from "@/components/ProtectedImage";


const BASE_URL = import.meta.env.VITE_API_URL + "/api";


const STNKDataTable = () => {

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role || "";


  // Redux state
  const { list: stnkData, loading, error } = useSelector((state) => state.stnk);

  // Local state
  const [detailDialog, setDetailDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [correctionData, setCorrectionData] = useState([]);
  const [correctionLoading, setCorrectionLoading] = useState(false);
  const [correctionError, setCorrectionError] = useState(null);
  // Tambahkan di deklarasi state yang sudah ada
const [kodeSamsatFilter, setKodeSamsatFilter] = useState('');
const [uniqueKodeSamsat, setUniqueKodeSamsat] = useState([]);
const [ptFilter, setPTFilter] = useState('');
const [brandFilter, setBrandFilter] = useState('');
const [uniquePT, setUniquePT] = useState([]);
const [uniqueBrand, setUniqueBrand] = useState([]);

  // State for correction form
  const [correctionForm, setCorrectionForm] = useState({
    nomor_rangka: '',
    
  });
  
  // State for saving correction
  const [savingCorrection, setSavingCorrection] = useState(false);

  // State for date filter
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    selectedDate: '',
    filterType: 'all' // 'all', 'today', 'yesterday', 'custom'
  });
  const [filteredData, setFilteredData] = useState([]);
  const [filteredCorrectionData, setFilteredCorrectionData] = useState([]);
  const [dateFilterLoading, setDateFilterLoading] = useState(false);
 
  
 // ✅ PERTAMA: Ambil data dari API saat awal
useEffect(() => {
  dispatch(fetchStnkList());
}, [dispatch]);

// ✅ KEDUA: Setelah stnkData diisi, langsung isi filteredData
useEffect(() => {
  if (!Array.isArray(stnkData)) return;

  let filtered = [...stnkData];

  // ✅ Filter berdasarkan Kode Samsat
  if (kodeSamsatFilter && kodeSamsatFilter !== "all") {
    filtered = filtered.filter(item => item.kode_samsat === kodeSamsatFilter);
  }

  // ✅ Filter berdasarkan PT
  if (ptFilter) {
    filtered = filtered.filter(item => item.nama_pt === ptFilter);
  }

  // ✅ Filter berdasarkan Brand
  if (brandFilter) {
    filtered = filtered.filter(item => item.nama_brand === brandFilter);
  }

  // ✅ Filter berdasarkan tanggal
  if (dateFilter.filterType === "today") {
    const todayStr = new Date().toISOString().split("T")[0];
    filtered = filtered.filter(item => {
      const created = new Date(item.created_at).toISOString().split("T")[0];
      return created === todayStr;
    });
  } else if (
    dateFilter.filterType === "range" &&
    dateFilter.startDate &&
    dateFilter.endDate
  ) {
    const start = new Date(dateFilter.startDate);
    const end = new Date(dateFilter.endDate);

    filtered = filtered.filter(item => {
      const created = new Date(item.created_at);
      return created >= start && created <= end;
    });
  }

  setFilteredData(filtered);
}, [stnkData, kodeSamsatFilter, ptFilter, brandFilter, dateFilter]);


// ✅ Ambil daftar unik PT, Brand, dan Kode Samsat dari data
useEffect(() => {
  if (!Array.isArray(stnkData)) return;

  const uniqueSamsat = [...new Set(stnkData.map(item => item.kode_samsat).filter(Boolean))];
  const uniquePT = [...new Set(stnkData.map(item => item.nama_pt).filter(Boolean))];
  const uniqueBrand = [...new Set(stnkData.map(item => item.nama_brand).filter(Boolean))];

  setUniqueKodeSamsat(uniqueSamsat);
  setUniquePT(uniquePT);
  setUniqueBrand(uniqueBrand);
}, [stnkData]);

  

  const handleFilterTypeChange = (type) => {
    setDateFilter(prev => ({
      ...prev,
      filterType: type,
      selectedDate: type !== 'custom' ? '' : prev.selectedDate
    }));
  };

  const handleDateChange = (value) => {
    setDateFilter(prev => ({
      ...prev,
      selectedDate: value
    }));
  };

  const clearFilter = () => {
    setDateFilter({
      selectedDate: '',
      filterType: 'all'
    });
    setKodeSamsatFilter('');
    setPTFilter('');
    setBrandFilter('');
  };
  

  const getFilterLabel = () => {
    const dateLabels = [];
    const otherLabels = [];

    switch (dateFilter.filterType) {
      case 'today':
        return 'Hari Ini';
      case 'yesterday':
        return 'Kemarin';
      case 'custom':
        if (dateFilter.selectedDate) {
          return new Date(dateFilter.selectedDate).toLocaleDateString('id-ID');
        }
        return '';
      case 'all':
      default:
        return '';
    }

    if (kodeSamsatFilter) {
      otherLabels.push(`Samsat: ${kodeSamsatFilter}`);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailDialog(true);
  };

  const handleEditCorrection = (record) => {
    setSelectedRecord(record);
    // Initialize correction form with current data
    setCorrectionForm({
      nomor_rangka: record.nomor_rangka || '',
      kode_samsat: record.kode_samsat || '',
    });
    setEditDialog(true);
  };

  const handleCorrectionFormChange = (field, value) => {
    setCorrectionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveCorrection = async () => {
  if (!selectedRecord?.id) return;

  setSavingCorrection(true);

  const formattedData = Object.entries(correctionForm || {})
    .filter(([, value]) => value && value.trim() !== "")
    .map(([key, value]) => ({
      field_name: key,
      corrected_value: value.trim(),
    }));

  try {
    if (formattedData.length === 0) {
      setSavingCorrection(false);
      return;
    }

    // Simpan koreksi ke backend
    await dispatch(editStnk({
      id: selectedRecord.id,
      data: formattedData,
    })).unwrap();

    window.location.reload();

    // Tutup dialog
    setEditDialog(false);
  } catch (error) {
    console.error("Gagal menyimpan koreksi:", error);
  } finally {
    setSavingCorrection(false);
  }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDelete = async (row) => {
    const confirm = await Swal.fire({
      title: `Hapus data STNK?`,
      text: `Data nomor rangka "${row.nomor_rangka}" akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
    });
  
    if (confirm.isConfirmed) {
      try {
        await dispatch(deleteStnk(row.id)).unwrap();
        toast.success("Data berhasil dihapus.");
      } catch (err) {
        toast.error(err.message || "Gagal menghapus data.");
      }
    }
  };

  // Render filter component
  const renderFilter = () => (
    <Card className="shadow-sm mb-4">
      <CardHeader
        title={
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-2">
              <i className="bi bi-funnel text-xl text-gray-600"></i>
              <Typography variant="h6" className="font-semibold">
                Filter Data
              </Typography>
           
{getFilterLabel() && (
  <Box className="flex flex-wrap gap-1 ml-2">
    {getFilterLabel().split(' • ').map((label, index) => (
      <Chip 
        key={index}
        label={label} 
        size="small" 
        color="primary" 
        onDelete={clearFilter}
      />
    ))}
  </Box>
)}
              {dateFilterLoading && (
                <CircularProgress size={16} />
              )}
            </Box>
            <Button
              onClick={() => setFilterOpen(!filterOpen)}
              size="small"
              className="text-gray-600"
            >
              {filterOpen ? 'Tutup' : 'Buka'} Filter
            </Button>
          </Box>
        }
      />
      <Collapse in={filterOpen}>
        <Divider />
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter Tanggal</InputLabel>
                <Select
                  value={dateFilter.filterType}
                  label="Filter Tanggal"
                  onChange={(e) => handleFilterTypeChange(e.target.value)}
                >
                  <MenuItem value="all">Semua Data</MenuItem>
                  <MenuItem value="today">Hari Ini</MenuItem>
                  <MenuItem value="yesterday">Kemarin</MenuItem>
                  <MenuItem value="custom">Pilih Tanggal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4} sm={6}>
  <FormControl fullWidth size="small">
    <InputLabel>Filter PT</InputLabel>
    <Select
      value={ptFilter}
      label="Filter PT"
      onChange={(e) => setPTFilter(e.target.value)}
    >
      <MenuItem value="">Semua PT</MenuItem>
      {uniquePT.map((pt, index) => (
        <MenuItem key={index} value={pt}>
          {pt}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>

<Grid item xs={12} sm={4}>
  <FormControl fullWidth size="small">
    <InputLabel>Filter Brand</InputLabel>
    <Select
      value={brandFilter}
      label="Filter Brand"
      onChange={(e) => setBrandFilter(e.target.value)}
    >
      <MenuItem value="">Semua Brand</MenuItem>
      {uniqueBrand.map((brand, index) => (
        <MenuItem key={index} value={brand}>
          {brand}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>

            
            {dateFilter.filterType === 'custom' && (
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Pilih Tanggal"
                  type="date"
                  value={dateFilter.selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={1000}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter Kode Samsat</InputLabel>
                <Select value={kodeSamsatFilter} label="Filter Kode Samsat"onChange={(e) => setKodeSamsatFilter(e.target.value)}>
                  <MenuItem value="">Semua Kode Samsat</MenuItem>
                  {uniqueKodeSamsat.map((kode) => (
                    <MenuItem key={kode} value={kode}>
                      {kode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                onClick={clearFilter}
                variant="outlined"
                size="small"
                startIcon={<i className="bi bi-x-circle"></i>}
                className="text-gray-600 border-gray-300"
                disabled={dateFilterLoading}
              >
                Reset Filter
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>
    </Card>
  );

  const [zoomImage, setZoomImage] = useState(null);

  const handleZoomImage = (imageUrl) => {
    setZoomImage(imageUrl);
  };

  const handleCloseZoom = () => {
    setZoomImage(null);
  };


  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const handleOpenEditDialog = (row) => {
    setEditRecord(row);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditRecord(null);
  };

  const handleEditSubmit = () => {
  if (!editRecord?.id) return;

  dispatch(updateStnkInfoThunk({
    id: editRecord.id,
    data: {
      nomor_rangka: editRecord.nomor_rangka,
      jumlah: editRecord.jumlah,
      kode_samsat: editRecord.kode_samsat // ✅ Tambahan
    }    
  }))
    .unwrap()
    .then(() => {
      toast.success("Data berhasil diperbarui");
      setEditDialogOpen(false);
    })
    .catch((err) => {
      toast.error(err.message || "Gagal memperbarui data");
    });
};


  const renderTable = (data, isLoading, tableError, tableTitle, emptyMessage) => {
    const safeData = Array.isArray(data) ? data : [];
    const totalGambar = safeData.filter(d => !!d.image_url).length;

    const formatRupiah = (angka) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(angka || 0);
    };

    return (
        <>
          <Card className="shadow-md mb-4">
            <CardHeader
              title={
                <Box className="flex items-center justify-between">
                  <Box className="flex items-center gap-2">
                    <i className="bi bi-table text-xl text-gray-600"></i>
                    <Typography variant="h6" className="font-semibold">
                      {tableTitle} ({safeData.length} data, {totalGambar} gambar)
                    </Typography>
                  </Box>
                  {isLoading && (
                    <Box className="flex items-center gap-2">
                      <CircularProgress size={20} />
                      <Typography variant="body2" className="text-gray-500">Loading...</Typography>
                    </Box>
                  )}
                </Box>
              }
            />
            <Divider />
            <CardContent className="p-0">
              {tableError && (
                <Box className="p-4">
                  <Alert severity="error">{tableError}</Alert>
                </Box>
              )}

              {safeData.length === 0 ? (
                <Box className="text-center py-12">
                  <i className="bi bi-inbox text-6xl text-gray-300 mb-4 block"></i>
                  <Typography variant="h6" className="text-gray-500 mb-2">{emptyMessage}</Typography>
                  <Typography variant="body2" className="text-gray-400">
                    {activeTab === 0 ? "Upload gambar STNK untuk menambah data" : "Belum ada data koreksi STNK"}
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} className="max-h-96">
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell className="bg-gray-100 font-bold text-gray-700">Gambar</TableCell>
                        <TableCell className="bg-gray-100 font-bold text-gray-700">File</TableCell>
                        <TableCell className="bg-gray-100 font-bold text-gray-700">Nomor Rangka</TableCell>
                        <TableCell className="bg-gray-100 font-bold text-gray-700">Jumlah (Rp)</TableCell> {/* BARU */}
                        <TableCell className="bg-gray-100 font-bold text-gray-700">Kode Samsat</TableCell> 
                        <TableCell className="bg-gray-100 font-bold text-gray-700">Tanggal Dibuat</TableCell>
                        <TableCell className="bg-gray-100 font-bold text-gray-700">PT</TableCell>
                        <TableCell className="bg-gray-100 font-bold text-gray-700">Brand</TableCell>
                        <TableCell className="bg-gray-100 font-bold text-gray-700 text-center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {safeData.map((row) => (
                        <TableRow key={row.id} hover className="cursor-pointer">
                          <TableCell>
                              {row.image_url ? (
                                <ProtectedImage
                                  path={row.image_url} // cukup kirim path, bukan full URL
                                  alt="preview"
                                  className="h-12 rounded shadow cursor-zoom-in hover:opacity-80"
                                  onClick={() => handleZoomImage(`${row.image_url}`)}
                                />
                              ) : "-"}
                            </TableCell>
                          <TableCell className="font-mono text-sm font-medium">{row.file || "-"}</TableCell>
                          <TableCell className="font-mono text-sm font-medium">{row.nomor_rangka || "-"}</TableCell>
                          <TableCell className="font-mono text-sm text-green-700 font-semibold"> {/* BARU */}
                            {formatRupiah(row.jumlah)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{row.kode_samsat || "-"}</TableCell> {/* ✅ Tambahan */}
                         
                        
                          <TableCell className="text-sm">
                            {row.created_at
                              ? new Date(row.created_at).toLocaleString("id-ID", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{row.nama_pt || "-"}</TableCell>
                          <TableCell className="font-mono text-sm">{row.nama_brand || "-"}</TableCell>
                          
                          <TableCell>
                            <Box className="flex justify-left">
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetail(row)}
                                  className="text-blue-600 hover:bg-blue-50"
                                >
                                  <i className="bi bi-eye"></i>
                                </IconButton>
                              </Tooltip>

                              {(userRole === "admin" || userRole === "superadmin") && (
                              <Tooltip title="Edit Data">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEditDialog(row)}
                                  className="text-orange-600 hover:bg-orange-50"
                                >
                                  <i className="bi bi-pencil"></i>
                                </IconButton>
                              </Tooltip>
                            )}


                              {activeTab === 1 && (
                                <Tooltip title="Edit Correction">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditCorrection(row)}
                                    className="text-green-600 hover:bg-green-50"
                                  >
                                    <i className="bi bi-pencil-square"></i>
                                  </IconButton>
                                </Tooltip>
                              )}
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

            {/* Dialog Zoom Gambar */}
            <Dialog open={!!zoomImage} onClose={handleCloseZoom} maxWidth="md" fullWidth>
              <DialogTitle className="bg-gray-100">
                <Box className="flex justify-between items-center">
                  <Typography variant="h6">Pratinjau Gambar</Typography>
                  <IconButton onClick={handleCloseZoom}>
                    <i className="bi bi-x-lg text-gray-600"></i>
                  </IconButton>
                </Box>
              </DialogTitle>
              <Divider />
              <DialogContent className="flex justify-center items-center p-4">
        {zoomImage && (
          <ProtectedImage
            path={zoomImage}
            alt="Zoom"
            className="max-h-[80vh] w-auto rounded shadow"
            onClick={handleCloseZoom}
          />
        )}
      </DialogContent>
            </Dialog>

            <Dialog 
    open={editDialogOpen} 
    onClose={handleCloseEditDialog} 
    maxWidth="sm" 
    fullWidth
  >
    <DialogTitle className="bg-orange-50 px-6 py-4">
      <Box className="flex justify-between items-center">
        <Typography
          variant="h6"
          className="text-orange-800 font-semibold text-lg"
        >
          Edit Data
        </Typography>
        <IconButton
          onClick={handleCloseEditDialog}
          size="small"
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1"
          aria-label="Close"
        >
          <i className="bi bi-x-lg text-xl"></i>
        </IconButton>
      </Box>
    </DialogTitle>

    <Divider />

    <DialogContent className="px-6 py-6">
      {editRecord && (
        <Box className="space-y-6">
          {/* Image Preview Section */}
          {editRecord.image_url && (
            <Box className="text-center">
              <Box className="inline-block border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <img
                  src={`${editRecord.image_url}`}
                  alt="Pratinjau"
                  className="max-h-48 w-auto cursor-zoom-in hover:opacity-90 transition-opacity"
                  onClick={() => handleZoomImage(`${editRecord.image_url}`)}
                />
              </Box>
            </Box>
          )}


          {/* Form Fields */}
          <Box className="space-y-4">
            <TextField
              label="Nomor Rangka"
              fullWidth
              variant="outlined"
              size="small"
              value={editRecord.nomor_rangka || ""}
              onChange={(e) =>
                setEditRecord({ ...editRecord, nomor_rangka: e.target.value })
              }
              className="bg-white"
              InputProps={{
                className: "rounded-lg"
              }}
            />

            <TextField
              label="Jumlah (Rp)"
              fullWidth
              variant="outlined"
              size="small"
              type="number"
              value={editRecord.jumlah || ""}
              onChange={(e) =>
                setEditRecord({ 
                  ...editRecord, 
                  jumlah: parseInt(e.target.value) || 0 
                })
              }
              className="bg-white"
              InputProps={{
                className: "rounded-lg",
                inputProps: { min: 0 }
              }}
            />

            <TextField
              label="Kode Samsat"
              fullWidth
              variant="outlined"
              size="small"
              value={editRecord.kode_samsat || ""}
              onChange={(e) =>
                setEditRecord({ ...editRecord, kode_samsat: e.target.value })
              }
              className="bg-white"
              InputProps={{
                className: "rounded-lg"
              }}
            />
          </Box>
        </Box>
      )}
    </DialogContent>

    <Divider />

    <DialogActions className="px-6 py-4 bg-gray-50">
      <Box className="flex gap-3 w-full justify-end">
        <Button 
          onClick={handleCloseEditDialog} 
          variant="outlined"
          className="text-gray-600 border-gray-300 hover:bg-gray-50 px-6 py-2 rounded-lg"
        >
          Batal
        </Button>
        <Button
          onClick={handleEditSubmit}
          variant="contained"
          className="bg-orange-600 text-white hover:bg-orange-700 px-6 py-2 rounded-lg shadow-sm"
        >
          Simpan
        </Button>
      </Box>
    </DialogActions>
  </Dialog>


          </>
      );
    };

    return (
      <>
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Filter Component */}
        {renderFilter()}

        {/* Tabs for switching between regular data and correction data */}
        <Box className="mb-4">
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="KTP data tabs">
            <Tab 
              label={
                <Box className="flex items-center gap-2">
                  <i className="bi bi-table"></i>
                  Data STNK Regular
                </Box>
              } 
            />
            {/* <Tab 
              label={
                <Box className="flex items-center gap-2">
                  <i className="bi bi-pencil-square"></i>
                  Data STNK Koreksi
                </Box>
              } 
            /> */}
          </Tabs>
        </Box>
        {/* Regular Data Table */}
        {activeTab === 0 && renderTable(
          filteredData,
          loading,
          error,
          "Data STNK Regular",
          "Belum ada data STNK"
        )}
        {/* Correction Data Table */}
        {activeTab === 1 && renderTable(
          filteredCorrectionData,
          correctionLoading,
          correctionError,
          "Data STNK Koreksi",
          "Belum ada data koreksi STNK"
        )}

        <Dialog
          open={detailDialog}
          onClose={() => setDetailDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle className="bg-blue-50">
            <Box className="flex items-center gap-2">
              <i className="bi bi-person-vcard text-blue-600"></i>
              <Typography variant="h6" className="font-semibold">
                Detail Data STNK
              </Typography>
            </Box>
          </DialogTitle>
          <Divider />
  <DialogContent className="p-6">
    {selectedRecord && (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Box className="space-y-4">

            {/* Gambar Preview */}
            {selectedRecord.image_url && (
              <Box className="text-center">
                <img
                  src={`${selectedRecord.image_url}`}
                  alt="Gambar STNK"
                  className="max-h-64 mx-auto rounded shadow cursor-zoom-in hover:opacity-80"
                  title="Klik untuk perbesar"
                  onClick={() => handleZoomImage(`${selectedRecord.image_url}`)}
                />
              </Box>
            )}

            {/* Data Utama: Nomor Rangka, Jumlah, Kode Samsat */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box className="bg-gray-50 p-3 rounded-lg h-full">
                  <Typography variant="subtitle2" className="text-gray-500 font-medium mb-1">
                    Nomor Rangka
                  </Typography>
                  <Typography variant="body1" className="font-mono break-all">
                    {selectedRecord.nomor_rangka || "-"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box className="bg-gray-50 p-3 rounded-lg h-full">
                  <Typography variant="subtitle2" className="text-gray-500 font-medium mb-1">
                    Jumlah (Rp)
                  </Typography>
                  <Typography variant="body1" className="font-mono text-green-700 font-semibold">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(selectedRecord.jumlah || 0)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box className="bg-gray-50 p-3 rounded-lg">
                  <Typography variant="subtitle2" className="text-gray-500 font-medium mb-1">
                    Kode Samsat
                  </Typography>
                  <Typography variant="body1" className="font-mono">
                    {selectedRecord.kode_samsat || "-"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* File & Tanggal */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box className="bg-gray-50 p-3 rounded-lg">
                  <Typography variant="subtitle2" className="text-gray-500 font-medium mb-1">
                    File
                  </Typography>
                  <Typography variant="body1" className="font-mono break-all">
                    {selectedRecord.file || "-"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box className="bg-gray-50 p-3 rounded-lg">
                  <Typography variant="subtitle2" className="text-gray-500 font-medium mb-1">
                    Tanggal Dibuat
                  </Typography>
                  <Typography variant="body1" className="font-mono">
                    {selectedRecord.created_at
                      ? new Date(selectedRecord.created_at).toLocaleString('id-ID', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : "-"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

          </Box>
        </Grid>
      </Grid>
    )}
  </DialogContent>

          <Divider />
          <DialogActions className="p-4">
            <Button
              onClick={() => setDetailDialog(false)}
              className="text-gray-600"
            >
              Tutup
            </Button>
          </DialogActions>
        </Dialog>


        {/* Edit Dialog */}
        <Dialog 
            open={editDialogOpen} 
            onClose={handleCloseEditDialog} 
            maxWidth="sm" 
            fullWidth
          >
            <DialogTitle className="bg-orange-50 px-6 py-4">
              <Box className="flex justify-between items-center">
                <Typography variant="h6" className="text-orange-800 font-semibold">
                  Edit Data STNK
                </Typography>
                <IconButton onClick={handleCloseEditDialog} size="small">
                  <i className="bi bi-x-lg"></i>
                </IconButton>
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent className="px-6 py-4">
              {editRecord && (
                <Box className="space-y-4">
                  <img
                src={`${BASE_URL}${editRecord.image_url}`}
                alt="Pratinjau"
                className="max-h-48 w-auto cursor-zoom-in hover:opacity-90"
                onClick={() => handleZoomImage(`${editRecord.image_url}`)}
              />
                  <Box className="space-y-4">
                    <TextField
                      label="Nomor Rangka"
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={editRecord.nomor_rangka || ""}
                      onChange={(e) =>
                        setEditRecord({ ...editRecord, nomor_rangka: e.target.value })
                      }
                      margin="normal"
                    />

                    <TextField
                      label="Jumlah (Rp)"
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="number"
                      value={editRecord.jumlah || ""}
                      onChange={(e) =>
                        setEditRecord({ 
                          ...editRecord, 
                          jumlah: parseInt(e.target.value) || 0 
                        })
                      }
                      margin="normal"
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />

                    <TextField
                      label="Kode Samsat"
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={editRecord.kode_samsat || ""}
                      onChange={(e) =>
                        setEditRecord({ ...editRecord, kode_samsat: e.target.value })
                      }
                      margin="normal"
                    />
                  </Box>
                </Box>
              )}
            </DialogContent>
            <Divider />
            <DialogActions className="px-6 py-3 bg-gray-50">
              <Button 
                onClick={handleCloseEditDialog} 
                variant="outlined"
                className="text-gray-600 border-gray-300"
              >
                Batal
              </Button>
              <Button
                onClick={handleEditSubmit}
                variant="contained"
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                Simpan Perubahan
              </Button>
            </DialogActions>
          </Dialog>
      </>
    );
  };

  export default STNKDataTable;