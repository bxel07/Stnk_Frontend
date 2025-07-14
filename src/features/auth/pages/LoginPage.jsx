import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import {
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Alert,
  Container
} from "@mui/material";
import { loginUser } from "@/slices/loginSlice";
import { setCredentials } from "@/slices/authSlice"; // ✅ tambahkan ini
import { toast } from "react-toastify";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const result = await dispatch(loginUser({ username, password })).unwrap();
      const { token, user } = result;

      // ✅ simpan token dan user ke Redux + localStorage
      dispatch(setCredentials({ token, user }));

      Swal.fire({
        title: "Login Berhasil",
        text: `Selamat datang, ${user.username}!`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
      
      navigate("/dashboard");
       // bebas disesuaikan role
    } catch (error) {
      setErrorMsg(error || "Login gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={1}
          sx={{
            padding: 4,
            borderRadius: 1,
            backgroundColor: 'white',
            border: '1px solid #e2e8f0'
          }}
        >
          <Box sx={{ marginBottom: 3, textAlign: 'center' }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                color: '#1e3a1c',
                marginBottom: 2
              }}
            >
              STNK Reader
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#64748b' }}>
              Aplikasi Pembaca STNK Digital
            </Typography>
          </Box>

          {errorMsg && (
            <Alert
              severity="error"
              sx={{
                marginBottom: 3,
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca'
              }}
            >
              {errorMsg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              margin="normal"
              variant="outlined"
              sx={{
                marginBottom: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d1d5db'
                  },
                  '&:hover fieldset': {
                    borderColor: '#065f46'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#065f46'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  '&.Mui-focused': {
                    color: '#065f46'
                  }
                }
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              margin="normal"
              variant="outlined"
              sx={{
                marginBottom: 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d1d5db'
                  },
                  '&:hover fieldset': {
                    borderColor: '#065f46'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#065f46'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  '&.Mui-focused': {
                    color: '#065f46'
                  }
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: '#065f46',
                '&:hover': {
                  backgroundColor: '#047857'
                },
                '&:disabled': {
                  backgroundColor: '#9ca3af'
                },
                padding: '12px 0',
                fontSize: '16px',
                fontWeight: 500,
                textTransform: 'none'
              }}
            >
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;
