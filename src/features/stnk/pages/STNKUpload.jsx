import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { createStnk } from "@/slices/stnkSlice";
import { saveStnk } from "@/slices/stnkSlice";

import {
  Card, CardContent, CardHeader, Typography, Button, Grid, Box,
  Chip, CircularProgress, Alert, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField
} from "@mui/material";

const STNKUpload = () => {
  const dispatch = useDispatch();

  // Local state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [cameraDialog, setCameraDialog] = useState(false);
  const [resultDialog, setResultDialog] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [correctedNumber, setCorrectedNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for submit loading state
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Buka kamera
  const openCamera = async () => {
    setError(null);
    try {
      setCameraDialog(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
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

  // Tutup kamera
  const closeCamera = () => {
    setCameraDialog(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Process STNK automatically
  const processSTNKAutomatically = async (imageFile) => {
    if (!imageFile) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      
      // Call the API to process STNK
      const result = await dispatch(createStnk(formData)).unwrap();
      
      // Set scan result and initialize corrected number with the scanned value
      setScanResult(result);
      const scannedNumber = result.nomor_rangka || "";
      setCorrectedNumber(scannedNumber);
      
      // Show result dialog
      setResultDialog(true);
      
    } catch (err) {
      console.error("Error processing STNK:", err);
      setError("Gagal memproses STNK. Silakan coba lagi.");
      // Reset states on error
      setScanResult(null);
      setCorrectedNumber("");
    } finally {
      setIsProcessing(false);
    }
  };

  // Ambil foto dari kamera
  const handleTakePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], "stnk_camera.jpg", { type: "image/jpeg" });
          setSelectedImage(file);

          const reader = new FileReader();
          reader.onload = (e) => setImagePreview(e.target.result);
          reader.readAsDataURL(file);

          closeCamera();
          
          // Automatically process the captured image
          processSTNKAutomatically(file);
        }
      }, "image/jpeg", 0.9);
    }
  };

  // Upload file handler
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setError(null);
      if (file.size > 5 * 1024 * 1024) {
        setError("File terlalu besar. Maksimal 5MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("File harus berupa gambar.");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      
      // Automatically process the uploaded image
      processSTNKAutomatically(file);
    }
  };

  // Handle final submission with corrected data
  const handleFinalSubmit = async () => {
    if (!scanResult || !correctedNumber.trim()) {
      setError("Nomor rangka tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const originalNumber = scanResult.nomor_rangka || "";
      const finalData = {
        ...scanResult,
        nomor_rangka: correctedNumber.trim(),
        corrected: correctedNumber.trim() !== originalNumber
      };

      console.log("Final data to be saved:", finalData);

      // Call saveStnk with dispatch
      await dispatch(saveStnk(finalData)).unwrap();

      // Reset UI after success
      handleReset();
      setResultDialog(false);
      
      // Show success message
      alert("Data STNK berhasil disimpan!");
      
    } catch (err) {
      console.error("Error saving final data:", err);
      setError("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel/close result dialog
  const handleCancelResult = () => {
    setResultDialog(false);
    setScanResult(null);
    setCorrectedNumber("");
  };

  const handlePreview = () => {
    if (imagePreview) setPreviewDialog(true);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setError(null);
    setScanResult(null);
    setCorrectedNumber("");
    setResultDialog(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      <Card className="mb-6 shadow-md">
        <CardHeader
          title={
            <Box className="flex items-center gap-2">
              <i className="bi bi-cloud-upload-fill text-xl text-gray-600"></i>
              <Typography variant="h6" className="font-semibold">
                Upload & Process STNK
              </Typography>
            </Box>
          }
        />
        <Divider />
        <CardContent className="p-6">
          <Grid container direction="column" spacing={4}>
            <Grid item xs={12}>
              <Box
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
                  ${selectedImage
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}
                `}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                  id="stnk-upload"
                  disabled={isProcessing}
                />
                <label htmlFor="stnk-upload" className={`cursor-pointer ${isProcessing ? 'pointer-events-none' : ''}`}>
                  <i className={`bi bi-image text-5xl mb-4 block ${selectedImage ? "text-blue-500" : "text-gray-400"}`}></i>
                  <Typography variant="h6" className="mb-2 font-medium">
                    {isProcessing ? "Memproses..." : selectedImage ? "File Terpilih" : "Pilih Gambar STNK"}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 mb-2">
                    {isProcessing ? "Sedang memproses gambar STNK..." : selectedImage ? selectedImage.name : "Drag & drop atau klik untuk memilih file"}
                  </Typography>
                  <Typography variant="caption" className="text-gray-400">
                    Format: JPG, PNG, JPEG (Max: 5MB)
                  </Typography>
                </label>
                {selectedImage && !isProcessing && (
                  <Box className="mt-4">
                    <Chip label="Siap Diproses" color="success" size="small" icon={<i className="bi bi-check-circle"></i>} />
                  </Box>
                )}
                {isProcessing && (
                  <Box className="mt-4">
                    <CircularProgress size={24} />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          <Box className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
            <Button
              variant="contained"
              color="success"
              onClick={openCamera}
              disabled={isProcessing}
              startIcon={<i className="bi bi-camera"></i>}
            >
              Ambil Foto STNK
            </Button>
            {/* <Button
              variant="contained"
              onClick={handlePreview}
              disabled={!selectedImage || isProcessing}
              color="secondary"
              startIcon={<i className="bi bi-eye"></i>}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Preview
            </Button> */}
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={isProcessing}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
              startIcon={<i className="bi bi-arrow-clockwise"></i>}
            >
              Reset
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md">
        <DialogTitle className="bg-purple-50">
          <Box className="flex items-center gap-2">
            <i className="bi bi-eye text-purple-600"></i>
            <Typography variant="h6" className="font-semibold">Preview Gambar STNK</Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent className="p-6">
          {imagePreview && (
            <Box className="w-full max-w-md mx-auto">
              <img src={imagePreview} alt="STNK Preview" className="max-w-full max-h-96 object-contain rounded-lg shadow-md border" />
              <Box className="mt-4 p-3 bg-gray-50 rounded-lg">
                <Typography variant="body2" className="text-gray-600"><strong>Nama File:</strong> {selectedImage?.name}</Typography>
                <Typography variant="body2" className="text-gray-600"><strong>Ukuran:</strong> {(selectedImage?.size / 1024 / 1024).toFixed(2)} MB</Typography>
                <Typography variant="body2" className="text-gray-600"><strong>Tipe:</strong> {selectedImage?.type}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions className="p-4">
          <Button onClick={() => setPreviewDialog(false)} className="text-gray-600">Tutup</Button>
        </DialogActions>
      </Dialog>

      {/* Result Dialog - Simplified and Fixed */}
      <Dialog 
        open={resultDialog} 
        onClose={handleCancelResult} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown={isSubmitting}
      >
        <DialogTitle className="bg-green-50">
          <Box className="flex items-center gap-2">
            <i className="bi bi-check-circle text-green-600"></i>
            <Typography variant="h6" className="font-semibold">Hasil Scan STNK</Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent className="p-6">
          <Grid container spacing={4}>
            {/* Image Preview */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" className="mb-3 font-medium text-gray-800">
                Gambar STNK
              </Typography>
              {imagePreview && (
                <Box className="text-center">
                  <img 
                    src={imagePreview} 
                    alt="STNK" 
                    className="max-w-full max-h-80 object-contain rounded-lg shadow-md border" 
                  />
                  <Typography variant="caption" className="text-gray-500 mt-2 block">
                    {selectedImage?.name}
                  </Typography>
                </Box>
              )}
            </Grid>
            
            {/* Scan Result Display */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" className="mb-3 font-medium text-gray-800">
                Nomor Rangka Terdeteksi
              </Typography>
              
              <Box className="mb-4 p-4 bg-gray-50 rounded-lg border">
                <Typography variant="body2" className="text-gray-600 mb-2">
                  Hasil Scan:
                </Typography>
                <Typography variant="h6" className="font-mono text-lg text-gray-800">
                  {scanResult?.nomor_rangka || "Tidak terdeteksi"}
                </Typography>
              </Box>
              
              {/* Correction Field */}
              <Box className="mb-4">
                <Typography variant="body2" className="text-gray-800 mb-2 font-medium">
                  Nomor Rangka Final:
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={correctedNumber}
                  onChange={(e) => setCorrectedNumber(e.target.value)}
                  placeholder="Masukkan nomor rangka yang benar"
                  className="font-mono"
                  helperText="Periksa dan koreksi nomor rangka jika diperlukan"
                  disabled={isSubmitting}
                  required
                />
              </Box>

              {/* Show if corrected */}
              {correctedNumber && correctedNumber !== (scanResult?.nomor_rangka || "") && (
                <Box className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <Typography variant="body2" className="text-orange-800">
                    <i className="bi bi-info-circle me-1"></i>
                    Nomor rangka telah dikoreksi dari hasil scan
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions className="p-4">
          <Button 
            onClick={handleCancelResult} 
            disabled={isSubmitting}
            className="text-gray-600"
          >
            Batal
          </Button>
          <Button
            onClick={handleFinalSubmit}
            variant="contained"
            disabled={isSubmitting || !correctedNumber.trim()}
            className="bg-green-600 hover:bg-green-700"
            startIcon={
              isSubmitting ? 
                <CircularProgress size={16} color="inherit" /> : 
                <i className="bi bi-check-lg"></i>
            }
          >
            {isSubmitting ? "Menyimpan..." : "Konfirmasi & Simpan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Camera Dialog */}
      <Dialog open={cameraDialog} onClose={closeCamera} maxWidth="sm" fullWidth>
        <DialogTitle className="bg-gray-100">
          <Box className="flex items-center gap-2">
            <i className="bi bi-camera text-blue-600"></i>
            <Typography variant="h6">Ambil Foto STNK</Typography>
          </Box>
        </DialogTitle>
        <DialogContent className="relative p-0 bg-black">
          <Box className="relative w-full h-[768px]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* FRAME BANTU */}
            <Box className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Box className="border-4 border-yellow-400 w-[250px] h-[450px] rounded-md" />
            </Box>
          </Box>

          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>

        <DialogActions className="p-4">
          <Button onClick={closeCamera} color="error">Batal</Button>
          <Button onClick={handleTakePhoto} variant="contained" className="bg-blue-600 hover:bg-blue-700">
            Ambil Gambar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default STNKUpload;