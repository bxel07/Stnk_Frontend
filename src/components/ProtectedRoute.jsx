// components/ProtectedRoute.jsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
 const token  = useSelector((state) => state.auth.token);
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      toast.warning("Silakan login terlebih dahulu", {
        position: "top-right",
        autoClose: 3000,
        pauseOnHover: false,
        hideProgressBar: false,
      });
    }
  }, [token]);

  if (!token) return <Navigate to="/" state={{ from: location }} replace />;
  return children;
};

export default ProtectedRoute;
