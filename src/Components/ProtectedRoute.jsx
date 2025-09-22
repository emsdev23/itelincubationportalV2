// ProtectedRoute.js
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = sessionStorage.getItem("userid");

  //   const user = localStorage.getItem("userid");

  if (!user) {
    // not logged in → redirect to login
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
