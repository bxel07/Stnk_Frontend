import axios from "@/services/axiosInstance";

const API_BASE_URL = import.meta.env.VITE_API_URL;
export const uploadStnk = (formData) =>
    axios.post("/upload-stnk/", formData, {
    headers: {
        "Content-Type": "multipart/form-data",
    },
});

// ============================================================
// FUNGSI BARU UNTUK UPLOAD BATCH
// ============================================================
export const uploadStnkBatch = (formData) =>
  axios.post("/upload-stnk-batch/", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    
export const saveStnkData = (data) => {
  const token = localStorage.getItem("token");
    return axios.post("/save-stnk-data/", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
    
export const getAllStnk = () => axios.get('/stnk-data/');
export const getStnkById = (id) => axios.get(`/stnk/${id}`);
export const getAllStnkCorrection = () => axios.get('/stnk-data/with-correction/');
export const updateStnk = (id, data) => axios.put(`/stnk-data/${id}/correction/`, data);
export const getPTList = () => axios.get("/glbm-pt");
export const getBrandList = () => axios.get("/glbm-brand");


// Add the new function
export const getStnkListByDate = (date) => axios.get(`/stnk-data/by-created-date/?date=${date}`);


// Update nomor rangka dan jumlah langsung ke STNKData
export const updateStnkInfo = (id, data) =>
  axios.put(`/stnk-data/${id}/update-info/`, data);
  export const login = ({ username, password }) => {
    return axios.post(`${API_BASE_URL}/login`, {
      username,
      password,
    });
  };