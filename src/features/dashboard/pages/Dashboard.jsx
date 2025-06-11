import { Typography } from "@mui/material";

function Dashboard() {

  return (
    <div className="">
      {/* Header */}
      <div className="mb-8">
        <Typography
          variant="h4"
          component="h1"
          className="text-gray-800 font-bold mb-2"
        >
          <i className="bi bi-card-text me-3"></i>
          STNK Reader Application
        </Typography>
        <Typography variant="subtitle1" className="text-gray-600">
          Upload dan kelola data STNK dengan mudah
        </Typography>
      </div>
    </div>
  );
}

export default Dashboard;
