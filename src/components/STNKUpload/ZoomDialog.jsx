// ZoomDialog.jsx
import { Box, Dialog, DialogContent, IconButton, Typography } from "@mui/material";

const ZoomDialog = ({ open, onClose, image }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        style: { backgroundColor: 'transparent', boxShadow: 'none' },
      }}
    >
      <DialogContent className="p-0 bg-black/90 min-h-[90vh] flex items-center justify-center">
        <Box className="relative w-full h-full flex flex-col items-center justify-center">
          {/* Header */}
          <Box className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <Typography variant="h6" className="text-white font-medium">
              {image.title}
            </Typography>
            <IconButton
              onClick={onClose}
              className="text-white bg-black/50 hover:bg-black/70"
              size="large"
            >
              <i className="bi bi-x-lg text-xl"></i>
            </IconButton>
          </Box>

          {/* Zoomed Image */}
          <Box className="relative w-full h-full flex items-center justify-center p-8">
            {image.src && (
              <img
                src={image.src}
                alt={image.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{ maxHeight: '85vh' }}
              />
            )}
          </Box>

          {/* Footer */}
          <Box className="absolute bottom-4 left-4 right-4 text-center">
            <Typography variant="body2" className="text-white/80">
              <i className="bi bi-info-circle mr-2"></i>
              Klik di luar gambar atau tombol ✕ untuk menutup
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ZoomDialog;
