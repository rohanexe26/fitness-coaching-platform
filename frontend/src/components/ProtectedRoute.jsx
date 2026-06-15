import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  // Checks if the user is authorized
  const token = localStorage.getItem("access"); 

  if (!token) {
    // If not logged in, boot them back to the login page
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
