import { Box, Button, CircularProgress, Grid, Typography, TextField } from "@mui/material";

const STNKUploadForm = ({
  selectedImages,
  isProcessing,
  openCamera,
  handleReset,
  fileInputRef,
  handleImageUpload,
  kodeSamsat,
  jumlah,
  handleChange,
}) => {
  return (
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

          {isProcessing && (
            <Box className="mt-4">
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
      </Grid>

      {/* Preview gambar */}
      {selectedImages.length > 0 && (
        <Grid item>
          <Typography variant="subtitle1" className="mb-2 font-medium">
            Preview Gambar:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {selectedImages.map((img, index) => (
              <img
                key={index}
                src={URL.createObjectURL(img)}
                alt={`preview-${index}`}
                width={120}
                style={{ borderRadius: 8, objectFit: "cover", height: 80 }}
              />
            ))}
          </Box>
        </Grid>
      )}

      {/* Input kode_samsat dan jumlah */}
      <Grid item>
        <TextField
          fullWidth
          label="Kode Samsat"
          name="kode_samsat"
          value={kodeSamsat}
          onChange={handleChange}
        />
      </Grid>
      <Grid item>
        <TextField
          fullWidth
          label="Jumlah"
          name="jumlah"
          type="number"
          value={jumlah}
          onChange={handleChange}
        />
      </Grid>

      {/* Tombol aksi */}
      <Box className="mt-6 flex gap-3">
        <Button
          variant="contained"
          onClick={openCamera}
          startIcon={<i className="bi bi-camera"></i>}
          disabled={isProcessing || selectedImages.length >= 10}
        >
          Ambil Foto
        </Button>
        <Button
          variant="outlined"
          onClick={handleReset}
          disabled={isProcessing}
          startIcon={<i className="bi bi-arrow-clockwise"></i>}
        >
          Reset
        </Button>
      </Box>
    </Grid>
  );
};

export default STNKUploadForm;
