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

const BASE_URL = import.meta.env.VITE_API_URL || "";

const STNKDataTable = () => {
  const dispatch = useDispatch();

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
 
  useEffect(() => {
    dispatch(fetchStnkList());
  }, [dispatch]);

  // Fetch correction data when correction tab is selected
  useEffect(() => {
    if (activeTab === 1 && correctionData.length === 0) {
      setCorrectionLoading(true);
      setCorrectionError(null);
      
      dispatch(fetchStnkListByCorrection())
        .unwrap()
        .then((data) => {
          setCorrectionData(Array.isArray(data) ? data : []);
          setCorrectionLoading(false);
        })
        .catch((error) => {
          setCorrectionError(error);
          setCorrectionLoading(false);
        });
    }
  }, [activeTab, dispatch, correctionData.length]);


  
  const applyDateFilter = useCallback(async () => {
    // Pastikan data selalu berupa array
    const safeMainData = Array.isArray(stnkData) ? stnkData : [];
    const safeCorrectionData = Array.isArray(correctionData) ? correctionData : [];
    
    if (dateFilter.filterType === 'all') {
      setFilteredData(safeMainData);
      setFilteredCorrectionData(safeCorrectionData);
      return;
    }

    let targetDate = '';
    const now = new Date();

    // Set target date based on filter type
    switch (dateFilter.filterType) {
      case 'today':
        targetDate = now.toISOString().split('T')[0]; // Format YYYY-MM-DD
        break;
      case 'yesterday':
        { const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        targetDate = yesterday.toISOString().split('T')[0];
        break; }
      case 'custom':
        targetDate = dateFilter.selectedDate;
        break;
      default:
        return;
    }

    if (!targetDate) return;

    try {
      setDateFilterLoading(true);
      
      // Fetch data from API endpoint
      const response = await dispatch(fetchStnkListByDate(targetDate)).unwrap();
      
      // Set filtered data for regular tab - pastikan selalu array
      const responseData = Array.isArray(response?.data) ? response.data : 
                          Array.isArray(response) ? response : [];
      setFilteredData(responseData);
      
      // For correction data, we'll filter locally since we don't have separate endpoint
      // You can create a similar endpoint for correction data if needed
      const filteredCorrections = safeCorrectionData.filter(item => {
        if (!item.created_at) return false;
        const itemDate = new Date(item.created_at).toISOString().split('T')[0];
        return itemDate === targetDate;
      });
      setFilteredCorrectionData(filteredCorrections);
      
    } catch (error) {
      console.error('Error filtering data by date:', error);
      // Fallback to local filtering if API fails
      const filterDataByDate = (data) => {
        const safeData = Array.isArray(data) ? data : [];
        return safeData.filter(item => {
          if (!item.created_at) return false;
          const itemDate = new Date(item.created_at).toISOString().split('T')[0];
          return itemDate === targetDate;
        });
      };
      
      setFilteredData(filterDataByDate(safeMainData));
      setFilteredCorrectionData(filterDataByDate(safeCorrectionData));
    } finally {
      setDateFilterLoading(false);
    }
  }, [stnkData, correctionData, dateFilter, dispatch]);

  useEffect(() => {
    // Pastikan data selalu berupa array
    const safeMainData = Array.isArray(stnkData) ? stnkData : [];
    const safeCorrectionData = Array.isArray(correctionData) ? correctionData : [];
    
    if (dateFilter.filterType === 'all') {
      setFilteredData(safeMainData);
      setFilteredCorrectionData(safeCorrectionData);
    } else {
      applyDateFilter();
    }
  }, [stnkData, correctionData, dateFilter, applyDateFilter]);

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
  };

  const getFilterLabel = () => {
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
                <Chip 
                  label={getFilterLabel()} 
                  size="small" 
                  color="primary" 
                  onDelete={clearFilter}
                  className="ml-2"
                />
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

  const BASE_URL = import.meta.env.VITE_API_URL;

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
      jumlah: editRecord.jumlah
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
                        <TableCell className="bg-gray-100 font-bold text-gray-700">Tanggal Dibuat</TableCell>
                        <TableCell className="bg-gray-100 font-bold text-gray-700 text-center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {safeData.map((row) => (
                        <TableRow key={row.id} hover className="cursor-pointer">
                          <TableCell>
                            {row.image_url ? (
                              <img
                                src={`${BASE_URL}${row.image_url}`}
                                alt="preview"
                                title="Klik untuk zoom"
                                className="h-12 rounded shadow cursor-zoom-in hover:opacity-80"
                                onClick={() => handleZoomImage(`${BASE_URL}${row.image_url}`)}
                              />
                            ) : "-"}
                          </TableCell>
                          <TableCell className="font-mono text-sm font-medium">{row.file || "-"}</TableCell>
                          <TableCell className="font-mono text-sm font-medium">{row.nomor_rangka || "-"}</TableCell>
                          <TableCell className="font-mono text-sm text-green-700 font-semibold"> {/* BARU */}
                            {formatRupiah(row.jumlah)}
                          </TableCell>
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

                              <Tooltip title="Edit Data">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEditDialog(row)}
                                  className="text-orange-600 hover:bg-orange-50"
                                >
                                  <i className="bi bi-pencil"></i>
                                </IconButton>
                              </Tooltip>

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
              <img
                src={zoomImage}
                alt="Zoom"
                className="max-h-[80vh] w-auto rounded shadow"
              />
            </DialogContent>
          </Dialog>

          <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
            <DialogTitle className="bg-orange-50">
              <Box className="flex justify-between items-center">
                <Typography variant="h6" className="text-orange-800 font-semibold">Edit Data</Typography>
                <IconButton onClick={handleCloseEditDialog}>
                  <i className="bi bi-x-lg text-gray-600"></i>
                </IconButton>
              </Box>
            </DialogTitle>

            <Divider />

            <DialogContent className="px-6 pt-4 pb-2">
              {editRecord && (
                <Box className="space-y-5">
                  {editRecord.image_url && (
                    <Box className="text-center">
                      <img
                        src={`${BASE_URL}${editRecord.image_url}`}
                        alt="Pratinjau"
                        className="max-h-48 mx-auto rounded shadow cursor-zoom-in hover:opacity-80"
                        onClick={() => handleZoomImage(`${BASE_URL}${editRecord.image_url}`)}
                      />
                    </Box>
                  )}

                  <TextField
                    label="Nomor Rangka"
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={editRecord.nomor_rangka || ""}
                    onChange={(e) =>
                      setEditRecord({ ...editRecord, nomor_rangka: e.target.value })
                    }
                  />

                  <TextField
                    label="Jumlah (Rp)"
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="number"
                    value={editRecord.jumlah || ""}
                    onChange={(e) =>
                      setEditRecord({ ...editRecord, jumlah: parseInt(e.target.value) || 0 })
                    }
                  />
                </Box>
              )}
            </DialogContent>

            <Divider />

            <DialogActions className="p-4">
              <Button onClick={handleCloseEditDialog} className="text-gray-600">
                Batal
              </Button>
              <Button
                onClick={handleEditSubmit}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                Simpan
              </Button>
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

                  {/* Gambar Preview dengan klik zoom */}
                  {selectedRecord.image_url && (
                    <>
                      <Box className="text-center">
                        <img
                          src={`${BASE_URL}${selectedRecord.image_url}`}
                          alt="Gambar STNK"
                          className="max-h-64 mx-auto rounded shadow cursor-zoom-in hover:opacity-80"
                          title="Klik untuk perbesar"
                          onClick={() => handleZoomImage(`${BASE_URL}${selectedRecord.image_url}`)}
                        />
                      </Box>

                      {/* Zoom Dialog */}
                      <Dialog open={!!zoomImage} onClose={handleCloseZoom} maxWidth="md">
                        <DialogTitle className="bg-gray-100">
                          <Box className="flex justify-between items-center">
                            <Typography variant="body1">Pratinjau Gambar</Typography>
                            <IconButton onClick={handleCloseZoom}>
                              <i className="bi bi-x-lg text-gray-600"></i>
                            </IconButton>
                          </Box>
                        </DialogTitle>
                        <Divider />
                        <DialogContent className="flex justify-center items-center p-4">
                          <img
                            src={zoomImage}
                            alt="Zoom"
                            className="max-h-[80vh] w-auto rounded shadow"
                          />
                        </DialogContent>
                      </Dialog>
                    </>
                  )}

                  {/* File */}
                  <Box>
                    <Typography variant="body2" className="text-gray-500 font-medium">
                      File
                    </Typography>
                    <Typography variant="body1" className="font-mono">
                      {selectedRecord.file || "-"}
                    </Typography>
                  </Box>

                  {/* Nomor Rangka */}
                  <Box>
                    <Typography variant="body2" className="text-gray-500 font-medium">
                      Nomor Rangka
                    </Typography>
                    <Typography variant="body1" className="font-mono">
                      {selectedRecord.nomor_rangka || "-"}
                    </Typography>
                  </Box>

                  {/* Jumlah */}
                  <Box>
                    <Typography variant="body2" className="text-gray-500 font-medium">
                      Jumlah
                    </Typography>
                    <Typography variant="body1" className="font-mono text-green-700 font-semibold">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      }).format(selectedRecord.jumlah || 0)}
                    </Typography>
                  </Box>

                  {/* Tanggal Dibuat */}
                  <Box>
                    <Typography variant="body2" className="text-gray-500 font-medium">
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
                            second: '2-digit'
                          })
                        : "-"}
                    </Typography>
                  </Box>
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


      {/* Edit Correction Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle className="bg-green-50">
          <Box className="flex items-center gap-2">
            <i className="bi bi-pencil-square text-green-600"></i>
            <Typography variant="h6" className="font-semibold">
              Edit Koreksi Data STNK
            </Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent className="p-6">
          {selectedRecord && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="font-semibold">Label</TableCell>
                    <TableCell className="font-semibold">Data Asli</TableCell>
                    <TableCell className="font-semibold">Koreksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                   {/* File */}
                  <TableRow>
                    <TableCell className="text-gray-500 font-medium">File</TableCell>
                    <TableCell>
                      <Typography variant="body1" className="font-mono">
                        {selectedRecord.file || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={correctionForm.file}
                        onChange={(e) => handleCorrectionFormChange('file', e.target.value)}
                        placeholder="Masukkan nama file yang benar"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>

                  {/* Nomor Rangka */}
                  <TableRow>
                    <TableCell className="text-gray-500 font-medium">Nomor Rangka</TableCell>
                    <TableCell>
                      <Typography variant="body1" className="font-mono">
                        {selectedRecord.nomor_rangka || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={correctionForm.nomor_rangka}
                        onChange={(e) => handleCorrectionFormChange('nomor_rangka', e.target.value)}
                        placeholder="Masukkan nomor rangka yang benar"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <Divider />
        <DialogActions className="p-4">
          <Button
            onClick={() => setEditDialog(false)}
            className="text-gray-600"
            disabled={savingCorrection}
          >
            Batal
          </Button>
          <Button
            onClick={handleSaveCorrection}
            variant="contained"
            className="bg-green-600 hover:bg-green-700"
            disabled={savingCorrection}
            startIcon={savingCorrection ? <CircularProgress size={16} /> : <i className="bi bi-check-lg"></i>}
          >
            {savingCorrection ? 'Menyimpan...' : 'Simpan Koreksi'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default STNKDataTable;