import { Box, Grid, TextField, MenuItem, Button } from "@mui/material";

const STNKFilter = ({
  filters,
  setFilters,
  onSearch,
  kodeSamsatList = [],
}) => {
  return (
    <Box className="mb-4">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Cari Nomor Rangka"
            fullWidth
            value={filters.search || ""}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            select
            label="Kode Samsat"
            fullWidth
            value={filters.kode_samsat || ""}
            onChange={(e) =>
              setFilters({ ...filters, kode_samsat: e.target.value })
            }
          >
            <MenuItem value="">Semua</MenuItem>
            {kodeSamsatList.map((kode) => (
              <MenuItem key={kode} value={kode}>
                {kode}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="contained"
            onClick={onSearch}
            className="bg-blue-600 text-white"
          >
            Cari
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default STNKFilter;
