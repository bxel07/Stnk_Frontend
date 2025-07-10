// CameraDialog.jsx
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

const CameraDialog = ({ open, onClose, onCapture, videoRef, canvasRef }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
        <Button onClick={onClose} color="error">
          Batal
        </Button>
        <Button onClick={onCapture} variant="contained" className="bg-blue-600 hover:bg-blue-700">
          Ambil Gambar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CameraDialog;
