import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const token = localStorage.getItem("access");
  const [userData, setUserData] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    alert("Logged out successfully");
    window.location.replace("/");
  };

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/dashboard/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      setUserData(response.data);
    })
    .catch((error) => {
      console.log(error);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.replace("/");
    });
  }, [token]);

  return (
    <div className="container">
      <div className="card">
        <h1>Fitness <span>Profile</span><div className="pulse-dot"></div></h1>

        <div className="profile-info" style={{ margin: "24px 0", textAlign: "left", lineHeight: "2" }}>
          <p style={{ color: "#94a3b8", fontSize: "15px" }}>
            Username: 
            <span style={{ color: "#ffffff", fontWeight: "600", marginLeft: "8px" }}>
              {userData?.username || "Loading..."}
            </span>
          </p>

          <p style={{ color: "#94a3b8", fontSize: "15px" }}>
            Role: 
            <span style={{ color: "#00f0ff", fontWeight: "700", marginLeft: "8px" }}>
              {userData?.role || "Loading..."} {/* Read direct from DB response */}
            </span>
          </p>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Profile;
