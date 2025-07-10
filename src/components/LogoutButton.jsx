import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "@/slices/loginSlice";
import { Button } from "@mui/material";

function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/"); // arahkan ke halaman login
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outlined"
      color="error"
      sx={{ ml: 2 }}
    >
      Logout
    </Button>
  );
}

export default LogoutButton;
