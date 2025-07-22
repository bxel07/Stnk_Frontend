import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { 
  Card, CardContent, CardHeader, Typography, Button, Grid, Box, Chip, 
  CircularProgress, Alert, Divider, Fade, Slide, Paper, Avatar
} from "@mui/material";
import { 
  CloudUpload, 
  CameraAlt, 
  Refresh, 
  Upload,
  Image as ImageIcon,
  PhotoCamera
} from "@mui/icons-material";
import { processStnkBatch, saveStnk } from "@/slices/stnkSlice";
import CameraDialog from "@/components/STNKUpload/CameraDialog";
import ResultDialog from "@/components/STNKUpload/ResultDialog";
import ZoomDialog from "@/components/STNKUpload/ZoomDialog";
import { getPTList, getBrandList } from "@/services/stnkService";

// SweetAlert z-index fix
if (!document.getElementById("swal-high-z-index-style")) {
  const style = document.createElement("style");
  style.id = "swal-high-z-index-style";
  style.innerHTML = `.swal-high-z-index { z-index: 13000 !important; }`;
  document.head.appendChild(style);
}

const STNKUpload = () => {
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.auth.user?.role);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [scanResults, setScanResults] = useState([]);
  const [correctedNumbers, setCorrectedNumbers] = useState([]);
  const [correctedQuantities, setCorrectedQuantities] = useState([]);
  const [correctedSamsatCodes, setCorrectedSamsatCodes] = useState([]);
  const [expandedPanels, setExpandedPanels] = useState(new Set([0]));
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultDialog, setResultDialog] = useState(false);
  const [cameraDialog, setCameraDialog] = useState(false);
  const [zoomDialog, setZoomDialog] = useState(false);
  const [zoomedImage, setZoomedImage] = useState({ src: "", title: "" });
  const [error, setError] = useState(null);
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const [ptList, setPtList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [selectedPTs, setSelectedPTs] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [ptRes, brandRes] = await Promise.all([
          getPTList(),
          getBrandList(),  
        ]);
        setPtList(ptRes.data);
        setBrandList(brandRes.data);
      } catch (err) {
        console.error("Gagal memuat PT/Brand:", err);
      }
    };
    if (["cao", "admin", "superadmin"].includes(userRole)) {
      fetchLists();
    }
  }, [userRole]);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files).slice(0, 10 - selectedImages.length);
    const newImages = [];
    const newPreviews = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
      newImages.push(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target.result);
        if (newPreviews.length === newImages.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    const updatedImages = [...selectedImages, ...newImages];
    setSelectedImages(updatedImages);
    if (newImages.length > 0) processSTNKBatchRequest(updatedImages);
  };

  const processSTNKBatchRequest = async (files) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const response = await dispatch(processStnkBatch(formData)).unwrap();
      const results = Array.isArray(response.results) ? response.results : [];

      setScanResults(results);
      setCorrectedNumbers(results.map(r => r.nomor_rangka || ""));
      setCorrectedQuantities(results.map(r => r.details?.jumlah?.toString() || "0"));
      setCorrectedSamsatCodes(results.map(r => r.kode_samsat || ""));
      setSelectedPTs(results.map(r => r.pt_id || ""));
      setSelectedBrands(results.map(r => r.brand_id || ""));
      setExpandedPanels(new Set([0]));
      setResultDialog(true);
    } catch (err) {
      console.error("Gagal memproses batch STNK:", err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memproses',
        text: 'Silakan coba lagi.',
        confirmButtonColor: '#dc3545'
      });
      resetAll();
    } finally {
      setIsProcessing(false);
    }
  };

  const openCamera = async () => {
    try {
      setCameraDialog(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Gagal akses kamera:", err);
      Swal.fire({
        icon: 'error',
        title: 'Akses Kamera Gagal',
        text: 'Pastikan browser memiliki izin akses kamera.',
        confirmButtonColor: '#dc3545'
      });
      setCameraDialog(false);
    }
  };

  const closeCamera = () => {
    setCameraDialog(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleTakePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `stnk_camera_${Date.now()}.jpg`, { type: "image/jpeg" });
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreviews((prev) => [...prev, e.target.result]);
          };
          reader.readAsDataURL(file);
          const updatedImages = [...selectedImages, file];
          setSelectedImages(updatedImages);
          processSTNKBatchRequest(updatedImages);
        }
      }, "image/jpeg", 0.9);
    }
    closeCamera();
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    Swal.fire({
      title: 'Menyimpan Data',
      text: 'Tunggu sebentar...',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => Swal.showLoading(),
      customClass: { container: 'swal-high-z-index' },
    });

    try {
      for (let i = 0; i < scanResults.length; i++) {
        const original = scanResults[i];
        const finalData = {
          user_id: original.user_id || currentUserId,
          glbm_samsat_id: original.glbm_samsat_id || 1,
          filename: original.path?.split("\\").pop(),
          file: original.path?.split("\\").pop(),
          path: original.path,
          nomor_rangka: correctedNumbers[i].trim(),
          kode_samsat: correctedSamsatCodes[i].trim(),
          details: {
            jumlah: parseInt(correctedQuantities[i]) || 0
          },
          pt_id: selectedPTs[i] || null, 
          brand_id: selectedBrands[i] || null,
          corrected:
            correctedNumbers[i].trim() !== original.nomor_rangka ||
            (parseInt(correctedQuantities[i]) || 0) !== (original.jumlah || 0) ||
            correctedSamsatCodes[i].trim() !== (original.kode_samsat || ""),
        };
        await dispatch(saveStnk(finalData)).unwrap();
      }
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `${scanResults.length} data STNK berhasil disimpan.`,
        confirmButtonColor: '#28a745',
        customClass: { container: 'swal-high-z-index' }
      });
      resetAll();
    } catch (err) {
      const errorDetail = err?.response?.data?.detail || err?.response?.data || err.message;
      console.error("Gagal menyimpan STNK:", errorDetail);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail),
        confirmButtonColor: '#dc3545',
        customClass: { container: 'swal-high-z-index' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAll = () => {
    setSelectedImages([]);
    setImagePreviews([]);
    setScanResults([]);
    setCorrectedNumbers([]);
    setCorrectedQuantities([]);
    setCorrectedSamsatCodes([]);
    setSelectedPTs([]);
    setSelectedBrands([]);
    setExpandedPanels(new Set());
    setZoomDialog(false);
    setZoomedImage({ src: "", title: "" });
    setError(null);
    setResultDialog(false);
    setIsProcessing(false);
    setIsSubmitting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getStatusChip = (result, corrected, original) => {
    if (!corrected.trim()) return <Chip label="Perlu Koreksi" color="error" size="small" sx={{ fontWeight: 600 }} />;
    if (corrected.trim() !== original) return <Chip label="Dikoreksi" color="warning" size="small" sx={{ fontWeight: 600 }} />;
    return <Chip label="Valid" color="success" size="small" sx={{ fontWeight: 600 }} />;
  };

  useEffect(() => {
    if (!resultDialog) {
      resetAll();
    }
  }, [resultDialog]);
  
  return (
    <Box className="space-y-6">
      {/* Header Section */}
      <Fade in={true} timeout={800}>
        <Card className="shadow-lg rounded-2xl overflow-hidden">
          <Box className="bg-gradient-to-r from-green-700 to-green-800 p-6">
            <Box className="flex items-center gap-4">
              <Box className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                <CloudUpload sx={{ color: 'white', fontSize: 35 }} />
              </Box>
              <Box className="flex-1">
                <Typography 
                  variant="h5" 
                  component="h1" 
                  className="text-white font-bold mb-1"
                >
                  Upload & Process STNK
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  className="text-green-100 font-medium"
                >
                  Upload dan proses dokumen STNK dengan teknologi OCR
                </Typography>
              </Box>
              <Box className="hidden md:flex items-center gap-2">
                <ImageIcon sx={{ color: 'white', fontSize: 32 }} />
                <Upload sx={{ color: 'white', fontSize: 32 }} />
              </Box>
            </Box>
          </Box>
        </Card>
      </Fade>

      {error && (
        <Fade in={true} timeout={600}>
          <Alert severity="error" className="rounded-2xl" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Upload Section */}
      <Slide direction="up" in={true} timeout={600}>
        <Card className="shadow-lg rounded-2xl">
          <Box className="bg-green-50 p-4 border-b border-green-200">
            <Box className="flex items-center gap-2">
              <CloudUpload sx={{ color: '#166534', fontSize: 24 }} />
              <Typography variant="h6" className="font-bold text-gray-800">
                Upload Dokumen STNK
              </Typography>
            </Box>
          </Box>
          <CardContent className="p-6">
            <Box className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center bg-green-50/50 hover:bg-green-50 transition-colors duration-200">
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                id="stnk-upload"
              />
              <label htmlFor="stnk-upload" className="cursor-pointer">
                <Box className="flex flex-col items-center">
                  <Box className="bg-green-100 p-4 rounded-full mb-4">
                    <ImageIcon sx={{ fontSize: 48, color: '#166534' }} />
                  </Box>
                  <Typography variant="h6" className="mb-2 font-bold text-gray-800">
                    Pilih Gambar STNK (max 10)
                  </Typography>
                  <Typography variant="body1" className="text-gray-600 mb-2 font-medium">
                    {selectedImages.length > 0
                      ? `${selectedImages.length} gambar dipilih`
                      : "Klik atau drag file gambar ke area ini"}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500">
                    Format: JPG, PNG, JPEG (Max 5MB per file)
                  </Typography>
                </Box>
              </label>
              {isProcessing && (
                <Box className="mt-6 flex flex-col items-center">
                  <CircularProgress size={32} sx={{ color: '#166534' }} />
                  <Typography variant="body2" className="mt-2 text-gray-600 font-medium">
                    Memproses gambar...
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Box className="mt-6 flex gap-3 justify-center">
              <Button 
                variant="contained"
                startIcon={<CameraAlt />}
                onClick={openCamera} 
                disabled={isProcessing || selectedImages.length >= 10}
                sx={{
                  bgcolor: '#166534',
                  '&:hover': {
                    bgcolor: '#0f5132',
                  },
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                }}
              >
                Ambil Foto
              </Button>
              <Button 
                variant="outlined"
                startIcon={<Refresh />}
                onClick={resetAll} 
                disabled={isProcessing || isSubmitting}
                sx={{
                  borderColor: '#166534',
                  color: '#166534',
                  '&:hover': {
                    borderColor: '#0f5132',
                    bgcolor: '#f0fdf4',
                  },
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                }}
              >
                Reset
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Slide>

      {/* Image Preview Section - Display full images immediately */}
      {selectedImages.length > 0 && (
        <Fade in={true} timeout={800}>
          <Card className="shadow-lg rounded-2xl">
            <Box className="bg-green-50 p-4 border-b border-green-200">
              <Box className="flex items-center justify-between">
                <Box className="flex items-center gap-2">
                  <PhotoCamera sx={{ color: '#166534', fontSize: 24 }} />
                  <Typography variant="h6" className="font-bold text-gray-800">
                    Gambar STNK
                  </Typography>
                </Box>
                <Chip 
                  label={`${selectedImages.length} file dipilih`}
                  sx={{ 
                    bgcolor: '#166534',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>
            <CardContent className="p-6">
              <Grid container spacing={3}>
                {imagePreviews.map((preview, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper 
                      elevation={3} 
                      className="rounded-xl overflow-hidden"
                      onClick={() => {
                        setZoomedImage({ src: preview, title: `STNK ${index + 1}` });
                        setZoomDialog(true);
                      }}
                      sx={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.02)',
                        }
                      }}
                    >
                      <Box className="relative pt-[100%]">
                        <Avatar
                          variant="square"
                          src={preview}
                          alt={`STNK Preview ${index + 1}`}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: '12px',
                            objectFit: 'contain',
                            bgcolor: '#f0f0f0'
                          }}
                        />
                      </Box>
                      <Box className="p-3 bg-white">
                        <Typography variant="subtitle2" className="font-semibold text-center">
                          STNK {index + 1}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Fade>
      )}

      <CameraDialog
        open={cameraDialog}
        onClose={closeCamera}
        onCapture={handleTakePhoto}
        videoRef={videoRef}
        canvasRef={canvasRef}
      />

      <ResultDialog
        open={resultDialog}
        onClose={() => setResultDialog(false)}
        results={scanResults}
        correctedNumbers={correctedNumbers}
        setCorrectedNumbers={setCorrectedNumbers}
        correctedQuantities={correctedQuantities}
        setCorrectedQuantities={setCorrectedQuantities}
        correctedSamsatCodes={correctedSamsatCodes}
        setCorrectedSamsatCodes={setCorrectedSamsatCodes}
        imagePreviews={imagePreviews}
        selectedImages={selectedImages}
        expandedPanels={expandedPanels}
        handleAccordionChange={(index) => (e, expanded) => {
          const newSet = new Set(expandedPanels);
          expanded ? newSet.add(index) : newSet.delete(index);
          setExpandedPanels(newSet);
        }}
        expandAll={() => setExpandedPanels(new Set(scanResults.map((_, i) => i)))}
        collapseAll={() => setExpandedPanels(new Set())}
        getStatusChip={getStatusChip}
        handleImageZoom={(src, title) => {
          setZoomedImage({ src, title });
          setZoomDialog(true);
        }}
        handleSubmit={handleFinalSubmit}
        isSubmitting={isSubmitting}
        userRole={userRole}
        ptList={ptList?.data || []}
        brandList={brandList?.data || []}
        selectedPTs={selectedPTs}
        setSelectedPTs={setSelectedPTs}
        selectedBrands={selectedBrands}
        setSelectedBrands={setSelectedBrands}
      />

      <ZoomDialog
        open={zoomDialog}
        onClose={() => setZoomDialog(false)}
        image={zoomedImage}
      />
    </Box>
  );
};

export default STNKUpload;