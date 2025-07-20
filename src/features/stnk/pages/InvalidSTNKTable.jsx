import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Box,
    Typography
  } from "@mui/material";
  import { Edit, Visibility } from "@mui/icons-material";
  
  const InvalidSTNKTable = ({ 
    data, 
    loading, 
    error, 
    onViewDetail,
    onEdit 
  }) => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }
  
    if (error) {
      return (
        <Box p={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }
  
    if (data.length === 0) {
      return (
        <Box textAlign="center" p={4}>
          <Typography variant="body1" color="textSecondary">
            Tidak ada data yang tidak valid
          </Typography>
        </Box>
      );
    }
  
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Gambar</TableCell>
              <TableCell>File</TableCell>
              <TableCell>Nomor Rangka</TableCell>
              <TableCell>Status Validasi</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  {/* Image preview */}
                </TableCell>
                <TableCell>{row.file || "-"}</TableCell>
                <TableCell>{row.nomor_rangka || "-"}</TableCell>
                <TableCell>
                  <Chip 
                    label="Tidak Valid" 
                    color="error"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Lihat Detail">
                      <IconButton onClick={() => onViewDetail(row)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Data">
                      <IconButton 
                        onClick={() => onEdit(row)}
                        color="warning"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  export default InvalidSTNKTable;