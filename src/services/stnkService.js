import axios from "@/services/axiosInstance";

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
    
export const saveStnkData = (data) => axios.post("/save-stnk-data/", data);
export const getAllStnk = () => axios.get('/stnk-data/');
export const getStnkById = (id) => axios.get(`/stnk/${id}`);
export const getAllStnkCorrection = () => axios.get('/stnk-data/with-correction/');
export const updateStnk = (id, data) => axios.put(`/stnk-data/${id}/correction/`, data);

// Add the new function
export const getStnkListByDate = (date) => axios.get(`/stnk-data/by-created-date/?date=${date}`);


// Update nomor rangka dan jumlah langsung ke STNKData
export const updateStnkInfo = (id, data) =>
  axios.put(`/stnk-data/${id}/update-info/`, data);
