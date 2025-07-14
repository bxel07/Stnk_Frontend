import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Typography,
  Grid,
  Button,
  Box,
} from "@mui/material";

const STNKDetailDialog = ({ open, onClose, record, BASE_URL }) => {
  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="bg-blue-50">
        <Box className="flex items-center gap-2">
          <i className="bi bi-person-vcard text-blue-600"></i>
          <Typography variant="h6" className="font-semibold">
            Detail Data STNK
          </Typography>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent className="p-6">
        {record && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box className="space-y-4">
                {record.image_url && (
                  <Box className="text-center">
                    <img
                      src={`${BASE_URL}${record.image_url}`}
                      alt="STNK"
                      className="max-h-64 mx-auto rounded shadow"
                    />
                  </Box>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box className="bg-gray-50 p-3 rounded-lg">
                      <Typography variant="subtitle2" className="text-gray-500">
                        Nomor Rangka
                      </Typography>
                      <Typography className="font-mono">
                        {record.nomor_rangka || "-"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box className="bg-gray-50 p-3 rounded-lg">
                      <Typography variant="subtitle2" className="text-gray-500">
                        Jumlah (Rp)
                      </Typography>
                      <Typography className="font-mono text-green-700 font-semibold">
                        {formatRupiah(record.jumlah)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box className="bg-gray-50 p-3 rounded-lg">
                  <Typography variant="subtitle2" className="text-gray-500">
                    Kode Samsat
                  </Typography>
                  <Typography className="font-mono">
                    {record.kode_samsat || "-"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <Divider />
      <DialogActions className="p-4">
        <Button onClick={onClose} className="text-gray-600">
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default STNKDetailDialog;
