import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  Typography,
  Box,
} from "@mui/material";

const STNKZoomDialog = ({ open, imageUrl, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="bg-gray-100">
        <Box className="flex justify-between items-center">
          <Typography variant="h6">Pratinjau Gambar</Typography>
          <IconButton onClick={onClose}>
            <i className="bi bi-x-lg text-gray-600"></i>
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent className="flex justify-center items-center p-4">
        <img
          src={imageUrl}
          alt="Zoom"
          className="max-h-[80vh] w-auto rounded shadow"
        />
      </DialogContent>
    </Dialog>
  );
};

export default STNKZoomDialog;
