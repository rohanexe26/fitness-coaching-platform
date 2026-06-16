import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import "../App.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [customUsername, setCustomUsername] = useState("");

  const navigate = useNavigate(); 

  const handleSignup = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/signup/",
        { username, password, role }
      );
      alert(response.data.message);
      navigate("/"); // Directs manual form signup over to login cleanly
    } catch (error) {
      console.error("Signup error context:", error);
      const errorMsg = error.response?.data?.error || "Registration failed.";
      alert(errorMsg);
    }
  };

  const handleCustomUsernameSubmit = async () => {
    if (!customUsername.trim()) {
      alert("Please enter a valid username.");
      return;
    }
    await completeGoogleAuth(googleCredential, customUsername);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    await completeGoogleAuth(credentialResponse.credential, null);
  };

  const completeGoogleAuth = async (tokenString, usernameString) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/google-auth/", {
        token: tokenString,
        role: role,
        username: usernameString 
      });

      if (response.data.action === "require_username") {
        setGoogleCredential(tokenString);
        setShowUsernameForm(true);
        return;
      }

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      
      const displayRole = role === "user" ? "Member" : "Trainer";
      localStorage.setItem("user_role", displayRole);

      if (response.data.action === "signup") {
        alert("Account setup complete!");
        // If a brand new Member signs up via Google, send them to onboarding!
        if (role === "user") {
          navigate("/onboarding");
        } else {
          navigate("/profile");
        }
      } else {
        // Fallback flag check for existing profiles using social sign up elements
        alert("Welcome back!");
        if (role === "user" && response.data.require_onboarding === true) {
          navigate("/onboarding");
        } else {
          navigate("/profile");
        }
      }
    } catch (error) {
      console.error("Backend Google Auth Error:", error);
      let detailedError = error.response?.data?.error || error.message;
      alert("Google Auth Failed: " + detailedError);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Fit<span>Track</span><div className="pulse-dot"></div></h1>
        <p className="subtitle">Train Hard. Stay Consistent.</p>

        {showUsernameForm ? (
          <div style={{ animation: "fadeIn 0.3s ease", margin: "20px 0" }}>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "15px" }}>
              Welcome! Please choose a unique username to complete your FitTrack profile:
            </p>
            <input
              type="text"
              placeholder="Enter custom username"
              value={customUsername}
              onChange={(e) => setCustomUsername(e.target.value)}
              style={{ borderColor: "#00f0ff" }}
            />
            <button onClick={handleCustomUsernameSubmit} style={{ marginTop: "15px" }}>
              Complete Registration
            </button>
            <button 
              onClick={() => setShowUsernameForm(false)} 
              style={{ background: "transparent", color: "#64748b", border: "1px solid #1e293b", marginTop: "10px" }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
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
                  fontWeight: "500"
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            <div className="role-selection">
              <label>
                <input
                  type="radio"
                  name="signupRole"
                  value="user"
                  checked={role === "user"}
                  onChange={() => setRole("user")}
                />
                <span className="role-card">Member</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="signupRole"
                  value="trainer"
                  checked={role === "trainer"}
                  onChange={() => setRole("trainer")}
                />
                <span className="role-card">Trainer</span>
              </label>
            </div>

            <div className="google-container" style={{ marginTop: "16px" }}>
              <p className="google-divider">Or continue with Google</p>
              <GoogleLogin
                onSuccess={handleGoogleSuccess} 
                onError={() => alert("Google Authentication Failed")}
              />
            </div>

            <button onClick={handleSignup} style={{ marginTop: "20px" }}>Signup</button>
          </>
        )}

        <p className="auth-link" style={{ marginTop: "24px" }}>
          Already have an account?<a href="/"> Login</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
