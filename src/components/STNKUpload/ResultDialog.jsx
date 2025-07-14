  import {
    Accordion, AccordionDetails, AccordionSummary, Badge, Box, Button, Chip,
    CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
    Grid, TextField, Typography, MenuItem
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
    defaultPtId, // ✅ default PT ID dari user
    selectedPTs,
    setSelectedPTs,
    ptList,
    selectedBrands,
    setSelectedBrands,
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
              <Button size="small" onClick={expandAll}><i className="bi bi-arrows-expand mr-1"></i>Buka Semua</Button>
              <Button size="small" onClick={collapseAll}>Tutup Semua</Button>
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
                <AccordionSummary expandIcon={<i className="bi bi-chevron-down"></i>} className="bg-gray-50">
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
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails className="p-4">
                  <Grid container spacing={3}>
                    {/* Image Preview */}
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" className="mb-2 font-medium">Preview Gambar</Typography>
                      {imagePreviews[idx] && (
                        <Box className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                          <img
                            src={imagePreviews[idx]}
                            alt={`STNK Preview ${idx + 1}`}
                            className="w-full h-48 object-cover"
                            onClick={() => handleImageZoom(imagePreviews[idx], `STNK #${idx + 1}`)}
                          />
                          <Box className="p-2 bg-gray-50 text-center text-gray-600 text-xs">
                            <i className="bi bi-zoom-in mr-1" /> Klik untuk memperbesar
                          </Box>
                        </Box>
                      )}
                    </Grid>

                    {/* Input Fields */}
                    <Grid item xs={12} md={8}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Nomor Rangka *"
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
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="Jumlah"
                            type="number"
                            value={correctedQuantities[idx] || ""}
                            onChange={(e) => {
                              const updated = [...correctedQuantities];
                              updated[idx] = e.target.value;
                              setCorrectedQuantities(updated);
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="Kode Samsat"
                            value={correctedSamsatCodes[idx] || ""}
                            onChange={(e) => {
                              const updated = [...correctedSamsatCodes];
                              updated[idx] = e.target.value;
                              setCorrectedSamsatCodes(updated);
                            }}
                          />
                        </Grid>

                        {/* PT & Brand Input */}
                        {userRole === "superadmin" && (
                          <Grid item xs={12} sm={6}>
                            <TextField
                              select
                              fullWidth
                              label="PT"
                              value={selectedPTs[idx] || ""}
                              onChange={(e) => {
                                const updated = [...selectedPTs];
                                updated[idx] = e.target.value;
                                setSelectedPTs(updated);
                              }}
                            >
                              {ptList.map((pt) => (
                                <MenuItem key={pt.id} value={pt.id}>
                                  {pt.nama_pt}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        )}

                        {["cao", "admin", "superadmin"].includes(userRole) && (
                          <Grid item xs={12} sm={userRole === "superadmin" ? 6 : 12}>
                            <TextField
                              select
                              fullWidth
                              label="Brand"
                              value={selectedBrands[idx] || ""}
                              onChange={(e) => {
                                const updated = [...selectedBrands];
                                updated[idx] = parseInt(e.target.value, 10); // 👉 pastikan jadi integer
                                setSelectedBrands(updated);
                              }}                              
                            >
                              {brandList.map((brand) => (
                                <MenuItem key={brand.id} value={brand.id}>
                                  {brand.nama_brand}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        )}
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
          <Box className="flex justify-between items-center w-full">
            <Typography variant="body2" className="text-gray-600">
              {results.length} STNK terdeteksi • {correctedNumbers.filter(n => n?.trim()).length} siap disimpan
            </Typography>
            <Box className="flex gap-2">
              <Button onClick={onClose} disabled={isSubmitting}>Tutup</Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting || correctedNumbers.some(n => !n?.trim())}
                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <i className="bi bi-check-lg" />}
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
