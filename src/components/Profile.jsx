import { Navigate } from "react-router-dom";

function Profile() {
  const token = localStorage.getItem("access");

  if (!token) {
    return <Navigate to="/" />;
  }

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    alert("Logged out successfully");

    window.location.href = "/";
  };

  return (
    <div>
      <h1>Profile Page</h1>
      <p>You are logged in successfully!</p>

      <br />

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Profile;