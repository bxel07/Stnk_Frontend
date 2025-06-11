import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
// Styles
import "@/styles/index.css";
import "bootstrap-icons/font/bootstrap-icons.css";
// Layout
import App from "./App.jsx";
// Store
import { store } from "@/store/index.js";
// Features
import Dashboard from "@/features/dashboard/pages/Dashboard.jsx";
import STNKDataTable from "@/features/stnk/pages/STNKDataTable.jsx";
import STNKUpload from "@/features/stnk/pages/STNKUpload.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route element={<App />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/data-stnk" element={<STNKDataTable />} />
            <Route path="/upload-stnk" element={<STNKUpload />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
