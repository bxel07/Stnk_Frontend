import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login } from "@/services/stnkService";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ nomor_telepon, password }, { rejectWithValue }) => {
    try {
      const response = await login({ nomor_telepon, password });
      const { access_token, user } = response.data;

      // Simpan ke localStorage
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      return { token: access_token, user };
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || "Login gagal.");
    }
  }
);

const loginSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    },
    loadUserFromStorage(state) {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("access_token");
      if (user && token) {
        state.user = JSON.parse(user);
        state.token = token;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login gagal.";
      });
  },
});

export const { logout, loadUserFromStorage } = loginSlice.actions;

export default loginSlice.reducer;
