import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  uploadStnk,
  getAllStnk,
  getStnkById,
  updateStnk,
  getAllStnkCorrection,
  saveStnkData
} from "@/services/stnkService";

export const fetchStnkList = createAsyncThunk(
  'stnk/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllStnk();
      // The API returns { data: [...] }
      return response.data.data; // Extract the data array
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch STNK data');
    }
  }
);

export const fetchStnkListByCorrection = createAsyncThunk(
  'stnk/fetchListByCorrection',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllStnkCorrection();
      // The API returns { data: [...] }
      return response.data.data; // Extract the data array
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch STNK data');
    }
  }
);

export const fetchStnkById = createAsyncThunk(
  "stnk/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getStnkById(id);

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const createStnk = createAsyncThunk(
  "stnk/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await uploadStnk(formData);

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const editStnk = createAsyncThunk(
  "stnk/edit",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateStnk(id, data);

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

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


// =================== Slice ===================

const stnkSlice = createSlice({
  name: "stnk",
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null, // Tambahkan untuk menangani error
  },
  reducers: {
    clearSelectedStnk: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // === FETCH ALL ===
      .addCase(fetchStnkList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStnkList.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchStnkList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // === FETCH BY CORRECTION ===
      .addCase(fetchStnkListByCorrection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      
      .addCase(fetchStnkListByCorrection.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload; // Ini yang memastikan data update
      })
      .addCase(fetchStnkListByCorrection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // === FETCH BY ID ===
      .addCase(fetchStnkById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })

      // === CREATE ===
      .addCase(createStnk.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })


      .addCase(editStnk.fulfilled, (state, action) => {
        // Cari ID-nya
        const idx = state.list.findIndex(item => item.id === action.payload.id);
        if (idx !== -1) {
          // Replace datanya
          state.list[idx] = action.payload;
        } else {
          // Tambahkan jika belum ada
          state.list.push(action.payload);
        }
      })    
      
      
     

  },
});

export const { clearSelectedStnk } = stnkSlice.actions;
export default stnkSlice.reducer;
