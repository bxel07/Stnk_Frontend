import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Typography,
  IconButton,
  TextField,
  Box,
} from "@mui/material";

const STNKEditDialog = ({ open, onClose, onSubmit, record, setRecord, BASE_URL }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="bg-orange-50 px-6 py-4">
        <Box className="flex justify-between items-center">
          <Typography variant="h6" className="text-orange-800 font-semibold">
            Edit Data
          </Typography>
          <IconButton onClick={onClose} size="small">
            <i className="bi bi-x-lg text-xl"></i>
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent className="px-6 py-6">
        {record && (
          <Box className="space-y-4">
            {record.image_url && (
              <Box className="text-center mb-4">
                <Box className="inline-block border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={`${BASE_URL}${record.image_url}`}
                    alt="Preview"
                    className="max-h-48 w-auto"
                  />
                </Box>
              </Box>
            )}

            <TextField
              label="Nomor Rangka"
              fullWidth
              variant="outlined"
              size="small"
              value={record.nomor_rangka || ""}
              onChange={(e) => setRecord({ ...record, nomor_rangka: e.target.value })}
            />
            <TextField
              label="Jumlah (Rp)"
              fullWidth
              variant="outlined"
              size="small"
              type="number"
              value={record.jumlah || ""}
              onChange={(e) =>
                setRecord({ ...record, jumlah: parseInt(e.target.value) || 0 })
              }
              InputProps={{ inputProps: { min: 0 } }}
            />
            <TextField
              label="Kode Samsat"
              fullWidth
              variant="outlined"
              size="small"
              value={record.kode_samsat || ""}
              onChange={(e) => setRecord({ ...record, kode_samsat: e.target.value })}
            />
          </Box>
        )}
      </DialogContent>
      <Divider />
      <DialogActions className="px-6 py-4 bg-gray-50">
        <Button onClick={onClose} variant="outlined" className="text-gray-600">
          Batal
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          className="bg-orange-600 text-white hover:bg-orange-700"
        >
          Simpan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default STNKEditDialog;
