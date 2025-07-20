import {
  Accordion, AccordionDetails, AccordionSummary, Badge, Box, Button, Chip,
  CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
  Grid, TextField, Typography
} from "@mui/material";

const ResultDialog = ({
  open,
  onClose,
  results,
  correctedNumbers,
  setCorrectedNumbers,
  correctedQuantities,
  setCorrectedQuantities,
  correctedSamsatCodes,
  setCorrectedSamsatCodes,
  imagePreviews,
  selectedImages,
  expandedPanels,
  handleAccordionChange,
  expandAll,
  collapseAll,
  getStatusChip,
  handleImageZoom,
  handleSubmit,
  isSubmitting,
  userRole,
  selectedPTs,
  ptList,
  selectedBrands,
  brandList,
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
          {results.map((result, idx) => (
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
                  {/* Gambar */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" className="mb-2 font-medium">
                      Preview Gambar
                    </Typography>
                   <img
                      src={imagePreviews[idx]}
                      alt={`STNK Preview ${idx + 1}`}
                      style={{ transform: 'rotate(-90deg)', width: '100%', display: 'block' }}
                    />
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
                            updated[idx] = e.target.value;
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
                          value={correctedQuantities[idx] || ""}
                          onChange={(e) => {
                            const updated = [...correctedQuantities];
                            updated[idx] = e.target.value;
                            setCorrectedQuantities(updated);
                          }}
                          inputProps={{ min: 0 }}
                        />
                      </Grid>

                      {/* Bagian Kode Samsat, PT, Brand telah dihapus dari tampilan */}
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
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Semua"}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ResultDialog;
