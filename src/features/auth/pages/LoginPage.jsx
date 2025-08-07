import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import {
  Typography, TextField, Button, Paper, Box,
  Alert, Container, Card, CardContent, Fade, CircularProgress
} from "@mui/material";
import {
  DirectionsCar, Description, Verified, Security, Login as LoginIcon
} from "@mui/icons-material";
import { loginUser } from "@/slices/loginSlice";
import { setCredentials } from "@/slices/authSlice";
import { useSelector } from "react-redux";
import { useEffect } from "react";

function LoginPage() {
  const [username, setNomorTelepon] = useState("");
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
      const { token, user } = await dispatch(
        loginUser({ username: username, password })
      ).unwrap();      
      dispatch(setCredentials({ token, user }));
      Swal.fire({
        title: "Login Berhasil",
        text: `Selamat datang, ${user.username}!`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
      navigate("/dashboard");
    } catch (error) {
      setErrorMsg(error || "Login gagal.");
    } finally {
      setLoading(false);
    }
  };
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const user = localStorage.getItem("user");
    if (token && user) {
      navigate("/dashboard"); // redirect ke dashboard kalau sudah login
    }
  }, []);

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '& fieldset': { borderColor: '#d1d5db' },
      '&:hover fieldset': { borderColor: '#166534', borderWidth: 2 },
      '&.Mui-focused fieldset': { borderColor: '#166534', borderWidth: 2 }
    },
    '& .MuiInputLabel-root': {
      color: '#64748b', fontWeight: 500,
      '&.Mui-focused': { color: '#166534', fontWeight: 600 }
    },
    '& .MuiOutlinedInput-input': {
      padding: '14px 16px', fontSize: 16
    }
  };

  return (
    <Box className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <Container maxWidth="sm">
        <Fade in timeout={800}>
          <Box className="space-y-6">
            {/* Header */}
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <Box className="bg-gradient-to-r from-green-700 to-green-800 p-6 flex items-center justify-center gap-4">
                <Box className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                  <DirectionsCar sx={{ color: 'white', fontSize: 35 }} />
                </Box>
                <Box className="text-center text-white">
                  <Typography variant="h4" className="font-bold mb-1">STNK Reader</Typography>
                  <Typography variant="subtitle1">Aplikasi Pembaca STNK Digital</Typography>
                </Box>
                <Box className="hidden md:flex items-center gap-2">
                  <Description sx={{ color: 'white', fontSize: 32 }} />
                  <Verified sx={{ color: 'white', fontSize: 32 }} />
                </Box>
              </Box>
            </Card>

            {/* Form */}
            <Card className="shadow-lg rounded-2xl">
              <Box className="bg-green-50 p-4 border-b border-green-200 flex justify-center items-center gap-2">
                <Security sx={{ color: '#166534', fontSize: 24 }} />
                <Typography variant="h6" className="font-bold text-gray-800">Login ke Sistem</Typography>
              </Box>
              <CardContent className="p-6">
                {errorMsg && (
                  <Alert
                    severity="error"
                    className="mb-4 rounded-xl"
                    sx={{
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      '& .MuiAlert-icon': { color: '#dc2626' }
                    }}>
                    {errorMsg}
                  </Alert>
                )}
                <Box component="form" onSubmit={handleLogin} className="space-y-4 mb-4">
                <TextField
                  fullWidth
                  label="Username"
                  required
                  value={username}
                  onChange={(e) => setNomorTelepon(e.target.value)}
                  variant="outlined"
                  sx={{ ...inputStyle, mb: 2 }}
                />
                  <TextField
                    fullWidth label="Password" type="password" required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="outlined" sx={{ ...inputStyle, mb: 2 }}
                  />
                  <Button
                    type="submit" fullWidth variant="contained" disabled={loading}
                    className="rounded-xl shadow-lg"
                    sx={{
                      backgroundColor: '#166534',
                      '&:hover': {
                        backgroundColor: '#134e2a',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 20px rgba(22, 101, 52, 0.3)'
                      },
                      '&:disabled': { backgroundColor: '#9ca3af', color: 'white' },
                      padding: '14px 0', fontSize: 16, fontWeight: 600,
                      textTransform: 'none', borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(22, 101, 52, 0.2)', transition: 'all 0.3s ease'
                    }}>
                    <Box className="flex items-center gap-2">
                      {loading ? (
                        <>
                          <CircularProgress size={20} sx={{ color: 'white' }} />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <LoginIcon sx={{ fontSize: 20 }} />
                          <span>Masuk</span>
                        </>
                      )}
                    </Box>
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Footer */}
            <Paper elevation={3} className="p-4 rounded-2xl text-center bg-white/80 backdrop-blur-sm">
              <Typography variant="body2" className="text-gray-600">
                © 2025 STNK Reader Application - Sistem Manajemen STNK Digital
              </Typography>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default LoginPage;
