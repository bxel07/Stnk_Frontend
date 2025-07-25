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
import LoginPage from "@/features/auth/pages/LoginPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx"; // kita akan update ini
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserListPage from "@/pages/UserListPage";
import ProfilePage from "@/pages/ProfilePage";
import RegisterUserModal from "./components/RegisterUserModal.jsx";
import MasterDataPage from "@/pages/MasterDataPage";



createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<App />}>
            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/data-stnk"
              element={<ProtectedRoute><STNKDataTable /></ProtectedRoute>}
            />
            <Route
              path="/upload-stnk"
              element={<ProtectedRoute><STNKUpload /></ProtectedRoute>}
            />
            <Route
              path="/admin/register"
              element={<ProtectedRoute allowedRoles={["admin", "superadmin"]}><RegisterUserModal /></ProtectedRoute>}/>
            <Route path="/admin/users" element={<ProtectedRoute><UserListPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/master-data" element={<ProtectedRoute><MasterDataPage /></ProtectedRoute>} />
          </Route>
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
