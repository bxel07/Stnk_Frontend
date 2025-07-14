import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
  Typography,
  Divider,
  Box,
  IconButton,
  Alert,
  Tooltip,
} from "@mui/material";

const formatRupiah = (angka) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka || 0);
};

const STNKTable = ({
  data,
  isLoading,
  tableError,
  tableTitle,
  emptyMessage,
  activeTab,
  userRole,
  handleZoomImage,
  handleViewDetail,
  handleOpenEditDialog,
  handleEditCorrection,
  BASE_URL,
}) => {
  const safeData = Array.isArray(data) ? data : [];
  const totalGambar = safeData.filter((d) => !!d.image_url).length;

  return (
    <Card className="shadow-md mb-4">
      <CardHeader
        title={
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-2">
              <i className="bi bi-table text-xl text-gray-600"></i>
              <Typography variant="h6" className="font-semibold">
                {tableTitle} ({safeData.length} data, {totalGambar} gambar)
              </Typography>
            </Box>
            {isLoading && (
              <Box className="flex items-center gap-2">
                <CircularProgress size={20} />
                <Typography variant="body2" className="text-gray-500">Loading...</Typography>
              </Box>
            )}
          </Box>
        }
      />
      <Divider />

      <CardContent className="p-0">
        {tableError && (
          <Box className="p-4">
            <Alert severity="error">{tableError}</Alert>
          </Box>
        )}

        {safeData.length === 0 ? (
          <Box className="text-center py-12">
            <i className="bi bi-inbox text-6xl text-gray-300 mb-4 block"></i>
            <Typography variant="h6" className="text-gray-500 mb-2">{emptyMessage}</Typography>
            <Typography variant="body2" className="text-gray-400">
              {activeTab === 0
                ? "Upload gambar STNK untuk menambah data"
                : "Belum ada data koreksi STNK"}
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} className="max-h-96">
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className="bg-gray-100 font-bold text-gray-700">Gambar</TableCell>
                  <TableCell className="bg-gray-100 font-bold text-gray-700">File</TableCell>
                  <TableCell className="bg-gray-100 font-bold text-gray-700">Nomor Rangka</TableCell>
                  <TableCell className="bg-gray-100 font-bold text-gray-700">Jumlah (Rp)</TableCell>
                  <TableCell className="bg-gray-100 font-bold text-gray-700">Kode Samsat</TableCell>
                  <TableCell className="bg-gray-100 font-bold text-gray-700">Tanggal Dibuat</TableCell>
                  <TableCell className="bg-gray-100 font-bold text-gray-700">PT</TableCell>
                  <TableCell className="bg-gray-100 font-bold text-gray-700">Brand</TableCell>
                  <TableCell className="bg-gray-100 font-bold text-gray-700 text-center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {safeData.map((row) => (
                  <TableRow key={row.id} hover className="cursor-pointer">
                    <TableCell>
                      {row.image_url ? (
                        <img
                          src={`${BASE_URL}${row.image_url}`}
                          alt="preview"
                          title="Klik untuk zoom"
                          className="h-12 rounded shadow cursor-zoom-in hover:opacity-80"
                          onClick={() => handleZoomImage(`${BASE_URL}${row.image_url}`)}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium">
                      {row.file || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium">
                      {row.nomor_rangka || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-green-700 font-semibold">
                      {formatRupiah(row.jumlah)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {row.kode_samsat || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString("id-ID", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {row.nama_pt || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {row.nama_brand || "-"}
                    </TableCell>
                    <TableCell>
                      <Box className="flex justify-left">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetail(row)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <i className="bi bi-eye"></i>
                          </IconButton>
                        </Tooltip>

                        {(userRole === "admin" || userRole === "superadmin") && (
                          <Tooltip title="Edit Data">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditDialog(row)}
                              className="text-orange-600 hover:bg-orange-50"
                            >
                              <i className="bi bi-pencil"></i>
                            </IconButton>
                          </Tooltip>
                        )}

                        {activeTab === 1 && (
                          <Tooltip title="Edit Correction">
                            <IconButton
                              size="small"
                              onClick={() => handleEditCorrection(row)}
                              className="text-green-600 hover:bg-green-50"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default STNKTable;
