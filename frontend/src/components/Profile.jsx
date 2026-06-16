import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../App.css"; 

function Profile() {
  const token = localStorage.getItem("access");
  const [userData, setUserData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("profile"); // "profile" or "account"
  const dropdownRef = useRef(null);

  // Profile Metrics Form States (Shared/Conditional)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [editGender, setEditGender] = useState("M");
  const [editDob, setEditDob] = useState(""); 
  const [editWeight, setEditWeight] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [editGoal, setEditGoal] = useState("maintain");
  const [editActivity, setEditActivity] = useState("sedentary");

  // Trainer Unique Configuration Form States
  const [bioTitle, setBioTitle] = useState("");
  const [specialization, setSpecialization] = useState("general");
  const [maxCapacity, setMaxCapacity] = useState(15);
  const [experienceYears, setExperienceYears] = useState(2);
  const [isAcceptingClients, setIsAcceptingClients] = useState(true);

  // Account Credentials States
  const [newUsername, setNewUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    alert("Logged out successfully");
    window.location.replace("/");
  };

  const formatIncomingDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const handleEditDobChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 8) input = input.substring(0, 8);
    if (input.length > 4) {
      input = `${input.substring(0, 2)}/${input.substring(2, 4)}/${input.substring(4)}`;
    } else if (input.length > 2) {
      input = `${input.substring(0, 2)}/${input.substring(2)}`;
    }
    setEditDob(input);
  };

  const fetchDashboardData = () => {
    axios.get("http://127.0.0.1:8000/api/dashboard/", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      setUserData(response.data);
      setFirstName(response.data.first_name || "");
      setLastName(response.data.last_name || "");
      setNewUsername(response.data.username || "");
      
      if (response.data.metrics) {
        // Hydrate Trainer states if the role matches
        if (response.data.role === "Trainer") {
          setBioTitle(response.data.metrics.bio_title || "Certified Fitness Coach");
          setSpecialization(response.data.metrics.specialization || "general");
          setMaxCapacity(response.data.metrics.max_capacity || 15);
          setExperienceYears(response.data.metrics.experience_years || 2);
          setIsAcceptingClients(response.data.metrics.is_accepting_clients ?? true);
        } else {
          // Hydrate Member states
          setEditGender(response.data.metrics.gender || "M");
          setEditDob(formatIncomingDate(response.data.metrics.date_of_birth));
          setEditWeight(response.data.metrics.weight || "");
          setEditHeight(response.data.metrics.height || "");
          setEditGoal(response.data.metrics.fitness_goal || "maintain");
          setEditActivity(response.data.metrics.activity_level || "sedentary");
        }
      }
    })
    .catch((error) => {
      console.log(error);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.replace("/");
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    let payload = {
      first_name: firstName,
      last_name: lastName
    };

    if (userData.role === "Trainer") {
      payload = {
        ...payload,
        bio_title: bioTitle,
        specialization: specialization,
        max_capacity: parseInt(maxCapacity, 10),
        experience_years: parseInt(experienceYears, 10),
        is_accepting_clients: isAcceptingClients
      };
    } else {
      const parts = editDob.split("/");
      if (parts.length !== 3 || parts[2].length !== 4) {
        alert("Please enter a valid date of birth (DD/MM/YYYY).");
        return;
      }
      const backendDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

      if (parseFloat(editWeight) > 500 || parseFloat(editHeight) > 500) {
        alert("Weight and height metrics cannot exceed 500.");
        return;
      }

      payload = {
        ...payload,
        gender: editGender,
        date_of_birth: backendDate,
        weight: parseFloat(editWeight),
        height: parseFloat(editHeight),
        fitness_goal: editGoal,
        activity_level: editActivity
      };
    }

    try {
      await axios.put(
        "http://127.0.0.1:8000/api/update-profile/",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Account configurations saved completely!");
      setShowSettingsModal(false);
      fetchDashboardData();
    } catch (error) {
      alert("Failed to preserve configuration updates.");
    }
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    const cleanUser = newUsername.trim().toLowerCase();
    if (!cleanUser) return;

    try {
      await axios.put(
        "http://127.0.0.1:8000/api/change-username/",
        { username: cleanUser },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Username updated successfully.");
      setShowSettingsModal(false);
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update username.");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    try {
      await axios.put(
        "http://127.0.0.1:8000/api/change-password/",
        { old_password: oldPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Security credentials modified successfully!");
      setOldPassword("");
      setNewPassword("");
      setShowSettingsModal(false);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to mutate password credentials.");
    }
  };

  // Shared Style Blocks for dark glass theme unification
  const glassInputStyle = {
    background: "#13151a",
    border: "1px solid #262930",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "#ffffff",
    fontSize: "15px",
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    height: "46px",
    display: "block",
    WebkitAppearance: "none",
    appearance: "none"
  };

  const labelHeaderStyle = {
    color: "#94a3b8", 
    fontSize: "13px", 
    fontWeight: "600", 
    marginBottom: "8px", 
    display: "block",
    textAlign: "left"
  };

  const isTrainer = userData?.role === "Trainer";
  if (!userData) return <div className="dashboard-loading"><div className="spinner"></div></div>;

  return (
    <div className="dashboard-wrapper">
      {/* 1. SIDEBAR NAV */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>Fit<span>Track</span><div className="pulse-dot"></div></h2>
        </div>
        
        <div className="user-profile-summary">
          <p className="summary-username">
            {userData.first_name || userData.last_name 
              ? `${userData.first_name} ${userData.last_name}`.trim() 
              : userData.username}
          </p>
          <p className={`summary-role ${isTrainer ? "role-trainer-text" : "role-member-text"}`}>
            {userData.role}
          </p>
        </div>

        <nav className="sidebar-menu">
          <a href="#overview" className="active">Workspace Overview</a>
          {isTrainer ? (
            <>
              <a href="#clients">Assigned Client Roster</a>
              <a href="#reviews">Performance Reviews</a>
              <a href="#routines">Prescription Programs</a>
            </>
          ) : (
            <>
              <a href="#workouts">My Workout Routines</a>
              <a href="#macros">Macro Tracker & Goals</a>
              <a href="#analytics">Fitness Analytics</a>
            </>
          )}
          <a href="#chat">Coach Connection Chat</a>
        </nav>
      </aside>

      {/* 2. MAIN DASHBOARD VIEW WINDOW */}
      <main className="main-dashboard">
        <header className="dashboard-header">
          <div className="welcome-text">
            <h1>Welcome back to FitTrack, <span>{userData.first_name || userData.username}</span>!</h1>
            <p className="header-subtitle">Manage your interactive dashboards and app feature integrations below.</p>
          </div>
          
          <div className="profile-dropdown-container" ref={dropdownRef}>
            <div 
              className="user-profile-circle" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ cursor: "pointer" }}
            >
              {(userData.first_name || userData.username).charAt(0).toUpperCase()}
            </div>

            {dropdownOpen && (
              <div className="profile-dropdown-menu">
                <div className="dropdown-header">
                  <p className="dropdown-user">
                    {userData.first_name ? `${userData.first_name} ${userData.last_name}` : userData.username}
                  </p>
                  <p className="dropdown-role">{userData.role} Account</p>
                </div>
                <hr className="dropdown-divider" />
                <a 
                  href="#settings" 
                  className="dropdown-item" 
                  onClick={() => { setShowSettingsModal(true); setActiveSettingsTab("profile"); setDropdownOpen(false); }}
                >
                  Account Settings
                </a>
                <a 
                  href="#username-change" 
                  className="dropdown-item" 
                  onClick={() => { setShowSettingsModal(true); setActiveSettingsTab("account"); setDropdownOpen(false); }}
                >
                  Change Username
                </a>
                <hr className="dropdown-divider" />
                <button onClick={handleLogout} className="dropdown-logout-btn">
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* 3. CONDITIONALLY RENDERED STATISTICS GRID */}
        {isTrainer ? (
          /* ==================== TRAINER DASHBOARD GRID ==================== */
          <div className="dashboard-grid">
            <div className="stat-card unique-glow">
              <h3>Active Coaching Load</h3>
              <p className="stat-number">
                {userData.metrics?.total_clients ?? 0} <span className="unit">/ {userData.metrics?.max_capacity ?? 15} Clients</span>
              </p>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${Math.min(((userData.metrics?.total_clients || 0) / (userData.metrics?.max_capacity || 15)) * 100, 100)}%`,
                    background: "linear-gradient(90deg, #a855f7, #38bdf8)"
                  }}
                ></div>
              </div>
              <span className="stat-delta neutral" style={{ marginTop: "8px", display: "block" }}>
                Roster is {Math.round(((userData.metrics?.total_clients || 0) / (userData.metrics?.max_capacity || 15)) * 100)}% utilized | Status: {userData.metrics?.is_accepting_clients ? "Accepting Members" : "Roster Full"}
              </span>
            </div>

            <div className="stat-card">
              <h3>Roster Macro Compliance</h3>
              <p className="stat-number">{userData.metrics?.roster_compliance ?? 86}% <span className="unit">Avg</span></p>
              <span className="stat-delta positive">▲ 4% improvement over last rolling 7 days</span>
            </div>

            <div className="stat-card">
              <h3>Active Prescriptions</h3>
              <p className="stat-number">{userData.metrics?.active_routines ?? 0} <span className="unit">Assigned</span></p>
              <span className="stat-delta warning">⏱️ {userData.metrics?.pending_alerts ?? 0} custom logs awaiting authorization reviews</span>
            </div>

            <div className="wide-table-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3>Client Management Roster</h3>
                <span style={{ color: "#a855f7", fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px" }}>RBAC DATABASE COMPLIANT</span>
              </div>
              <table className="roster-table">
                <thead>
                  <tr>
                    <th>Client Identifier</th>
                    <th>Assigned Fitness Objective</th>
                    <th>Macro Compliance Rating</th>
                    <th>System Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.roster && userData.roster.length > 0 ? (
                    userData.roster.map((client, idx) => (
                      <tr key={idx}>
                        <td>{client.username}</td>
                        <td>{client.fitness_objective || "General Conditioning"}</td>
                        <td className={client.compliance_rating < 80 ? "status-warn" : "status-good"}>
                          {client.compliance_rating}% {client.compliance_rating < 80 ? "Warning" : "Stable"}
                        </td>
                        <td><button className="table-action-btn">Review Logs</button></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", color: "#64748b" }}>No assigned clients found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ==================== MEMBER DASHBOARD GRID ==================== */
          <div className="dashboard-grid">
            <div className="stat-card unique-glow">
              <h3>Daily Nutrition Targets</h3>
              <p className="stat-number">{userData.metrics?.calories_consumed ?? 0} <span className="unit">/ {userData.metrics?.calorie_goal ?? 2000} kcal</span></p>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${Math.min(((userData.metrics?.calories_consumed || 0) / (userData.metrics?.calorie_goal || 2000)) * 100, 100)}%` }}></div>
              </div>
              <span className="stat-delta neutral" style={{ marginTop: "8px", display: "block" }}>
                {Math.round(((userData.metrics?.calories_consumed || 0) / (userData.metrics?.calorie_goal || 2000)) * 100)}% of baseline reached today
              </span>
            </div>

            <div className="stat-card">
              <h3>Protein Consumed</h3>
              <p className="stat-number">{userData.metrics?.protein_consumed ?? 0}g <span className="unit">/ {userData.metrics?.protein_goal ?? 140}g</span></p>
              <span className="stat-delta positive">
                {Math.max((userData.metrics?.protein_goal || 140) - (userData.metrics?.protein_consumed || 0), 0)}g remaining to target macro
              </span>
            </div>

            <div className="stat-card">
              <h3>Account Biological Status</h3>
              <p className="stat-number">{userData.metrics?.age || "--"} <span className="unit">yrs old</span></p>
              <p className="stat-delta" style={{ marginTop: "10px", color: "#64748b" }}>
                Weight: <strong>{userData.metrics?.weight ?? "--"} kg</strong> | Height: <strong>{userData.metrics?.height ?? "--"} cm</strong>
              </p>
              <p className="stat-delta warning" style={{ marginTop: "5px" }}>BMI Core Baseline: {userData.metrics?.bmi ?? "--"}</p>
            </div>

            <div className="wide-info-card ai-gradient-glow">
              <div className="card-text">
                <span className="ai-badge">AI Integration Assistant Enabled</span>
                <h3 style={{ marginTop: "14px" }}>Log Activities with Natural Language Processing</h3>
                <p style={{ margin: "8px 0 16px 0", color: "#475569", lineHeight: "1.6", fontSize: "14px" }}>
                  Don't like manual input forms? Type casual messages like <strong>"ran 5k in 25 mins"</strong> or <strong>"had a 500 calorie shake"</strong>. Our intelligent system handles string manipulation and writes structured values into your PostgreSQL engine seamlessly.
                </p>
                <button className="ai-action-btn">Launch AI Parser Window</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. SETTINGS DRAWER MODAL OVERLAY SHEET */}
      {showSettingsModal && (
        <div className="modal-overlay-shroud" onClick={() => setShowSettingsModal(false)} style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
          <div className="modal-settings-card clean-layout" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "550px", width: "95%", background: "#1a1d24", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "30px", borderRadius: "16px" }}>
            
            {/* TAB SELECTOR HEADER */}
            <div className="modal-tabs-header" style={{ display: "flex", gap: "25px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", marginBottom: "25px", paddingBottom: "2px" }}>
              <button 
                type="button"
                onClick={() => setActiveSettingsTab("profile")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: activeSettingsTab === "profile" ? "#38bdf8" : "#64748b",
                  borderBottom: activeSettingsTab === "profile" ? "2px solid #38bdf8" : "2px solid transparent",
                  padding: "10px 5px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "15px",
                  borderRadius: 0,
                  transition: "all 0.2s ease"
                }}
              >
                Profile Metrics
              </button>
              <button 
                type="button"
                onClick={() => setActiveSettingsTab("account")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: activeSettingsTab === "account" ? "#38bdf8" : "#64748b",
                  borderBottom: activeSettingsTab === "account" ? "2px solid #38bdf8" : "2px solid transparent",
                  padding: "10px 5px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "15px",
                  borderRadius: 0,
                  transition: "all 0.2s ease"
                }}
              >
                Account Credentials
              </button>
            </div>

            {activeSettingsTab === "profile" ? (
              /* TAB 1: PHYSICAL / OPERATIONAL METRICS FORM */
              <form onSubmit={handleUpdateProfile} className="onboard-flex-form">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "15px" }}>
                  <div className="modal-input-vertical-stack">
                    <label style={labelHeaderStyle}>First Name</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" style={glassInputStyle} />
                  </div>
                  <div className="modal-input-vertical-stack">
                    <label style={labelHeaderStyle}>Last Name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" style={glassInputStyle} />
                  </div>
                </div>

                {isTrainer ? (
                  /* ==================== TRAINER CONFIG INPUT LAYER ==================== */
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "15px" }}>
                      <div className="modal-input-vertical-stack">
                        <label style={labelHeaderStyle}>Professional Bio Title</label>
                        <input type="text" value={bioTitle} onChange={(e) => setBioTitle(e.target.value)} placeholder="e.g. Head Performance Coach" style={glassInputStyle} />
                      </div>
                      <div className="modal-input-vertical-stack">
                        <label style={labelHeaderStyle}>Years of Experience</label>
                        <input type="number" min="0" max="60" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} style={glassInputStyle} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "15px" }}>
                      <div className="modal-input-vertical-stack">
                        <label style={labelHeaderStyle}>Max Client Capacity</label>
                        <input type="number" min="1" max="100" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} style={glassInputStyle} />
                      </div>
                      <div className="modal-input-vertical-stack">
                        <label style={labelHeaderStyle}>Roster Intake Status</label>
                        <select value={isAcceptingClients ? "true" : "false"} onChange={(e) => setIsAcceptingClients(e.target.value === "true")} style={glassInputStyle}>
                          <option value="true">Accepting New Members</option>
                          <option value="false">Roster Full / Waitlist Mode</option>
                        </select>
                      </div>
                    </div>

                    <div className="modal-input-vertical-stack" style={{ marginBottom: "30px" }}>
                      <label style={labelHeaderStyle}>Primary Training Specialization</label>
                      <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} style={glassInputStyle}>
                        <option value="general">General Health & Weight Management</option>
                        <option value="hypertrophy">Body Recomposition & Hypertrophy</option>
                        <option value="athletic">Athletic Performance & Conditioning</option>
                        <option value="mobility">Functional Mobility & Injury Rehab</option>
                      </select>
                    </div>
                  </>
                ) : (
                  /* ==================== MEMBER CONFIG INPUT LAYER ==================== */
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "15px" }}>
                      <div className="modal-input-vertical-stack">
                        <label style={labelHeaderStyle}>Biological Gender</label>
                        <select value={editGender} onChange={(e) => setEditGender(e.target.value)} style={glassInputStyle}>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                        </select>
                      </div>
                      <div className="modal-input-vertical-stack">
                        <label style={labelHeaderStyle}>Date of Birth</label>
                        <input type="text" placeholder="dd/mm/yyyy" value={editDob} onChange={handleEditDobChange} required style={glassInputStyle} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "15px" }}>
                      <div className="modal-input-vertical-stack">
                        <label style={labelHeaderStyle}>Weight (kg)</label>
                        <input type="number" step="0.1" max="500" value={editWeight} onChange={(e) => setEditWeight(e.target.value)} required style={glassInputStyle} />
                      </div>
                      <div className="modal-input-vertical-stack">
                        <label style={labelHeaderStyle}>Height (cm)</label>
                        <input type="number" step="0.1" max="500" value={editHeight} onChange={(e) => setEditHeight(e.target.value)} required style={glassInputStyle} />
                      </div>
                    </div>

                    <div className="modal-input-vertical-stack" style={{ marginBottom: "15px" }}>
                      <label style={labelHeaderStyle}>Target Objective Goal</label>
                      <select value={editGoal} onChange={(e) => setEditGoal(e.target.value)} style={glassInputStyle}>
                        <option value="slim">Get Slim / Fat Loss</option>
                        <option value="maintain">Maintain Current Weight</option>
                        <option value="gain">Gain Muscle / Hypertrophy</option>
                      </select>
                    </div>

                    <div className="modal-input-vertical-stack" style={{ marginBottom: "30px" }}>
                      <label style={labelHeaderStyle}>Activity Intensity Level</label>
                      <select value={editActivity} onChange={(e) => setEditActivity(e.target.value)} style={glassInputStyle}>
                        <option value="sedentary">Little to no exercise</option>
                        <option value="light">Light exercise (1-3 days/week)</option>
                        <option value="moderate">Moderate exercise (3-5 days/week)</option>
                        <option value="active">Heavy exercise (6-7 days/week)</option>
                      </select>
                    </div>
                  </>
                )}

                <div style={{ display: "flex", gap: "15px", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowSettingsModal(false)} style={{ background: "transparent", color: "#94a3b8", border: "1px solid #262930", width: "110px", padding: "12px", borderRadius: "10px", cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ width: "180px", padding: "12px", background: "#38bdf8", color: "#111", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>Save Configuration</button>
                </div>
              </form>
            ) : (
              /* TAB 2: ACCOUNT MANAGEMENT (USERNAME + SECURE PASSWORD HUB) */
              <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                
                {/* PART A: USERNAME MANAGEMENT */}
                <form onSubmit={handleUpdateUsername} className="onboard-flex-form" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "25px" }}>
                  <div className="modal-input-vertical-stack">
                    <label style={labelHeaderStyle}>System Handle Username</label>
                    <div style={{ display: "flex", gap: "15px" }}>
                      <input 
                        type="text" 
                        value={newUsername} 
                        onChange={(e) => setNewUsername(e.target.value)} 
                        placeholder="Enter username" 
                        required 
                        style={{ ...glassInputStyle, flex: 1, textTransform: "lowercase" }}
                      />
                      <button type="submit" style={{ width: "140px", height: "46px", background: "#a855f7", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
                        Update User
                      </button>
                    </div>
                  </div>
                </form>

                {/* PART B: INTEGRATED SECURE PASSWORD MUTATION */}
                <form onSubmit={handleUpdatePassword} className="onboard-flex-form">
                  <h4 style={{ color: "#ffffff", textAlign: "left", fontSize: "14px", margin: "0 0 15px 0", letterSpacing: "0.5px" }}>MUTATE SECURITY PASSWORD</h4>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                    <div className="modal-input-vertical-stack">
                      <label style={labelHeaderStyle}>Current Password</label>
                      <input 
                        type="password" 
                        value={oldPassword} 
                        onChange={(e) => setOldPassword(e.target.value)} 
                        placeholder="••••••••" 
                        required 
                        style={glassInputStyle}
                      />
                    </div>
                    <div className="modal-input-vertical-stack">
                      <label style={labelHeaderStyle}>New Security Password</label>
                      <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        placeholder="••••••••" 
                        required 
                        style={glassInputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "15px", justifyContent: "flex-end", marginTop: "10px" }}>
                    <button type="button" onClick={() => setShowSettingsModal(false)} style={{ background: "transparent", color: "#94a3b8", border: "1px solid #262930", width: "110px", padding: "12px", borderRadius: "10px", cursor: "pointer" }}>
                      Cancel
                    </button>
                    <button type="submit" style={{ width: "180px", padding: "12px", background: "#e11d48", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;