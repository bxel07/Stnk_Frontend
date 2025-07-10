import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import {
  Card, CardContent, CardHeader, Typography, Button, Grid, Box,
  Chip, CircularProgress, Alert, Divider
} from "@mui/material";
import {
  processStnkBatch,
  saveStnk
} from "@/slices/stnkSlice";

import CameraDialog from "@/components/STNKUpload/CameraDialog";
import ResultDialog from "@/components/STNKUpload/ResultDialog";
import ZoomDialog from "@/components/STNKUpload/ZoomDialog";

// SweetAlert z-index fix
if (!document.getElementById("swal-high-z-index-style")) {
  const style = document.createElement("style");
  style.id = "swal-high-z-index-style";
  style.innerHTML = `.swal-high-z-index { z-index: 13000 !important; }`;
  document.head.appendChild(style);
}

const STNKUpload = () => {
  const dispatch = useDispatch();
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

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
          user_id: original.user_id || 1,
          glbm_samsat_id: original.glbm_samsat_id || 1,
          file: original.path?.split("\\").pop(), // ✅ fix untuk backend
          path: original.path,
          nomor_rangka: correctedNumbers[i].trim(),
          kode_samsat: correctedSamsatCodes[i].trim(),
          jumlah: parseInt(correctedQuantities[i]) || 0,
          corrected:
            correctedNumbers[i].trim() !== original.nomor_rangka ||
            (parseInt(correctedQuantities[i]) || 0) !== (original.jumlah || 0) ||
            correctedSamsatCodes[i].trim() !== (original.kode_samsat || ""),
        };
        

        console.log("Final data untuk simpan STNK:", finalData);
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
    if (!corrected.trim()) return <Chip label="Perlu Koreksi" color="error" size="small" />;
    if (corrected.trim() !== original) return <Chip label="Dikoreksi" color="warning" size="small" />;
    return <Chip label="Valid" color="success" size="small" />;
  };

  return (
    <>
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <Card className="mb-6 shadow-md">
        <CardHeader title={
          <Box className="flex items-center gap-2">
            <i className="bi bi-cloud-upload-fill text-xl text-gray-600"></i>
            <Typography variant="h6">Upload & Process STNK</Typography>
          </Box>
        } />
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
                    {selectedImages.length > 0
                      ? `${selectedImages.length} gambar dipilih`
                      : "Klik atau drag file gambar"}
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
            <Button variant="contained" onClick={openCamera} disabled={isProcessing || selectedImages.length >= 10}>
              <i className="bi bi-camera mr-2"></i> Ambil Foto
            </Button>
            <Button variant="outlined" onClick={resetAll} disabled={isProcessing || isSubmitting}>
              <i className="bi bi-arrow-clockwise mr-2"></i> Reset
            </Button>
          </Box>
        </CardContent>
      </Card>

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
        handleSubmit={handleFinalSubmit}
        isSubmitting={isSubmitting}
      />

      <ZoomDialog
        open={zoomDialog}
        onClose={() => setZoomDialog(false)}
        image={zoomedImage}
      />
    </>
  );
};

export default STNKUpload;
