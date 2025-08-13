import {
  Accordion, AccordionDetails, AccordionSummary, Badge, Box, Button, Chip,
  CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  Grid, TextField, Typography
} from "@mui/material";

// --- PERBAIKAN: Tambahkan 'imageMap' dan 'handleImageZoom' ke props ---
const ResultDialog = ({
  open,
  onClose,
  results,
  imageMap, // <-- Prop baru dari parent
  handleImageZoom, // <-- Prop yang sebelumnya hilang
  correctedNumbers,
  setCorrectedNumbers,
  correctedQuantities,
  setCorrectedQuantities,
  // 'imagePreviews' dan 'selectedImages' tidak lagi dibutuhkan di sini, tapi kita terima agar tidak error
  selectedImages,
  expandedPanels,
  handleAccordionChange,
  expandAll,
  collapseAll,
  getStatusChip,
  handleSubmit,
  isSubmitting,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle className="bg-green-50">
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-2">
            <i className="bi bi-check-circle text-green-600"></i>
            <Typography variant="h6">Hasil Scan STNK</Typography>
            <Badge badgeContent={results.length} color="primary" />
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
          {results.map((result, idx) => {
            // --- PERBAIKAN: Cari gambar dan file yang benar berdasarkan 'filename' ---
            const correctImagePreview = imageMap?.get(result.filename);
            const originalFile = selectedImages.find(img => img.name === result.filename);

            return (
              <Accordion
                // --- PERBAIKAN: Gunakan `filename` sebagai key yang stabil ---
                key={result.filename || idx}
                expanded={expandedPanels.has(idx)}
                onChange={handleAccordionChange(idx)}
                className="border-b">
                <AccordionSummary
                  expandIcon={<i className="bi bi-chevron-down"></i>}
                  className="bg-gray-50">
                  <Box className="flex items-center justify-between w-full mr-4">
                    <Box className="flex items-center gap-3">
                      <Typography variant="subtitle1" className="font-medium">
                        {/* --- PERBAIKAN: Tampilkan nama file untuk identifikasi yang lebih baik --- */}
                        {`STNK #${idx + 1}`}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        {correctedNumbers[idx] || result.nomor_rangka || "Nomor tidak terdeteksi"}
                      </Typography>
                    </Box>
                    <Box className="flex items-center gap-2">
                      {getStatusChip(result, correctedNumbers[idx] || "", result.nomor_rangka || "")}
                      <Chip
                        label={
                          // --- PERBAIKAN: Gunakan file asli yang ditemukan untuk ukuran yang benar ---
                          originalFile
                            ? `${(originalFile.size / 1024 / 1024).toFixed(1)}MB`
                            : "0MB"
                        }
                        size="small"
                        variant="outlined"
                        className="text-xs"/>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails className="p-4">
                  <Grid container spacing={3}>
                    {/* Gambar */}
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" className="mb-2 font-medium">
                        Preview Gambar
                      </Typography>
                      {/* --- PERBAIKAN: Tampilkan gambar yang benar dari 'correctImagePreview' --- */}
                      {correctImagePreview ? (
                        <img
                          src={correctImagePreview}
                          alt={`STNK Preview for ${result.filename}`}
                          style={{
                            width: '100%',
                            maxHeight: '300px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            cursor: 'pointer'
                          }}
                          // --- PERBAIKAN: Panggil handleImageZoom dengan data yang benar ---
                          onClick={() => handleImageZoom(correctImagePreview, result.filename)}
                        />
                      ) : (
                        <Box sx={{
                          width: '100%', height: 200, bgcolor: '#f0f0f0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '8px', border: '1px solid #ddd'
                        }}>
                          <Typography variant="caption" color="textSecondary">
                            Preview tidak tersedia
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    {/* Data STNK */}
                    <Grid item xs={12} md={8}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Nomor Rangka *"
                            variant="outlined"
                            value={correctedNumbers[idx] || ""}
                            onChange={(e) => {
                              const updated = [...correctedNumbers];
                              updated[idx] = e.target.value.toUpperCase(); // <-- Tambahan: konversi ke uppercase
                              setCorrectedNumbers(updated);
                            }}
                            error={!correctedNumbers[idx]?.trim()}
                            helperText={!correctedNumbers[idx]?.trim() ? "Nomor rangka wajib diisi" : ""}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Jumlah"
                            variant="outlined"
                            type="number"
                            value={correctedQuantities[idx] || "0"} // Default value
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
            );
          })}
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions className="p-4 bg-gray-50">
        <Box className="flex items-center justify-between w-full">
          <Typography variant="body2" className="text-gray-600">
            {results.length} STNK terdeteksi • {correctedNumbers.filter(n => n?.trim()).length} siap disimpan
          </Typography>
          <Box className="flex gap-2">
            <Button onClick={onClose} disabled={isSubmitting}>
              Tutup
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting || correctedNumbers.some((n) => !n?.trim())}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <i className="bi bi-check-lg"></i>}
              className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? "Menyimpan..." : "Simpan Semua"}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ResultDialog;