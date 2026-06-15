import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Passes username, password, and the active screen role toggle selection state
      const response = await axios.post(
        "http://127.0.0.1:8000/api/token/",
        { username, password, role }
      );

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      navigate("/profile");
    } catch (error) {
      // Reveals specific strict role rejection errors coming from Django
      const errorMsg = error.response?.data?.error || "Login Failed. Invalid credentials.";
      alert(errorMsg);
      console.log(error.response?.data);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/google-auth/", {
        token: credentialResponse.credential,
        role: role 
      });

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      alert("Google Login Successful!");
      navigate("/profile");
    } catch (error) {
      console.error("Backend Google Auth Error:", error);
      const errorMsg = error.response?.data?.error || error.message;
      alert(errorMsg);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Fit<span>Track</span><div className="pulse-dot"></div></h1>
        <p className="subtitle">Train Hard. Stay Consistent.</p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

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

        <div className="google-container">
          <p className="google-divider">Or continue with Google</p>
          <GoogleLogin
            onSuccess={handleGoogleSuccess} 
            onError={() => alert("Google Authentication Failed")}
          />
        </div>

        <button onClick={handleLogin}>Login</button>

        <p className="auth-link">
          Don't have an account?<a href="/signup"> Register</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
