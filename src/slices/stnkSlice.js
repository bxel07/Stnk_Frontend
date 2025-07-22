import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  uploadStnk,
  getAllStnk,
  getStnkById,
  updateStnk,
  getAllStnkCorrection,
  saveStnkData,
  getStnkListByDate,
  uploadStnkBatch,
  updateStnkInfo,

} from "@/services/stnkService";

import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL;


// =============================================
// ============== ASYNC THUNKS ================
// =============================================

// -- Fetch All STNK --
export const fetchStnkList = createAsyncThunk(
  'stnk/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllStnk(); // <- ini axios call
      return response.data.data; // Langsung kembalikan array-nya
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// -- Fetch STNK by Correction --
export const fetchStnkListByCorrection = createAsyncThunk(
  'stnk/fetchListByCorrection',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllStnkCorrection();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch STNK data');
    }
  }
);

// -- Fetch STNK by ID --
export const fetchStnkById = createAsyncThunk(
  "stnk/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getStnkById(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch STNK by ID');
    }
  }
);

// -- Create STNK --
export const createStnk = createAsyncThunk(
  "stnk/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await uploadStnk(formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to create STNK');
    }
  }
);

// -- Update STNK --
export const editStnk = createAsyncThunk(
  "stnk/edit",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateStnk(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update STNK');
    }
  }
);

// -- Update Info Saja --
export const updateStnkInfoThunk = createAsyncThunk(
  "stnk/updateInfo",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateStnkInfo(id, data);
      return { id, updated: data, response: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update STNK info");
    }
  }
);

// -- Save STNK --
export const saveStnk = createAsyncThunk(
  "stnk/saveData",
  async (data, { rejectWithValue }) => {
    try {
      const res = await saveStnkData(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to save STNK data");
    }
  }
);

// -- Fetch STNK by Date --
export const fetchStnkListByDate = createAsyncThunk(
  'stnk/fetchStnkListByDate',
  async (date, { rejectWithValue }) => {
    try {
      const response = await getStnkListByDate(date);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
      return rejectWithValue(errorMessage);
    }
  }
);

// -- Process STNK Batch --
export const processStnkBatch = createAsyncThunk(
  "stnk/processBatch",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await uploadStnkBatch(formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Gagal memproses batch STNK");
    }
  }
);


// =============================================
// =============== STNK SLICE ==================
// =============================================

const stnkSlice = createSlice({
  name: "stnk",
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
    lastBatchResult: null,
  },
  reducers: {
    clearSelectedStnk: (state) => {
      state.selected = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearLastBatchResult: (state) => {
      state.lastBatchResult = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // === FETCH ===
      .addCase(fetchStnkList.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchStnkList.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchStnkList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(fetchStnkListByCorrection.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchStnkListByCorrection.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchStnkListByCorrection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(fetchStnkById.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchStnkById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchStnkById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(fetchStnkListByDate.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchStnkListByDate.fulfilled, state => { state.loading = false; })
      .addCase(fetchStnkListByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // === CREATE ===
      .addCase(createStnk.pending, state => { state.loading = true; state.error = null; })
      .addCase(createStnk.fulfilled, (state, action) => {
        state.loading = false;
        if (!Array.isArray(state.list)) state.list = [];
        if (action.payload) state.list.push(action.payload);
      })
      .addCase(createStnk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // === EDIT ===
      .addCase(editStnk.pending, state => { state.loading = true; state.error = null; })
      .addCase(editStnk.fulfilled, (state, action) => {
        state.loading = false;
        if (!Array.isArray(state.list)) state.list = [];
        const idx = state.list.findIndex(item => item.id === action.payload?.id);
        if (idx !== -1) {
          state.list[idx] = action.payload;
        } else {
          state.list.push(action.payload);
        }
      })
      .addCase(editStnk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // === UPDATE INFO ===
      .addCase(updateStnkInfoThunk.pending, state => { state.loading = true; state.error = null; })
      .addCase(updateStnkInfoThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { id, updated } = action.payload;
        const idx = state.list.findIndex(item => item.id === id);
        if (idx !== -1) {
          state.list[idx] = { ...state.list[idx], ...updated };
        }
      })
      .addCase(updateStnkInfoThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // === SAVE ===
      .addCase(saveStnk.pending, state => { state.loading = true; state.error = null; })
      .addCase(saveStnk.fulfilled, state => { state.loading = false; })
      .addCase(saveStnk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // === BATCH ===
      .addCase(processStnkBatch.pending, state => {
        state.loading = true;
        state.error = null;
        state.lastBatchResult = null;
      })
      .addCase(processStnkBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.lastBatchResult = action.payload;

        if (action.payload?.status === 'completed' && Array.isArray(action.payload?.results)) {
          const successfulUploads = action.payload.results.filter(r => r?.status === 'success' && r.nomor_rangka);
          if (!Array.isArray(state.list)) state.list = [];

          const transformedData = successfulUploads.map(result => ({
            id: result.id || `batch_${Date.now()}_${Math.random()}`,
            filename: result.filename,
            nomor_rangka: result.nomor_rangka,
            asal_kendaraan: result.details?.asal_kendaraan || '',
            pabrikan: result.details?.pabrikan || '',
            jumlah: result.details?.jumlah || 0,
            tahun_kendaraan: result.details?.tahun_kendaraan || null,
            found_by_method: result.details?.found_by_method || '',
            created_at: new Date().toISOString(),
            ...result
          }));

          state.list = [...state.list, ...transformedData];
        }
      })
      .addCase(processStnkBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to process STNK batch';
        state.lastBatchResult = null;
      });
      builder.addCase(deleteStnk.fulfilled, (state, action) => {
        const id = action.payload;
        state.list = state.list.filter(item => item.id !== id);
      });
      
  },
});


// =============================================
// ================ EXPORT =====================
// =============================================

export const {
  clearSelectedStnk,
  clearError,
  clearLastBatchResult
} = stnkSlice.actions;

export default stnkSlice.reducer;

// ==== Async Thunk untuk Login ====
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await login({ username, password });
      const { token, user } = response.data;

      // Simpan ke localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { token, user };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login gagal.");
    }
  }
);


export const deleteStnk = createAsyncThunk("stnk/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`${BASE_URL}/stnk/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || "Gagal menghapus data");
  }
});
