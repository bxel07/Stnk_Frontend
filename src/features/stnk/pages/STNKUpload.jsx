// STNK Multi Upload dengan Expandable Results Dialog - Fixed Reset
import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { processStnkBatch, saveStnk } from "@/slices/stnkSlice";
import {
  Card, CardContent, CardHeader, Typography, Button, Grid, Box,
  Chip, CircularProgress, Alert, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Accordion, AccordionSummary, AccordionDetails,
  Badge, IconButton
} from "@mui/material";

const STNKUpload = () => {
  const dispatch = useDispatch();
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [scanResults, setScanResults] = useState([]);
  const [correctedNumbers, setCorrectedNumbers] = useState([]);
  const [correctedQuantities, setCorrectedQuantities] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultDialog, setResultDialog] = useState(false);
  const [cameraDialog, setCameraDialog] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState(new Set([0])); // Default expand first item
  const [zoomDialog, setZoomDialog] = useState(false);
  const [zoomedImage, setZoomedImage] = useState({ src: "", title: "" });
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files).slice(0, 10 - selectedImages.length);
    const newImages = [];
    const newPreviews = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) return;

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

    if (newImages.length > 0) {
      processSTNKBatchRequest(updatedImages);
    }
  };

  const processSTNKBatchRequest = async (files) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await dispatch(processStnkBatch(formData)).unwrap();
      const results = Array.isArray(response.results) ? response.results : [];
      setScanResults(results);
      setCorrectedNumbers(results.map((r) => r.nomor_rangka || ""));
      // Extract jumlah from nested details
      setCorrectedQuantities(results.map((r) => r.details?.jumlah?.toString() || "0"));
      setResultDialog(true);
      // Auto expand first result
      setExpandedPanels(new Set([0]));
    } catch (err) {
      console.error("Gagal memproses batch STNK:", err);
      setError("Gagal memproses gambar STNK.");
    } finally {
      setIsProcessing(false);
    }
  };

  const openCamera = async () => {
    setError(null);
    try {
      setCameraDialog(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Gagal mengakses kamera:", err);
      setError("Tidak dapat mengakses kamera.");
      setCameraDialog(false);
    }
  };

  const closeCamera = () => {
    setCameraDialog(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
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

  const handleAccordionChange = (panelIndex) => (event, isExpanded) => {
    const newExpanded = new Set(expandedPanels);
    if (isExpanded) {
      newExpanded.add(panelIndex);
    } else {
      newExpanded.delete(panelIndex);
    }
    setExpandedPanels(newExpanded);
  };

  const expandAll = () => {
    setExpandedPanels(new Set(Array.from({ length: scanResults.length }, (_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedPanels(new Set());
  };

  const getStatusChip = (result, correctedNumber, originalNumber) => {
    if (!correctedNumber.trim()) {
      return <Chip label="Perlu Koreksi" color="error" size="small" />;
    }
    if (correctedNumber.trim() !== originalNumber) {
      return <Chip label="Dikoreksi" color="warning" size="small" />;
    }
    return <Chip label="Valid" color="success" size="small" />;
  };

  // Improved reset function
  const handleReset = () => {
    // Reset all states
    setSelectedImages([]);
    setImagePreviews([]);
    setScanResults([]);
    setCorrectedNumbers([]);
    setCorrectedQuantities([]);
    setExpandedPanels(new Set());
    setZoomDialog(false);
    setZoomedImage({ src: "", title: "" });
    setError(null);
    setResultDialog(false);
    setIsProcessing(false);
    setIsSubmitting(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      for (let i = 0; i < scanResults.length; i++) {
        const originalNumber = scanResults[i]?.nomor_rangka || "";
        const originalQuantity = scanResults[i]?.details?.jumlah || 0;
        const finalData = {
          ...scanResults[i],
          nomor_rangka: correctedNumbers[i].trim(),
          details: {
            ...scanResults[i].details,
            jumlah: parseInt(correctedQuantities[i]) || 0
          },
          corrected: correctedNumbers[i].trim() !== originalNumber || 
                    (parseInt(correctedQuantities[i]) || 0) !== originalQuantity,
        };
        await dispatch(saveStnk(finalData)).unwrap();
      }
      
      // Show success message
      alert("Semua data STNK berhasil disimpan!");
      
      // Force reset after successful submission
      setTimeout(() => {
        handleReset();
      }, 100); // Small delay to ensure all async operations complete
      
    } catch (err) {
      console.error("Gagal menyimpan STNK:", err);
      setError("Gagal menyimpan satu atau lebih data STNK.");
      setIsSubmitting(false); // Only reset submitting state on error
    }
  };

  const handleImageZoom = (imageSrc, imageTitle) => {
    setZoomedImage({ src: imageSrc, title: imageTitle });
    setZoomDialog(true);
  };

  const closeZoom = () => {
    setZoomDialog(false);
    setZoomedImage({ src: "", title: "" });
  };

  // Handle dialog close with proper reset
  const handleResultDialogClose = () => {
    setResultDialog(false);
    // Optional: Ask user if they want to reset
    if (window.confirm("Apakah Anda ingin mereset form untuk upload baru?")) {
      handleReset();
    }
  };

  return (
    <>
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
      <Card className="mb-6 shadow-md">
        <CardHeader title={<Box className="flex items-center gap-2">
          <i className="bi bi-cloud-upload-fill text-xl text-gray-600"></i>
          <Typography variant="h6">Upload & Process STNK</Typography>
        </Box>} />
        <Divider />
        <CardContent>
          <Grid container direction="column" spacing={4}>
            <Grid item>
              <Box className="border-2 border-dashed rounded-lg p-8 text-center">
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
                  <i className="bi bi-images text-5xl mb-4 block text-gray-400"></i>
                  <Typography variant="h6" className="mb-2 font-medium">
                    Pilih Gambar STNK (max 10)
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 mb-2">
                    {selectedImages.length > 0 ? `${selectedImages.length} gambar dipilih` : "Klik atau drag file gambar"}
                  </Typography>
                  <Typography variant="caption" className="text-gray-400">
                    Format: JPG, PNG, JPEG (Max 5MB)
                  </Typography>
                </label>
                {isProcessing && <Box className="mt-4"><CircularProgress size={24} /></Box>}
              </Box>
            </Grid>
          </Grid>
          <Box className="mt-6 flex gap-3">
            <Button
              variant="contained"
              onClick={openCamera}
              startIcon={<i className="bi bi-camera"></i>}
              disabled={isProcessing || selectedImages.length >= 10}
            >Ambil Foto</Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={isProcessing || isSubmitting}
              startIcon={<i className="bi bi-arrow-clockwise"></i>}
            >Reset</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Camera Dialog */}
      <Dialog open={cameraDialog} onClose={closeCamera} maxWidth="sm" fullWidth>
        <DialogTitle className="bg-gray-100">
          <Box className="flex items-center gap-2">
            <i className="bi bi-camera text-blue-600"></i>
            <Typography variant="h6">Ambil Foto STNK</Typography>
          </Box>
        </DialogTitle>
        <DialogContent className="relative p-0 bg-black">
          <Box className="relative w-full h-[500px]">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <Box className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Box className="border-4 border-yellow-400 w-[250px] h-[450px] rounded-md" />
            </Box>
          </Box>
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={closeCamera} color="error">Batal</Button>
          <Button onClick={handleTakePhoto} variant="contained" className="bg-blue-600 hover:bg-blue-700">Ambil Gambar</Button>
        </DialogActions>
      </Dialog>

      {/* Results Dialog with Expandable Cards - Simplified to show only nomor_rangka and jumlah */}
      <Dialog open={resultDialog} onClose={handleResultDialogClose} maxWidth="lg" fullWidth>
        <DialogTitle className="bg-green-50">
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-2">
              <i className="bi bi-check-circle text-green-600"></i>
              <Typography variant="h6">Hasil Scan STNK</Typography>
              <Badge badgeContent={scanResults.length} color="primary" />
            </Box>
            <Box className="flex gap-2">
              <Button size="small" onClick={expandAll} startIcon={<i className="bi bi-arrows-expand"></i>}>
                Buka Semua
              </Button>
              <Button size="small" onClick={collapseAll}>
                Tutup Semua
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent className="p-0">
          <Box className="max-h-[70vh] overflow-y-auto">
            {scanResults.map((result, idx) => (
              <Accordion 
                key={idx}
                expanded={expandedPanels.has(idx)}
                onChange={handleAccordionChange(idx)}
                className="border-b"
              >
                <AccordionSummary 
                  expandIcon={<i className="bi bi-chevron-down"></i>} 
                  className="bg-gray-50"
                >
                  <Box className="flex items-center justify-between w-full mr-4">
                    <Box className="flex items-center gap-3">
                      <Typography variant="subtitle1" className="font-medium">
                        STNK #{idx + 1}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        {correctedNumbers[idx] || result.nomor_rangka || "Nomor tidak terdeteksi"}
                      </Typography>
                      <Typography variant="body2" className="text-blue-600">
                        Qty: {correctedQuantities[idx] || result.details?.jumlah || 0}
                      </Typography>
                    </Box>
                    <Box className="flex items-center gap-2">
                      {getStatusChip(result, correctedNumbers[idx] || "", result.nomor_rangka || "")}
                      <Chip 
                        label={
                          selectedImages[idx]
                            ? `${(selectedImages[idx].size / 1024 / 1024).toFixed(1)}MB`
                            : "0MB"
                        }
                        size="small" 
                        variant="outlined"
                        className="text-xs"
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails className="p-4">
                  <Grid container spacing={3}>
                    {/* Image Preview */}
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" className="mb-2 font-medium">
                        Preview Gambar
                      </Typography>
                      {imagePreviews[idx] && (
                        <Box className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                          <img
                            src={imagePreviews[idx]}
                            alt={`STNK Preview ${idx + 1}`}
                            className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                            onClick={() => handleImageZoom(imagePreviews[idx], `STNK #${idx + 1}`)}
                          />
                          <Box className="p-2 bg-gray-50 flex items-center justify-center">
                            <Typography variant="caption" className="text-gray-600 flex items-center gap-1">
                              <i className="bi bi-zoom-in"></i>
                              Klik untuk memperbesar
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Grid>

                    {/* Form Fields - Simplified to only show nomor_rangka and jumlah */}
                    <Grid item xs={12} md={8}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <TextField
                            fullWidth
                            label="Nomor Rangka *"
                            variant="outlined"
                            value={correctedNumbers[idx] || ""}
                            onChange={(e) => {
                              const updated = [...correctedNumbers];
                              updated[idx] = e.target.value;
                              setCorrectedNumbers(updated);
                            }}
                            error={!correctedNumbers[idx]?.trim()}
                            helperText={!correctedNumbers[idx]?.trim() ? "Nomor rangka wajib diisi" : ""}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Jumlah"
                            variant="outlined"
                            type="number"
                            value={correctedQuantities[idx] || ""}
                            onChange={(e) => {
                              const updated = [...correctedQuantities];
                              updated[idx] = e.target.value;
                              setCorrectedQuantities(updated);
                            }}
                            inputProps={{ min: 0 }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions className="p-4 bg-gray-50">
          <Box className="flex items-center justify-between w-full">
            <Typography variant="body2" className="text-gray-600">
              {scanResults.length} STNK terdeteksi • {correctedNumbers.filter(n => n?.trim()).length} siap disimpan
            </Typography>
            <Box className="flex gap-2">
              <Button onClick={handleResultDialogClose} disabled={isSubmitting}>
                Tutup
              </Button>
              <Button
                variant="contained"
                onClick={handleFinalSubmit}
                disabled={isSubmitting || correctedNumbers.some((n) => !n?.trim())}
                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <i className="bi bi-check-lg"></i>}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Semua"}
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog 
        open={zoomDialog} 
        onClose={closeZoom} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          style: { backgroundColor: 'transparent', boxShadow: 'none' }
        }}
      >
        <DialogContent className="p-0 bg-black/90 min-h-[90vh] flex items-center justify-center">
          <Box className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Header with title and close button */}
            <Box className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <Typography variant="h6" className="text-white font-medium">
                {zoomedImage.title}
              </Typography>
              <IconButton 
                onClick={closeZoom} 
                className="text-white bg-black/50 hover:bg-black/70"
                size="large"
              >
                <i className="bi bi-x-lg text-xl"></i>
              </IconButton>
            </Box>
            
            {/* Zoomed Image */}
            <Box className="relative w-full h-full flex items-center justify-center p-8">
              {zoomedImage.src && (
                <img
                  src={zoomedImage.src}
                  alt={zoomedImage.title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  style={{ maxHeight: '85vh' }}
                />
              )}
            </Box>

            {/* Instructions */}
            <Box className="absolute bottom-4 left-4 right-4 text-center">
              <Typography variant="body2" className="text-white/80">
                <i className="bi bi-info-circle mr-2"></i>
                Klik di luar gambar atau tombol ✕ untuk menutup
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default STNKUpload;