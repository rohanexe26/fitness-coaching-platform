import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/custom-login/",
        { username, password, role }
      );

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      const displayRole = role === "user" ? "Member" : "Trainer";
      localStorage.setItem("user_role", displayRole);

      if (response.data.require_onboarding === true) {
        navigate("/onboarding");
      } else {
        navigate("/profile");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        "Login Failed. Invalid credentials.";
      alert(errorMsg);
      console.log(error.response?.data);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>
          Fit<span>Track</span>
          <div className="pulse-dot"></div>
        </h1>

        <p className="subtitle">
          Train Hard. Stay Consistent.
        </p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", paddingRight: "55px" }}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#a0a0a0",
              fontSize: "0.85rem",
              userSelect: "none",
              fontWeight: "500",
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <div className="role-selection">
          <label>
            <input
              type="radio"
              name="loginRole"
              value="user"
              checked={role === "user"}
              onChange={() => setRole("user")}
            />
            <span className="role-card">Member</span>
          </label>

          <label>
            <input
              type="radio"
              name="loginRole"
              value="trainer"
              checked={role === "trainer"}
              onChange={() => setRole("trainer")}
            />
            <span className="role-card">Trainer</span>
          </label>
        </div>

        <button onClick={handleLogin}>Login</button>

        <p className="auth-link">
          Don't have an account?
          <a href="/signup"> Register</a>
        </p>
      </div>
    </div>
  );
}

export default Login;