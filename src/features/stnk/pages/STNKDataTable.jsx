import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { fetchStnkList, fetchStnkListByCorrection, fetchStnkListByDate, editStnk, updateStnkInfoThunk } from "@/slices/stnkSlice";
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
  Collapse,
  Fade,
  Slide
} from "@mui/material";
import {
  FilterList,
  Visibility,
  Edit,
  ZoomIn,
  Close,
  TableChart,
  Assignment,
  CalendarToday,
  Business,
  DirectionsCar,
  Save,
  Cancel,
  Warning
} from "@mui/icons-material";
import Swal from "sweetalert2";
import ProtectedImage from "@/components/ProtectedImage";

const BASE_URL = import.meta.env.VITE_API_URL + "/api" || "http://localhost:8000/api";

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
  const [invalidData, setInvalidData] = useState([]);
  const [invalidLoading, setInvalidLoading] = useState(false);
  const [invalidError, setInvalidError] = useState(null);
  const [filteredInvalidData, setFilteredInvalidData] = useState([]);
  
  
  // Filter states
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
    filterType: 'all'
  });
  const [filteredData, setFilteredData] = useState([]);
  const [filteredCorrectionData, setFilteredCorrectionData] = useState([]);
  const [dateFilterLoading, setDateFilterLoading] = useState(false);
  
  // const filteredInvalidData = invalidData.filter((item) => {
  //   const matchesSearch = item.nomor_rangka
  //     ?.toLowerCase()
  //     .includes(searchText.toLowerCase());
  
  //   const matchesPT = !selectedPT || item.nama_pt === selectedPT;
  //   const matchesBrand = !selectedBrand || item.nama_brand === selectedBrand;
  
  //   return matchesSearch && matchesPT && matchesBrand;
  // });
  

  // Image zoom state
  const [zoomImage, setZoomImage] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  // Fetch regular STNK data
  useEffect(() => {
    dispatch(fetchStnkList());
  }, [dispatch]);

  // Filter data based on filters
  useEffect(() => {
    if (!Array.isArray(stnkData)) return;

    let filtered = [...stnkData];

    if (kodeSamsatFilter && kodeSamsatFilter !== "all") {
      filtered = filtered.filter(item => item.kode_samsat === kodeSamsatFilter);
    }

    if (ptFilter) {
      filtered = filtered.filter(item => item.nama_pt === ptFilter);
    }

    if (brandFilter) {
      filtered = filtered.filter(item => item.nama_brand === brandFilter);
    }

    if (dateFilter.filterType === "today") {
      const todayStr = new Date().toISOString().split("T")[0];
      filtered = filtered.filter(item => {
        const created = new Date(item.created_at).toISOString().split("T")[0];
        return created === todayStr;
      });
    } else if (dateFilter.filterType === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      filtered = filtered.filter(item => {
        const created = new Date(item.created_at).toISOString().split("T")[0];
        return created === yesterdayStr;
      });
    } else if (
      dateFilter.filterType === "custom" &&
      dateFilter.selectedDate
    ) {
      const selectedDateStr = new Date(dateFilter.selectedDate).toISOString().split("T")[0];
      filtered = filtered.filter(item => {
        const createdDateStr = new Date(item.created_at).toISOString().split("T")[0];
        return createdDateStr === selectedDateStr;
      });
    }

    setFilteredData(filtered);
  }, [stnkData, kodeSamsatFilter, ptFilter, brandFilter, dateFilter]);
  // Filter invalid data based on filters
