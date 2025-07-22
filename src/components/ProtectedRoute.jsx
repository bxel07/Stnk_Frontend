import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";


const ProtectedRoute = ({ children }) => {
 const token  = useSelector((state) => state.auth.token);
  const location = useLocation();

  if (!token) return <Navigate to="/" state={{ from: location }} replace />;
  return children;
};

export default ProtectedRoute;