useEffect(() => {
  if (!Array.isArray(invalidData)) return;

  let filtered = [...invalidData];

  if (kodeSamsatFilter && kodeSamsatFilter !== "all") {
    filtered = filtered.filter(item => item.kode_samsat === kodeSamsatFilter);
  }

  if (ptFilter) {
    filtered = filtered.filter(item => item.nama_pt === ptFilter);
  }

  if (brandFilter) {
    filtered = filtered.filter(item => item.nama_brand === brandFilter);
  }

  if (dateFilter.filterType === "today") {
    const todayStr = new Date().toISOString().split("T")[0];
    filtered = filtered.filter(item => {
      const created = new Date(item.created_at).toISOString().split("T")[0];
      return created === todayStr;
    });
  } else if (dateFilter.filterType === "yesterday") {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    filtered = filtered.filter(item => {
      const created = new Date(item.created_at).toISOString().split("T")[0];
      return created === yesterdayStr;
    });
  } else if (
    dateFilter.filterType === "custom" &&
    dateFilter.selectedDate
  ) {
    const selectedDateStr = new Date(dateFilter.selectedDate).toISOString().split("T")[0];
    filtered = filtered.filter(item => {
      const createdDateStr = new Date(item.created_at).toISOString().split("T")[0];
      return createdDateStr === selectedDateStr;
    });
  }

  setFilteredInvalidData(filtered);
}, [invalidData, kodeSamsatFilter, ptFilter, brandFilter, dateFilter]);
// Get unique values for filters
useEffect(() => {
  const allData = [
    ...(Array.isArray(stnkData) ? stnkData : []),
    ...(Array.isArray(invalidData) ? invalidData : [])
  ];

  if (allData.length === 0) return;

  const uniqueSamsat = [...new Set(allData.map(item => item.kode_samsat).filter(Boolean))];
  const uniquePT = [...new Set(allData.map(item => item.nama_pt).filter(Boolean))];
  const uniqueBrand = [...new Set(allData.map(item => item.nama_brand).filter(Boolean))];

  setUniqueKodeSamsat(uniqueSamsat);
  setUniquePT(uniquePT);
  setUniqueBrand(uniqueBrand);
}, [stnkData, invalidData]);

  // Get unique values for filters
  useEffect(() => {
    if (!Array.isArray(stnkData)) return;

    const uniqueSamsat = [...new Set(stnkData.map(item => item.kode_samsat).filter(Boolean))];
    const uniquePT = [...new Set(stnkData.map(item => item.nama_pt).filter(Boolean))];
    const uniqueBrand = [...new Set(stnkData.map(item => item.nama_brand).filter(Boolean))];

    setUniqueKodeSamsat(uniqueSamsat);
    setUniquePT(uniquePT);
    setUniqueBrand(uniqueBrand);
  }, [stnkData]);

  // Fetch invalid STNK data when tab is active
  const fetchInvalidData = useCallback(async () => {
    setInvalidLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/stnk-data-without-validation-excel/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setInvalidData(data.data);
      } else {
        setInvalidError(data.message || 'Failed to fetch invalid data');
      }
    } catch (err) {
      setInvalidError(err.message);
    } finally {
      setInvalidLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 1) {
      fetchInvalidData();
    }
  }, [activeTab, fetchInvalidData]);

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

      await dispatch(editStnk({
        id: selectedRecord.id,
        data: formattedData,
      })).unwrap();

      window.location.reload();
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

  const handleZoomImage = (imageUrl) => {
    setZoomImage(imageUrl);
  };

  const handleCloseZoom = () => {
    setZoomImage(null);
  };

  const handleOpenEditDialog = (row) => {
    setEditRecord(row);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditRecord(null);
  };

  // OPTION 4: Dengan delay untuk user experience yang lebih baik
  const handleEditSubmit = () => {
      if (!editRecord?.id) return;
  
      dispatch(updateStnkInfoThunk({
        id: editRecord.id,
        data: {
          nomor_rangka: editRecord.nomor_rangka,
          jumlah: editRecord.jumlah,
          kode_samsat: editRecord.kode_samsat
        }
      }))
        .unwrap()
        .then(() => {
          toast.success("Data berhasil diperbarui");
          setEditDialogOpen(false);
          
          // Delay sebentar untuk user experience
          setTimeout(() => {
            // Pilih salah satu:
            window.location.reload(); // atau
            // dispatch(fetchStnkDataThunk());
          }, 500);
        })
        .catch((err) => {
          toast.error(err.message || "Gagal memperbarui data");
        });
  };
  

  const renderFilter = () => (
    <Fade in={true} timeout={600}>
      <Card className="shadow-lg rounded-2xl mb-6">
        <CardHeader
          title={
            <Box className="flex items-center justify-between">
              <Box className="flex items-center gap-3">
                <Box className="bg-green-100 p-2 rounded-full">
                  <FilterList sx={{ color: '#166534', fontSize: 24 }} />
                </Box>
                <Box className="flex-1">
                  <Typography variant="h6" className="font-bold text-gray-800 mb-1">
                    Filter Data STNK
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Saring data berdasarkan kriteria yang diinginkan
                  </Typography>
                </Box>
                {getFilterLabel() && (
                  <Box className="flex flex-wrap gap-1 ml-2">
                    <Chip 
                      label={getFilterLabel()} 
                      size="small" 
                      sx={{ 
                        bgcolor: '#166534',
                        color: 'white',
                        fontWeight: 600
                      }}
                      onDelete={clearFilter}
                    />
                  </Box>
                )}
                {dateFilterLoading && (
                  <CircularProgress size={20} sx={{ color: '#166534' }} />
                )}
              </Box>
              <Button
                onClick={() => setFilterOpen(!filterOpen)}
                variant="outlined"
                size="small"
                sx={{ 
                  color: '#166534',
                  borderColor: '#166534',
                  '&:hover': {
                    borderColor: '#166534',
                    backgroundColor: '#f0fdf4'
                  }
                }}
              >
                {filterOpen ? 'Tutup' : 'Buka'} Filter
              </Button>
            </Box>
          }
        />
        <Collapse in={filterOpen}>
          <Divider />
          <CardContent className="p-6">
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter Tanggal</InputLabel>
                  <Select
                    value={dateFilter.filterType}
                    label="Filter Tanggal"
                    onChange={(e) => handleFilterTypeChange(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">Semua Data</MenuItem>
                    <MenuItem value="today">Hari Ini</MenuItem>
                    <MenuItem value="yesterday">Kemarin</MenuItem>
                    <MenuItem value="custom">Pilih Tanggal</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {(userRole === "admin" || userRole === "superadmin") && (
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filter PT</InputLabel>
                    <Select
                      value={ptFilter}
                      label="Filter PT"
                      onChange={(e) => setPTFilter(e.target.value)}
                      sx={{ borderRadius: 2 }}
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
              )}

              {(userRole === "admin" || userRole === "superadmin" || userRole === "cao") && (
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filter Brand</InputLabel>
                    <Select
                      value={brandFilter}
                      label="Filter Brand"
                      onChange={(e) => setBrandFilter(e.target.value)}
                      sx={{ borderRadius: 2 }}
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
              )}

              {dateFilter.filterType === 'custom' && (
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="Pilih Tanggal"
                    type="date"
                    value={dateFilter.selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              )}

              {(userRole === "admin" || userRole === "superadmin") && (
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filter Kode Samsat</InputLabel>
                    <Select
                      value={kodeSamsatFilter}
                      label="Filter Kode Samsat"
                      onChange={(e) => setKodeSamsatFilter(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">Semua Kode Samsat</MenuItem>
                      {uniqueKodeSamsat.map((kode) => (
                        <MenuItem key={kode} value={kode}>
                          {kode}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} sm={6} md={3}>
                <Button
                  onClick={clearFilter}
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
                  disabled={dateFilterLoading}
                  fullWidth
                >
                  Reset Filter
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Collapse>
      </Card>
    </Fade>
  );

  const renderTable = (data, isLoading, tableError, tableTitle, emptyMessage, isInvalid = false) => {
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
      <Slide direction="up" in={true} timeout={800}>
        <Card className="shadow-lg rounded-2xl mb-6">
          <Box className={`p-4 border-b ${isInvalid ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <Box className="flex items-center justify-between">
              <Box className="flex items-center gap-3">
                <Box className={`p-2 rounded-full shadow-sm ${isInvalid ? 'bg-red-100' : 'bg-white'}`}>
                  {isInvalid ? (
                    <Warning sx={{ color: '#dc2626', fontSize: 24 }} />
                  ) : (
                    <TableChart sx={{ color: '#166534', fontSize: 24 }} />
                  )}
                </Box>
                <Box>
                  <Typography variant="h6" className="font-bold text-gray-800">
                    {tableTitle}
                  </Typography>
                  <Typography variant="body2" className={isInvalid ? 'text-red-700 font-medium' : 'text-green-700 font-medium'}>
                    {safeData.length} data • {totalGambar} gambar
                  </Typography>
                </Box>
              </Box>
              {isLoading && (
                <Box className="flex items-center gap-2 bg-white px-3 py-1 rounded-full">
                  <CircularProgress size={16} sx={{ color: isInvalid ? '#dc2626' : '#166534' }} />
                  <Typography variant="body2" className="text-gray-600 font-medium">
                    Loading...
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <CardContent className="p-0">
            {tableError && (
              <Box className="p-6">
                <Alert severity="error" className="rounded-xl">
                  {tableError}
                </Alert>
              </Box>
            )}

            {safeData.length === 0 ? (
              <Box className="text-center py-16">
                <Box className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DirectionsCar sx={{ fontSize: 48, color: '#9ca3af' }} />
                </Box>
                <Typography variant="h6" className="text-gray-500 mb-2 font-semibold">
                  {emptyMessage}
                </Typography>
                <Typography variant="body2" className="text-gray-400">
                  {activeTab === 0 ? "Upload gambar STNK untuk menambah data" : "Belum ada data koreksi STNK"}
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} className="max-h-96">
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell className={`${isInvalid ? 'bg-red-100' : 'bg-green-100'} font-bold ${isInvalid ? 'text-red-800' : 'text-green-800'}`}>Gambar</TableCell>
                      <TableCell className={`${isInvalid ? 'bg-red-100' : 'bg-green-100'} font-bold ${isInvalid ? 'text-red-800' : 'text-green-800'}`}>File</TableCell>
                      <TableCell className={`${isInvalid ? 'bg-red-100' : 'bg-green-100'} font-bold ${isInvalid ? 'text-red-800' : 'text-green-800'}`}>Nomor Rangka</TableCell>
                      <TableCell className={`${isInvalid ? 'bg-red-100' : 'bg-green-100'} font-bold ${isInvalid ? 'text-red-800' : 'text-green-800'}`}>Jumlah (Rp)</TableCell>
                      <TableCell className={`${isInvalid ? 'bg-red-100' : 'bg-green-100'} font-bold ${isInvalid ? 'text-red-800' : 'text-green-800'}`}>Kode Samsat</TableCell>
                      <TableCell className={`${isInvalid ? 'bg-red-100' : 'bg-green-100'} font-bold ${isInvalid ? 'text-red-800' : 'text-green-800'}`}>Tanggal Dibuat</TableCell>
                      <TableCell className={`${isInvalid ? 'bg-red-100' : 'bg-green-100'} font-bold ${isInvalid ? 'text-red-800' : 'text-green-800'}`}>PT</TableCell>
                      <TableCell className={`${isInvalid ? 'bg-red-100' : 'bg-green-100'} font-bold ${isInvalid ? 'text-red-800' : 'text-green-800'}`}>Brand</TableCell>
                      {isInvalid && <TableCell className="bg-red-100 font-bold text-red-800">Status</TableCell>}
                      <TableCell className={`${isInvalid ? 'bg-red-100' : 'bg-green-100'} font-bold ${isInvalid ? 'text-red-800' : 'text-green-800'} text-center`}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {safeData.map((row) => (
                      <TableRow 
                        key={row.id} 
                        hover 
                        className="cursor-pointer"
                        sx={isInvalid ? { backgroundColor: '#fef2f2' } : {}}
                      >
                        <TableCell>
                          {row.image_url ? (
                            <ProtectedImage
                              path={row.image_url}
                              alt="preview"
                              className="h-12 w-12 object-cover rounded-lg shadow cursor-zoom-in hover:opacity-80 transition-opacity"
                              onClick={() => handleZoomImage(`${row.image_url}`)}
                            />
                          ) : (
                            <Box className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Typography variant="caption" className="text-gray-400">-</Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm font-medium">{row.file || "-"}</TableCell>
                        <TableCell className="font-mono text-sm font-medium">{row.nomor_rangka || "-"}</TableCell>
                        <TableCell className="font-mono text-sm text-green-700 font-semibold">
                          {formatRupiah(row.jumlah)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{row.kode_samsat || "-"}</TableCell>
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
                        {isInvalid && (
                          <TableCell>
                            <Chip 
                              label="Invalid" 
                              size="small" 
                              sx={{ 
                                bgcolor: '#dc2626',
                                color: 'white',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <Box className="flex justify-center gap-1">
                            <Tooltip title="Lihat Detail">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetail(row)}
                                sx={{ 
                                  color: '#3b82f6',
                                  '&:hover': { 
                                    backgroundColor: '#dbeafe' 
                                  }
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                              <Tooltip title="Edit Data">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEditDialog(row)}
                                  sx={{ 
                                    color: '#f59e0b',
                                    '&:hover': { 
                                      backgroundColor: '#fef3c7' 
                                    }
                                  }}
                                >
                                  <Edit fontSize="small" />
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

  const renderTabs = () => (
    <Fade in={true} timeout={700}>
      <Card className="shadow-lg rounded-2xl">
        <Box className="bg-gradient-to-r from-green-700 to-green-800 p-4">
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="STNK data tabs"
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
            }}
          >
            <Tab 
              label={
                <Box className="flex items-center gap-2">
                  <TableChart />
                  Data STNK Regular
                </Box>
              } 
            />
            <Tab 
              label={
                <Box className="flex items-center gap-2">
                  <Warning />
                  Data STNK Invalid
                </Box>
              } 
            />
          </Tabs>
        </Box>
      </Card>
    </Fade>
  );

  return (
    <Box className="space-y-6">
      {error && (
        <Fade in={true} timeout={400}>
          <Alert severity="error" className="mb-4 rounded-xl shadow-sm">
            {error}
          </Alert>
        </Fade>
      )}

      {/* Filter Component */}
      {renderFilter()}

      {/* Tabs */}
      {renderTabs()}

      {/* Table Content */}
      {activeTab === 0 && renderTable(
        filteredData,
        loading,
        error,
        "Data STNK Regular",
        "Belum ada data STNK"
      )}

{activeTab === 1 && renderTable(
  filteredInvalidData,// ← ini hasil filter
  invalidLoading,
  invalidError,
  "Data STNK Invalid",
  "Tidak ada data STNK yang invalid",
  true
)}


      {/* Detail Dialog */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "rounded-2xl"
        }}
      >
        <DialogTitle className="bg-gradient-to-r from-blue-50 to-blue-100 p-6">
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-3">
              <Box className="bg-blue-100 p-2 rounded-full">
                <DirectionsCar sx={{ color: '#166534', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" className="font-bold text-gray-800">
                  Detail Data STNK
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Informasi lengkap data STNK
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setDetailDialog(false)}
              sx={{
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: '#f3f4f6'
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent className="p-6">
          {selectedRecord && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {/* Gambar Preview */}
                {selectedRecord?.image_url && (
                  <Box className="mb-6 w-full">
                    <Paper elevation={2} className="p-4 rounded-2xl w-full overflow-hidden">
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        minHeight: '400px'
                      }}>
                        <ProtectedImage
                          path={selectedRecord.image_url}
                          alt="Gambar STNK"
                          className="rounded-xl shadow"
                          style={{ 
                            transform: 'rotate(-90deg)',
                            transformOrigin: 'center center',
                            maxWidth: '100%',
                            height: 'auto'
                          }}
                        />
                      </div>
                    </Paper>
                  </Box>
                )}

                {/* Data Grid */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={1} className="bg-green-50 p-4 rounded-xl h-full">
                      <Typography variant="subtitle2" className="text-green-700 font-semibold mb-2">
                        Nomor Rangka
                      </Typography>
                      <Typography variant="body1" className="font-mono text-gray-800 break-all">
                        {selectedRecord.nomor_rangka || "-"}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper elevation={1} className="bg-green-50 p-4 rounded-xl h-full">
                      <Typography variant="subtitle2" className="text-green-700 font-semibold mb-2">
                        Jumlah (Rp)
                      </Typography>
                      <Typography variant="body1" className="font-mono text-green-700 font-bold text-lg">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(selectedRecord.jumlah || 0)}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper elevation={1} className="bg-green-50 p-4 rounded-xl">
                      <Typography variant="subtitle2" className="text-green-700 font-semibold mb-2">
                        Kode Samsat
                      </Typography>
                      <Typography variant="body1" className="font-mono text-gray-800">
                        {selectedRecord.kode_samsat || "-"}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper elevation={1} className="bg-gray-50 p-4 rounded-xl h-full">
                      <Typography variant="subtitle2" className="text-gray-600 font-semibold mb-2">
                        File
                      </Typography>
                      <Typography variant="body1" className="font-mono text-gray-800 break-all">
                        {selectedRecord.file || "-"}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper elevation={1} className="bg-gray-50 p-4 rounded-xl h-full">
                      <Typography variant="subtitle2" className="text-gray-600 font-semibold mb-2">
                        Tanggal Dibuat
                      </Typography>
                      <Typography variant="body1" className="font-mono text-gray-800">
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
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper elevation={1} className="bg-gray-50 p-4 rounded-xl h-full">
                      <Typography variant="subtitle2" className="text-gray-600 font-semibold mb-2">
                        PT
                      </Typography>
                      <Typography variant="body1" className="font-mono text-gray-800">
                        {selectedRecord.nama_pt || "-"}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper elevation={1} className="bg-gray-50 p-4 rounded-xl h-full">
                      <Typography variant="subtitle2" className="text-gray-600 font-semibold mb-2">
                        Brand
                      </Typography>
                      <Typography variant="body1" className="font-mono text-gray-800">
                        {selectedRecord.nama_brand || "-"}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <Divider />
        <DialogActions className="p-6 bg-gray-50">
          <Button
            onClick={() => setDetailDialog(false)}
            variant="contained"
            sx={{
              bgcolor: '#166534',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#14532d'
              }
            }}
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
        PaperProps={{
          className: "rounded-2xl"
        }}
      >
        <DialogTitle className="bg-gradient-to-r from-green-50 to-green-100 p-6">
          <Box className="flex justify-between items-center">
            <Box className="flex items-center gap-3">
              <Box className="bg-green-100 p-2 rounded-full">
                <Edit sx={{ color: '#ea580c', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" className="text-green-800 font-bold">
                  Edit Data STNK
                </Typography>
                <Typography variant="body2" className="text-green-600">
                  Perbarui informasi data STNK
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleCloseEditDialog}
              sx={{
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: '#f3f4f6'
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent className="p-6">
          {editRecord && (
            <Box className="space-y-6">
              {/* Image Preview */}
              {editRecord.image_url && (
              <Box className="mb-6 w-full">
                <Paper elevation={2} className="p-4 rounded-2xl w-full">
                  <div 
                    className="flex justify-center items-center"
                    style={{ 
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center',
                      minHeight: '400px'
                    }}
                  >
                    <ProtectedImage
                      path={editRecord.image_url}
                      alt="Pratinjau"
                      className="rounded-xl shadow max-w-full h-auto"
                    />
                  </div>
                </Paper>
              </Box>
              )}

              {/* Form Fields */}
              <Box>
                <TextField
                  label="Nomor Rangka"
                  fullWidth
                  variant="outlined"
                  size="medium"
                  value={editRecord.nomor_rangka || ""}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, nomor_rangka: e.target.value })
                  }
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white'
                    }
                  }}
                />

                <TextField
                  label="Jumlah (Rp)"
                  fullWidth
                  variant="outlined"
                  size="medium"
                  type="number"
                  value={editRecord.jumlah || ""}
                  onChange={(e) =>
                    setEditRecord({ 
                      ...editRecord, 
                      jumlah: parseInt(e.target.value) || 0 
                    })
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white'
                    }
                  }}
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions className="p-6 bg-gray-50">
          <Box className="flex gap-3 w-full justify-end">
            <Button 
              onClick={handleCloseEditDialog} 
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
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleEditSubmit}
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
                  bgcolor: '#16a34a'
                }
              }}
            >
              Simpan
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog 
        open={!!zoomImage} 
        onClose={handleCloseZoom} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          className: "rounded-2xl"
        }}
      >
        <DialogTitle className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
          <Box className="flex justify-between items-center">
            <Box className="flex items-center gap-3">
              <Box className="bg-gray-100 p-2 rounded-full">
                <ZoomIn sx={{ color: '#374151', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" className="font-bold text-gray-800">
                  Pratinjau Gambar STNK
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Klik gambar untuk menutup
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleCloseZoom}
              sx={{
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: '#f3f4f6'
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent className="flex justify-center items-center p-6">
          {zoomImage && (
            <Paper elevation={3} className="p-2 rounded-2xl">
              <ProtectedImage
                path={zoomImage}
                alt="Zoom"
                className="max-h-[80vh] w-auto rounded-xl shadow-lg cursor-pointer"
                onClick={handleCloseZoom}
              />
            </Paper>
          )}
        </DialogContent>
      </Dialog>

      {/* Correction Edit Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "rounded-2xl"
        }}
      >
        <DialogTitle className="bg-gradient-to-r from-green-50 to-green-100 p-6">
          <Box className="flex justify-between items-center">
            <Box className="flex items-center gap-3">
              <Box className="bg-green-100 p-2 rounded-full">
                <Assignment sx={{ color: '#166534', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" className="font-bold text-green-800">
                  Edit Koreksi STNK
                </Typography>
                <Typography variant="body2" className="text-green-600">
                  Perbarui data koreksi
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
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent className="p-6">
          {selectedRecord && (
            <Box className="space-y-4">
              <TextField
                label="Nomor Rangka"
                fullWidth
                variant="outlined"
                value={correctionForm.nomor_rangka}
                onChange={(e) => handleCorrectionFormChange('nomor_rangka', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }
                }}
              />
            </Box>
          )}
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
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveCorrection}
              variant="contained"
              startIcon={<Save />}
              disabled={savingCorrection}
              sx={{
                bgcolor: '#166534',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#14532d'
                }
              }}
            >
              {savingCorrection ? (
                <Box className="flex items-center gap-2">
                  <CircularProgress size={16} color="inherit" />
                  Menyimpan...
                </Box>
              ) : (
                'Simpan Koreksi'
              )}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default STNKDataTable;