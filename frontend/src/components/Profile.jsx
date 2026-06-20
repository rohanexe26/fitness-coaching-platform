import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../App.css"; 
import CardioTracker from "./CardioTracker"; // Import the brand new cardio tracking module

// ==========================================
// UPGRADED TRAINER SUB-COMPONENTS
// ==========================================

function TrainerOverview({ userData, setActiveTab }) {
  const flaggedAlerts = [
    { client: "fitness_user_alpha", issue: "Macro deviation: Missed protein targets by over 30% for 3 consecutive days", severity: "High" },
    { client: "member_beta", issue: "Activity deficit: Zero logged training volume within last 48 hours", severity: "Medium" }
  ];

  const consultations = [
    { client: "rohan_member", time: "16:00", type: "Bi-Weekly Progress Assessment" },
    { client: "fitness_user_alpha", time: "17:30", type: "Nutritional Macro Alignment Sync" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        {/* Active Coaching Load Link */}
        <div 
          onClick={() => setActiveTab("clients")}
          className="stat-card unique-glow" 
          style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left", cursor: "pointer" }}
        >
          <h3 style={{ fontSize: "14px", color: "#94a3b8", textTransform: "uppercase", tracking: "0.5px", margin: "0 0 16px 0" }}>Active Coaching Load</h3>
          <p className="stat-number" style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 12px 0" }}>
            {userData.metrics?.total_clients ?? 1} <span className="unit" style={{ fontSize: "16px", color: "#64748b" }}>/ {userData.metrics?.max_capacity ?? 15} Clients</span>
          </p>
          <div className="progress-bar-container" style={{ background: "#1e293b", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "12px" }}>
            <div className="progress-bar" style={{ width: `${Math.min(((userData.metrics?.total_clients || 1) / (userData.metrics?.max_capacity || 15)) * 100, 100)}%`, height: "100%", background: "#a855f7" }}></div>
          </div>
          <span className="stat-delta neutral" style={{ color: "#64748b", fontSize: "13px" }}>
            Roster is {Math.round(((userData.metrics?.total_clients || 1) / (userData.metrics?.max_capacity || 15)) * 100)}% utilized | Status: {userData.metrics?.is_accepting_clients !== false ? "Accepting Members" : "Roster Full"}
          </span>
        </div>

        {/* Roster Macro Compliance Link */}
        <div 
          onClick={() => setActiveTab("reviews")}
          className="stat-card" 
          style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left", cursor: "pointer" }}
        >
          <h3 style={{ fontSize: "14px", color: "#94a3b8", textTransform: "uppercase", tracking: "0.5px", margin: "0 0 16px 0" }}>Roster Macro Compliance</h3>
          <p className="stat-number" style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 12px 0" }}>
            {userData.metrics?.roster_compliance ?? 86}% <span className="unit" style={{ fontSize: "16px", color: "#64748b" }}>Avg</span>
          </p>
          <div className="progress-bar-container" style={{ background: "#1e293b", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "12px" }}>
            <div className="progress-bar" style={{ width: `${userData.metrics?.roster_compliance ?? 86}%`, height: "100%", background: "#10b981" }}></div>
          </div>
          <span className="stat-delta positive" style={{ color: "#10b981", fontSize: "13px", fontWeight: "600" }}>
            Up 4% improvement over last rolling 7 days
          </span>
        </div>

        {/* Active Prescriptions Link */}
        <div 
          onClick={() => setActiveTab("routines")}
          className="stat-card" 
          style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left", cursor: "pointer" }}
        >
          <h3 style={{ fontSize: "14px", color: "#94a3b8", textTransform: "uppercase", tracking: "0.5px", margin: "0 0 16px 0" }}>Active Prescriptions</h3>
          <p className="stat-number" style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 12px 0" }}>
            {userData.metrics?.active_routines ?? 3} <span className="unit" style={{ fontSize: "16px", color: "#64748b" }}>Assigned</span>
          </p>
          <div className="progress-bar-container" style={{ background: "#1e293b", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "12px" }}>
            <div className="progress-bar" style={{ width: "100%", height: "100%", background: "#eab308" }}></div>
          </div>
          <span className="stat-delta warning" style={{ color: "#eab308", fontSize: "13px", fontWeight: "600" }}>
            {userData.metrics?.pending_alerts ?? 3} custom logs awaiting authorization reviews
          </span>
        </div>
      </div>

      {/* Flagged Anomalies Card Link */}
      <div 
        onClick={() => setActiveTab("reviews")}
        style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left", cursor: "pointer" }}
      >
        <h3 style={{ fontSize: "16px", color: "#fff", margin: "0 0 16px 0", fontWeight: "600" }}>Flagged Client Anomalies</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {flaggedAlerts.map((alert, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1a1d24", border: "1px solid #262930", padding: "14px 20px", borderRadius: "8px" }}>
              <div>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>{alert.client}</span>
                <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "13px" }}>{alert.issue}</p>
              </div>
              <span style={{ background: alert.severity === "High" ? "rgba(239, 68, 68, 0.15)" : "rgba(234, 179, 8, 0.15)", color: alert.severity === "High" ? "#ef4444" : "#eab308", border: alert.severity === "High" ? "1px solid #ef4444" : "1px solid #eab308", fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "6px" }}>
                {alert.severity} Risk
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        {/* Matrix Card Link */}
        <div 
          onClick={() => setActiveTab("clients")}
          style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left", cursor: "pointer" }}
        >
          <h3 style={{ fontSize: "16px", color: "#fff", margin: "0 0 16px 0" }}>Operational Roster Status Matrix</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1a1d24", paddingBottom: "10px" }}>
              <span style={{ color: "#94a3b8", fontSize: "14px" }}>Compliant Client Multipliers</span>
              <strong style={{ color: "#10b981" }}>84% Stable</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1a1d24", paddingBottom: "10px" }}>
              <span style={{ color: "#94a3b8", fontSize: "14px" }}>Awaiting Initial Intake</span>
              <strong style={{ color: "#fff" }}>0 Members</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#94a3b8", fontSize: "14px" }}>Average Roster Retention Block</span>
              <strong style={{ color: "#38bdf8" }}>94.2 Days</strong>
            </div>
          </div>
        </div>

        {/* Consultations Card Link */}
        <div 
          onClick={() => setActiveTab("chat")}
          style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left", cursor: "pointer" }}
        >
          <h3 style={{ fontSize: "16px", color: "#fff", margin: "0 0 16px 0" }}>Upcoming Live Consultations</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {consultations.map((meeting, idx) => (
              <div key={idx} style={{ display: "flex", gap: "16px", alignItems: "center", background: "#1a1d24", padding: "10px 16px", borderRadius: "8px", border: "1px solid #262930" }}>
                <span style={{ color: "#38bdf8", fontWeight: "700", fontSize: "15px" }}>{meeting.time}</span>
                <div>
                  <span style={{ color: "#fff", fontWeight: "600", fontSize: "14px" }}>{meeting.client}</span>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>{meeting.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AssignedClientRoster({ userData }) {
  const dynamicRoster = userData.roster && userData.roster.length > 0 ? userData.roster : [
    { username: "rohan_member", fitness_objective: "High-Intensity Functional Metabolic Cond.", compliance_rating: 94 },
    { username: "fitness_user_alpha", fitness_objective: "Progressive Overload Muscle Hypertrophy Layout", compliance_rating: 72 }
  ];

  return (
    <div className="wide-table-card" style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>Client Management Roster</h3>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "13px" }}>Active members registered under your professional configuration identifier</p>
        </div>
        <span style={{ color: "#a855f7", fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px" }}>RBAC DATABASE COMPLIANT</span>
      </div>
      <table className="roster-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #262930", color: "#64748b", fontSize: "13px" }}>
            <th style={{ padding: "12px 16px" }}>Client Identifier</th>
            <th style={{ padding: "12px 16px" }}>Assigned Fitness Objective</th>
            <th style={{ padding: "12px 16px" }}>Macro Compliance Rating</th>
            <th style={{ padding: "12px 16px" }}>System Actions</th>
          </tr>
        </thead>
        <tbody>
          {dynamicRoster.map((client, idx) => (
            <tr key={idx} style={{ borderBottom: "1px solid #1a1d24", color: "#fff", fontSize: "14px" }}>
              <td style={{ padding: "16px" }}>{client.username}</td>
              <td style={{ padding: "16px", color: "#94a3b8" }}>{client.fitness_objective}</td>
              <td style={{ padding: "16px", fontWeight: "600", color: client.compliance_rating < 80 ? "#ef4444" : "#10b981" }}>
                {client.compliance_rating}% {client.compliance_rating < 80 ? "Warning" : "Stable"}
              </td>
              <td style={{ padding: "16px" }}>
                <button className="table-action-btn" style={{ background: "#1e293b", border: "1px solid #334155", color: "#fff", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Review Logs</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PerformanceReviews() {
  const checkins = [
    { client: "fitness_user_alpha", date: "June 19, 2026", type: "Weekly Check-In", status: "Pending Review" },
    { client: "rohan_member", date: "June 17, 2026", type: "Mid-Cycle Assessment", status: "Completed" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", textAlign: "left" }}>
      <div style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px" }}>
        <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", color: "#fff" }}>Awaiting Performance Appraisals</h3>
        <p style={{ color: "#64748b", margin: "0 0 20px 0", fontSize: "13px" }}>Evaluate metrics updates and qualitative biofeedback entries</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {checkins.map((item, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1a1d24", padding: "16px", borderRadius: "10px", border: "1px solid #262930" }}>
              <div>
                <span style={{ color: "#fff", fontWeight: "600", fontSize: "14px" }}>{item.client}</span>
                <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "12px" }}>Submitted: {item.date} | {item.type}</p>
              </div>
              <button style={{ padding: "8px 16px", background: item.status === "Pending Review" ? "#a855f7" : "#1e293b", border: "none", color: "#fff", borderRadius: "6px", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}>
                {item.status === "Pending Review" ? "Evaluate Logs" : "View Archive"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrescriptionPrograms() {
  const templates = [
    { name: "Hypertrophy Blueprint Baseline", volume: "4 Days / Week Split", category: "Strength/Mass" },
    { name: "Metabolic Deficit Maintenance Layer", volume: "3 Days / Week Split", category: "Conditioning" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", textAlign: "left" }}>
      <div style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>Prescription Blueprints Hub</h3>
            <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "13px" }}>Deploy training architecture parameters to client accounts</p>
          </div>
          <button style={{ padding: "10px 20px", background: "#38bdf8", color: "#111", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>Create Template</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {templates.map((tmpl, idx) => (
            <div key={idx} style={{ background: "#1a1d24", border: "1px solid #262930", padding: "20px", borderRadius: "10px" }}>
              <span style={{ color: "#a855f7", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>{tmpl.category}</span>
              <h4 style={{ margin: "8px 0 12px 0", fontSize: "16px", color: "#fff" }}>{tmpl.name}</h4>
              <p style={{ margin: "0 0 16px 0", color: "#64748b", fontSize: "13px" }}>{tmpl.volume}</p>
              <button style={{ width: "100%", padding: "8px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: "6px", fontSize: "13px", cursor: "pointer" }}>Deploy to Client</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MEMBER SUB-COMPONENTS (WITH STATE LINKS MAPS)
// ==========================================

function WorkspaceOverview({ userData, waterCups, setWaterCups, setActiveTab, onRefresh }) {
  const consistencyDays = [
    { day: "Mon", met: true },
    { day: "Tue", met: true },
    { day: "Wed", met: false },
    { day: "Thu", met: true },
    { day: "Fri", met: false },
    { day: "Sat", met: false },
    { day: "Sun", met: false }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        
        {/* Daily Nutrition Targets Card Link */}
        <div 
          onClick={() => setActiveTab("macros")}
          className="stat-card unique-glow" 
          style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left", cursor: "pointer" }}
        >
          <h3 style={{ fontSize: "14px", color: "#94a3b8", textTransform: "uppercase", tracking: "0.5px", margin: "0 0 16px 0" }}>Daily Net Calories</h3>
          <p className="stat-number" style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 12px 0" }}>
            {userData.metrics?.net_calories ?? 0} <span className="unit" style={{ fontSize: "16px", color: "#64748b" }}>/ {userData.metrics?.calorie_goal ?? 2430} kcal</span>
          </p>
          <div className="progress-bar-container" style={{ background: "#1e293b", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "12px" }}>
            <div className="progress-bar" style={{ width: `${Math.min(((userData.metrics?.net_calories || 0) / (userData.metrics?.calorie_goal || 2430)) * 100, 100)}%`, height: "100%", background: "#38bdf8" }}></div>
          </div>
          <span className="stat-delta neutral" style={{ color: "#64748b", fontSize: "13px" }}>
            Logged: {userData.metrics?.calories_consumed ?? 0} kcal | Burned: {userData.metrics?.calories_burned ?? 0} kcal
          </span>
        </div>

        {/* Protein Consumed Card Link */}
        <div 
          onClick={() => setActiveTab("macros")}
          className="stat-card" 
          style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left", cursor: "pointer" }}
        >
          <h3 style={{ fontSize: "14px", color: "#94a3b8", textTransform: "uppercase", tracking: "0.5px", margin: "0 0 16px 0" }}>Protein Consumed</h3>
          <p className="stat-number" style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 12px 0" }}>
            {userData.metrics?.protein_consumed ?? 0}g <span className="unit" style={{ fontSize: "16px", color: "#64748b" }}>/ {userData.metrics?.protein_goal ?? 108}g</span>
          </p>
          <div className="progress-bar-container" style={{ background: "#1e293b", height: "6px", borderRadius: "3px", overflow: "hidden", marginBottom: "12px" }}>
            <div className="progress-bar" style={{ width: `${Math.min(((userData.metrics?.protein_consumed || 0) / (userData.metrics?.protein_goal || 108)) * 100, 100)}%`, height: "100%", background: "#10b981" }}></div>
          </div>
          <span className="stat-delta positive" style={{ color: "#10b981", fontSize: "13px", fontWeight: "600" }}>
            {Math.max((userData.metrics?.protein_goal || 108) - (userData.metrics?.protein_consumed || 0), 0)}g remaining to target macro
          </span>
        </div>

        {/* Account Biological Status Card Link */}
        <div 
          onClick={() => setActiveTab("analytics")}
          className="stat-card" 
          style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left", cursor: "pointer" }}
        >
          <h3 style={{ fontSize: "14px", color: "#94a3b8", textTransform: "uppercase", tracking: "0.5px", margin: "0 0 16px 0" }}>Account Biological Status</h3>
          <p className="stat-number" style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 12px 0" }}>
            {userData.metrics?.age || "20"} <span className="unit" style={{ fontSize: "16px", color: "#64748b" }}>yrs old</span>
          </p>
          <p className="stat-delta" style={{ margin: "0 0 8px 0", color: "#94a3b8", fontSize: "13px" }}>
            Weight: <strong style={{ color: "#fff" }}>{userData.metrics?.weight ?? "60"} kg</strong> | Height: <strong style={{ color: "#fff" }}>{userData.metrics?.height ?? "170"} cm</strong>
          </p>
          <p className="stat-delta warning" style={{ margin: 0, fontSize: "13px", color: "#eab308", fontWeight: "600" }}>BMI Core Baseline: {userData.metrics?.bmi ?? "20.8"}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        {/* Today's Workout Snapshot Card Link */}
        <div 
          style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left" }}
        >
          <CardioTracker userWeightKg={userData.metrics?.weight ?? 60} onSessionSave={onRefresh} />
        </div>

        {/* Fluid Hydration Tracker Card Link */}
        <div 
          onClick={() => setActiveTab("macros")}
          style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left", cursor: "pointer" }}
        >
          <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#fff", fontWeight: "600" }}>Fluid Hydration Tracker</h3>
          <p style={{ color: "#64748b", margin: "0 0 16px 0", fontSize: "13px" }}>Log dynamic hydration fluid intake volume logs</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1a1d24", padding: "16px", borderRadius: "8px", border: "1px solid #262930" }}>
            <div>
              <span style={{ color: "#fff", fontSize: "20px", fontWeight: "700" }}>{waterCups * 250} ml</span>
              <p style={{ margin: "2px 0 0 0", color: "#64748b", fontSize: "12px" }}>Target threshold: 3000 ml</p>
            </div>
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); setWaterCups(prev => prev + 1); }} 
              style={{ background: "#38bdf8", border: "none", color: "#111", padding: "8px 16px", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
            >
              + 250ml
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", color: "#fff" }}>Weekly Objective Continuity</h3>
          <span style={{ color: "#64748b", fontSize: "13px" }}>Macro and volume threshold compliance streak</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", background: "#1a1d24", padding: "16px 24px", borderRadius: "10px", border: "1px solid #262930" }}>
          {consistencyDays.map((d, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#64748b", fontSize: "12px" }}>{d.day}</span>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: d.met ? "#38bdf8" : "#262930", boxShadow: d.met ? "0 0 8px #38bdf8" : "none" }}></div>
            </div>
          ))}
        </div>
      </div>

      <div className="wide-info-card ai-gradient-glow" style={{ background: "linear-gradient(135deg, #13151a 0%, #1e1b4b 100%)", border: "1px solid #312e81", padding: "32px", borderRadius: "12px", textAlign: "left" }}>
        <span className="ai-badge" style={{ background: "#1e1b4b", border: "1px solid #3730a3", color: "#818cf8", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", padding: "4px 12px", borderRadius: "12px" }}>AI Integration Assistant Enabled</span>
        <h3 style={{ marginTop: "16px", fontSize: "20px", fontWeight: "700", color: "#fff" }}>Log Activities with Natural Language Processing</h3>
        <p style={{ margin: "8px 0 20px 0", color: "#94a3b8", lineHeight: "1.6", fontSize: "14px" }}>
          Don't like manual input forms? Type casual messages like "ran 5k in 25 mins" or "had a 500 calorie shake". Our intelligent system handles string manipulation and writes structured values into your PostgreSQL engine seamlessly.
        </p>
        <button className="ai-action-btn" style={{ padding: "12px 24px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
          Launch AI Parser Window
        </button>
      </div>
    </div>
  );
}

function WorkoutRoutines() {
  const mockRoutines = [
    { title: "Push Day Split", focus: "Chest, Shoulders & Triceps", movements: "6 Exercises", timing: "65 mins", intensity: "High" },
    { title: "Pull Day Focus", focus: "Back, Rear Delts & Biceps", movements: "5 Exercises", timing: "60 mins", intensity: "Medium-High" },
    { title: "Lower Body Hypertrophy", focus: "Quads, Hamstrings & Calves", movements: "5 Exercises", timing: "70 mins", intensity: "High" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>Active Training Programs</h3>
            <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "13px" }}>Select a custom volume split to begin logging data</p>
          </div>
          <button style={{ padding: "10px 20px", background: "#1e293b", border: "1px solid #334155", color: "#fff", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>+ Custom Blueprint</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {mockRoutines.map((routine, i) => (
            <div key={i} style={{ background: "#1a1d24", border: "1px solid #262930", padding: "20px", borderRadius: "10px" }}>
              <span style={{ color: "#38bdf8", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>{routine.focus}</span>
              <h4 style={{ margin: "8px 0 16px 0", fontSize: "18px", color: "#fff", fontWeight: "600" }}>{routine.title}</h4>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "13px", borderTop: "1px solid #262930", paddingTop: "12px" }}>
                <span>{routine.movements}</span>
                <span>{routine.timing}</span>
                <span style={{ color: "#eab308" }}>{routine.intensity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MacroTracker({ userData, waterCups, setWaterCups, onRefresh }) {
  const [mealName, setMealName] = useState("");
  const [mealCals, setMealCals] = useState("");
  const [mealProtein, setMealProtein] = useState("");
  const [showAddLog, setShowAddLog] = useState(false);

  const totalLoggedCalories = userData.metrics?.calories_consumed ?? 0;
  const totalBurnedCalories = userData.metrics?.calories_burned ?? 0;
  const calorieLimit = userData.metrics?.calorie_goal ?? 2430;
  const remainingAllowance = calorieLimit - totalLoggedCalories + totalBurnedCalories;

  const handleLogMealSubmit = async (e) => {
    e.preventDefault();
    if (!mealName || !mealCals) return;

    const token = localStorage.getItem("access");
    try {
      await axios.post("http://127.0.0.1:8000/api/log-meal/", {
        name: mealName,
        calories: parseInt(mealCals, 10),
        protein: mealProtein ? parseInt(mealProtein, 10) : 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMealName("");
      setMealCals("");
      setMealProtein("");
      setShowAddLog(false);
      onRefresh();
    } catch (err) {
      alert("Failed to submit nutrient logs.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Shared Hydration Element */}
      <div style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left" }}>
        <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#fff", fontWeight: "600" }}>Fluid Hydration Tracker</h3>
        <p style={{ color: "#64748b", margin: "0 0 16px 0", fontSize: "13px" }}>Log dynamic hydration fluid intake volume logs</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1a1d24", padding: "16px", borderRadius: "8px", border: "1px solid #262930" }}>
          <div>
            <span style={{ color: "#fff", fontSize: "20px", fontWeight: "700" }}>{waterCups * 250} ml</span>
            <p style={{ margin: "2px 0 0 0", color: "#64748b", fontSize: "12px" }}>Target threshold: 3000 ml</p>
          </div>
          <button type="button" onClick={() => setWaterCups(prev => prev + 1)} style={{ background: "#38bdf8", border: "none", color: "#111", padding: "8px 16px", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
            + 250ml
          </button>
        </div>
      </div>

      <div style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>Daily Calorie Tracker</h3>
            <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "13px" }}>Real-time net consumption vs target balance limits</p>
          </div>
          <button onClick={() => setShowAddLog(!showAddLog)} style={{ padding: "8px 16px", background: "#38bdf8", color: "#111", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
            {showAddLog ? "Close Menu" : "+ Log Meal"}
          </button>
        </div>

        {showAddLog && (
          <form onSubmit={handleLogMealSubmit} style={{ background: "#161920", padding: "16px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #262930" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <input type="text" placeholder="Meal description" value={mealName} onChange={(e) => setMealName(e.target.value)} required style={{ background: "#0d1117", border: "1px solid #262930", color: "#fff", padding: "10px", borderRadius: "6px" }} />
              <input type="number" placeholder="Calories (kcal)" value={mealCals} onChange={(e) => setMealCals(e.target.value)} required style={{ background: "#0d1117", border: "1px solid #262930", color: "#fff", padding: "10px", borderRadius: "6px" }} />
              <input type="number" placeholder="Protein (g)" value={mealProtein} onChange={(e) => setMealProtein(e.target.value)} style={{ background: "#0d1117", border: "1px solid #262930", color: "#fff", padding: "10px", borderRadius: "6px" }} />
            </div>
            <button type="submit" style={{ background: "#10b981", color: "#fff", padding: "8px 16px", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}>Save Intake Log</button>
          </form>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "center", background: "#1a1d24", padding: "20px", borderRadius: "10px", border: "1px solid #262930" }}>
          <div>
            <p style={{ margin: "0 0 4px 0", color: "#94a3b8", fontSize: "13px" }}>Net Intake Formula Balance</p>
            <p style={{ margin: 0, fontSize: "36px", fontWeight: "800", color: "#fff" }}>
              {totalLoggedCalories} <span style={{ fontSize: "16px", color: "#ef4444" }}>- {totalBurnedCalories} kcal</span>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 4px 0", color: "#94a3b8", fontSize: "13px" }}>Remaining Net Allowance</p>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: remainingAllowance < 0 ? "#ef4444" : "#10b981" }}>
              {remainingAllowance} kcal
            </p>
          </div>
          <div style={{ gridColumn: "1 / -1", background: "#1e293b", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${Math.min((Math.max(userData.metrics?.net_calories || 0, 0) / calorieLimit) * 100, 100)}%`, height: "100%", background: "linear-gradient(90deg, #38bdf8, #a855f7)" }}></div>
          </div>
        </div>
      </div>

      <div style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#fff" }}>Macro Composition Ratio Profiles</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {[
            { label: "Protein Target", amount: `${userData.metrics?.protein_goal ?? 108}g`, pct: "45%", color: "#10b981" },
            { label: "Carbohydrates", amount: "280g", pct: "35%", color: "#38bdf8" },
            { label: "Dietary Fats", amount: "65g", pct: "20%", color: "#f59e0b" }
          ].map((macro, i) => (
            <div key={i} style={{ background: "#1a1d24", border: "1px solid #262930", padding: "16px", borderRadius: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "13px" }}>
                <span>{macro.label}</span>
                <span style={{ color: macro.color, fontWeight: "700" }}>{macro.pct}</span>
              </div>
              <p style={{ margin: "8px 0 0 0", fontSize: "20px", fontWeight: "600", color: "#fff" }}>{macro.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// REMAINDER MEMBERS VIEW PANELS
// ==========================================

function FitnessAnalytics({ userData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ background: "#13151a", border: "1px solid #262930", padding: "24px", borderRadius: "12px", textAlign: "left" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#fff" }}>Body Metrics Progress Log</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1a1d24", paddingBottom: "12px" }}>
            <span style={{ color: "#94a3b8", fontSize: "14px" }}>Current Baseline Weight</span>
            <strong style={{ color: "#fff" }}>{userData.metrics?.weight ?? "60"} kg</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1a1d24", paddingBottom: "12px" }}>
            <span style={{ color: "#94a3b8", fontSize: "14px" }}>Calculated Structural BMI</span>
            <strong style={{ color: "#eab308" }}>{userData.metrics?.bmi ?? "20.8"}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#94a3b8", fontSize: "14px" }}>Estimated Lean Target Ratio</span>
            <strong style={{ color: "#10b981" }}>Compliant</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoachChat() {
  return (
    <div style={{ background: "#13151a", border: "1px solid #262930", padding: "32px", borderRadius: "12px", textAlign: "left" }}>
      <h3 style={{ color: "#fff", margin: "0 0 8px 0", fontSize: "18px" }}>Coach Connection Chat</h3>
      <p style={{ color: "#64748b", margin: "0 0 24px 0", fontSize: "14px" }}>Connect securely with encrypted channels to structural training teams.</p>
      <div style={{ height: "220px", background: "#0d1117", border: "1px solid #262930", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: "14px" }}>
        Chat Session Securely Idle
      </div>
    </div>
  );
}

// ==========================================
// CORE HUB ARCHITECTURE LAYOUT
// ==========================================

function Profile() {
  const token = localStorage.getItem("access");
  const [userData, setUserData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("profile");
  const [activeTab, setActiveTab] = useState("overview"); 
  const dropdownRef = useRef(null);

  // Global lifted fluid log track state
  const [waterCups, setWaterCups] = useState(3);

  // Core profile database input fields state hooks
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [editGender, setEditGender] = useState("M");
  const [editDob, setEditDob] = useState(""); 
  const [editWeight, setEditWeight] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [editGoal, setEditGoal] = useState("maintain");
  const [editActivity, setEditActivity] = useState("sedentary");

  const [bioTitle, setBioTitle] = useState("");
  const [specialization, setSpecialization] = useState("general");
  const [maxCapacity, setMaxCapacity] = useState(15);
  const [experienceYears, setExperienceYears] = useState(2);
  const [isAcceptingClients, setIsAcceptingClients] = useState(true);

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
        if (response.data.role === "Trainer") {
          setBioTitle(response.data.metrics.bio_title || "Certified Fitness Coach");
          setSpecialization(response.data.metrics.specialization || "general");
          setMaxCapacity(response.data.metrics.max_capacity || 15);
          setExperienceYears(response.data.metrics.experience_years || 2);
          setIsAcceptingClients(response.data.metrics.is_accepting_clients ?? true);
        } else {
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
    let payload = { first_name: firstName, last_name: lastName };

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
      await axios.put("http://127.0.0.1:8000/api/update-profile/", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      await axios.put("http://127.0.0.1:8000/api/change-username/", { username: cleanUser }, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      await axios.put("http://127.0.0.1:8000/api/change-password/", { old_password: oldPassword, new_password: newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Security credentials modified successfully!");
      setOldPassword("");
      setNewPassword("");
      setShowSettingsModal(false);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to mutate password credentials.");
    }
  };

  const glassInputStyle = {
    background: "#13151a",
    border: "1px solid #262930",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "#ffffff",
    fontSize: "15px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none"
  };

  const sidebarButtonStyle = (tabId) => ({
    background: activeTab === tabId ? "#1a2333" : "transparent",
    border: "1px solid transparent",
    color: activeTab === tabId ? "#38bdf8" : "#94a3b8",
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "left",
    cursor: "pointer",
    width: "100%",
    transition: "all 0.2s ease",
    display: "block",
    marginBottom: "8px"
  });

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

  const renderDashboardContent = () => {
    if (isTrainer) {
      switch (activeTab) {
        case "overview": return <TrainerOverview userData={userData} setActiveTab={setActiveTab} />;
        case "clients": return <AssignedClientRoster userData={userData} />;
        case "reviews": return <PerformanceReviews />;
        case "routines": return <PrescriptionPrograms />;
        case "chat": return <CoachChat />;
        default: return <TrainerOverview userData={userData} setActiveTab={setActiveTab} />;
      }
    } else {
      switch (activeTab) {
        case "overview": return <WorkspaceOverview userData={userData} waterCups={waterCups} setWaterCups={setWaterCups} setActiveTab={setActiveTab} onRefresh={fetchDashboardData} />;
        case "workouts": return <WorkoutRoutines />;
        case "macros": return <MacroTracker userData={userData} waterCups={waterCups} setWaterCups={setWaterCups} onRefresh={fetchDashboardData} />;
        case "analytics": return <FitnessAnalytics userData={userData} />;
        case "chat": return <CoachChat />;
        default: return <WorkspaceOverview userData={userData} waterCups={waterCups} setWaterCups={setWaterCups} setActiveTab={setActiveTab} onRefresh={fetchDashboardData} />;
      }
    }
  };

  return (
    <div className="dashboard-wrapper" style={{ display: "flex", minHeight: "100vh", background: "#0d1117" }}>
      {/* 1. SIDEBAR CONTROLLER ELEMENT */}
      <aside className="sidebar" style={{ width: "260px", background: "#0d1117", borderRight: "1px solid #1a1d24", padding: "24px", boxSizing: "border-box" }}>
        <div className="sidebar-brand" style={{ marginBottom: "24px", textAlign: "left" }}>
          <h2 style={{ fontSize: "20px", color: "#fff", margin: 0, fontWeight: "700" }}>
            Fit<span style={{ color: "#38bdf8" }}>Track</span>
            <div className="pulse-dot" style={{ display: "inline-block", width: "6px", height: "6px", background: "#38bdf8", borderRadius: "50%", marginLeft: "6px" }}></div>
          </h2>
        </div>
        
        <div className="user-profile-summary" style={{ paddingBottom: "20px", marginBottom: "20px", borderBottom: "1px solid #1a1d24", textAlign: "left" }}>
          <p className="summary-username" style={{ margin: "0 0 4px 0", fontWeight: "600", color: "#fff", fontSize: "14px" }}>
            {userData.first_name || userData.last_name 
              ? `${userData.first_name} ${userData.last_name}`.trim() 
              : userData.username}
          </p>
          <p className={`summary-role ${isTrainer ? "role-trainer-text" : "role-member-text"}`} style={{ margin: 0, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "#38bdf8" }}>
            {userData.role}
          </p>
        </div>

        <nav className="sidebar-menu">
          <button type="button" style={sidebarButtonStyle("overview")} onClick={() => setActiveTab("overview")}>
            Workspace Overview
          </button>
          
          {isTrainer ? (
            <>
              <button type="button" style={sidebarButtonStyle("clients")} onClick={() => setActiveTab("clients")}>Assigned Client Roster</button>
              <button type="button" style={sidebarButtonStyle("reviews")} onClick={() => setActiveTab("reviews")}>Performance Reviews</button>
              <button type="button" style={sidebarButtonStyle("routines")} onClick={() => setActiveTab("routines")}>Prescription Programs</button>
            </>
          ) : (
            <>
              <button type="button" style={sidebarButtonStyle("workouts")} onClick={() => setActiveTab("workouts")}>My Workout Routines</button>
              <button type="button" style={sidebarButtonStyle("macros")} onClick={() => setActiveTab("macros")}>Macro Tracker & Goals</button>
              <button type="button" style={sidebarButtonStyle("analytics")} onClick={() => setActiveTab("analytics")}>Fitness Analytics</button>
            </>
          )}
          
          <button type="button" style={sidebarButtonStyle("chat")} onClick={() => setActiveTab("chat")}>
            Coach Connection Chat
          </button>
        </nav>
      </aside>

      {/* 2. DYNAMIC WORKSPACE MATRIX VIEW WINDOW */}
      <main className="main-dashboard" style={{ flex: 1, padding: "40px", boxSizing: "border-box" }}>
        <header className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div className="welcome-text" style={{ textAlign: "left" }}>
            <h1 style={{ fontSize: "24px", color: "#fff", margin: "0 0 6px 0" }}>
              Welcome back to FitTrack, <span style={{ color: "#38bdf8" }}>{userData.first_name || userData.username}</span>!
            </h1>
            <p className="header-subtitle" style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              Manage your interactive dashboards and app feature integrations below.
            </p>
          </div>
          
          <div className="profile-dropdown-container" ref={dropdownRef}>
            <div 
              className="user-profile-circle" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ cursor: "pointer", width: "40px", height: "40px", borderRadius: "50%", background: "#1e293b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600" }}
            >
              {(userData.first_name || userData.username).charAt(0).toUpperCase()}
            </div>

            {dropdownOpen && (
              <div className="profile-dropdown-menu" style={{ position: "absolute", right: "40px", top: "80px", background: "#1a1d24", border: "1px solid #262930", borderRadius: "8px", padding: "8px", zIndex: 10, minWidth: "160px" }}>
                <div className="dropdown-header" style={{ padding: "8px 12px", textAlign: "left" }}>
                  <p className="dropdown-user" style={{ margin: "0 0 2px 0", fontSize: "13px", fontWeight: "600", color: "#fff" }}>
                    {userData.first_name ? `${userData.first_name} ${userData.last_name}` : userData.username}
                  </p>
                  <p className="dropdown-role" style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>{userData.role} Account</p>
                </div>
                <hr className="dropdown-divider" style={{ border: "0", borderTop: "1px solid #262930", margin: "4px 0" }} />
                <a 
                  href="#settings" 
                  className="dropdown-item" 
                  onClick={() => { setShowSettingsModal(true); setActiveSettingsTab("profile"); setDropdownOpen(false); }}
                  style={{ display: "block", padding: "8px 12px", color: "#94a3b8", textDecoration: "none", fontSize: "13px", textAlign: "left" }}
                >
                  Account Settings
                </a>
                <a 
                  href="#username-change" 
                  className="dropdown-item" 
                  onClick={() => { setShowSettingsModal(true); setActiveSettingsTab("account"); setDropdownOpen(false); }}
                  style={{ display: "block", padding: "8px 12px", color: "#94a3b8", textDecoration: "none", fontSize: "13px", textAlign: "left" }}
                >
                  Change Username
                </a>
                <hr className="dropdown-divider" style={{ border: "0", borderTop: "1px solid #262930", margin: "4px 0" }} />
                <button onClick={handleLogout} className="dropdown-logout-btn" style={{ background: "transparent", border: "none", color: "#ef4444", padding: "8px 12px", width: "100%", textAlign: "left", cursor: "pointer", fontSize: "13px" }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {renderDashboardContent()}
      </main>

      {/* 3. SYSTEM DRAWER CONFIG LAYER */}
      {showSettingsModal && (
        <div className="modal-overlay-shroud" onClick={() => setShowSettingsModal(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backdropFilter: "blur(8px)", backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="modal-settings-card clean-layout" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "550px", width: "95%", background: "#1a1d24", border: "1px solid #262930", padding: "30px", borderRadius: "16px" }}>
            
            <div className="modal-tabs-header" style={{ display: "flex", gap: "25px", borderBottom: "1px solid #262930", marginBottom: "25px", paddingBottom: "2px" }}>
              <button 
                type="button"
                onClick={() => setActiveSettingsTab("profile")}
                style={{ background: "transparent", border: "none", color: activeSettingsTab === "profile" ? "#38bdf8" : "#64748b", borderBottom: activeSettingsTab === "profile" ? "2px solid #38bdf8" : "2px solid transparent", padding: "10px 5px", cursor: "pointer", fontWeight: "700", fontSize: "15px" }}
              >
                Profile Metrics
              </button>
              <button 
                type="button"
                onClick={() => setActiveSettingsTab("account")}
                style={{ background: "transparent", border: "none", color: activeSettingsTab === "account" ? "#38bdf8" : "#64748b", borderBottom: activeSettingsTab === "account" ? "2px solid #38bdf8" : "2px solid transparent", padding: "10px 5px", cursor: "pointer", fontWeight: "700", fontSize: "15px" }}
              >
                Account Credentials
              </button>
            </div>

            {activeSettingsTab === "profile" ? (
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
              <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                <form onSubmit={handleUpdateUsername} className="onboard-flex-form" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "25px" }}>
                  <div className="modal-input-vertical-stack">
                    <label style={labelHeaderStyle}>System Handle Username</label>
                    <div style={{ display: "flex", gap: "15px" }}>
                      <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Enter username" required style={{ ...glassInputStyle, flex: 1, textTransform: "lowercase" }} />
                      <button type="submit" style={{ width: "140px", height: "46px", background: "#a855f7", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>Update User</button>
                    </div>
                  </div>
                </form>

                <form onSubmit={handleUpdatePassword} className="onboard-flex-form">
                  <h4 style={{ color: "#ffffff", textAlign: "left", fontSize: "14px", margin: "0 0 15px 0", letterSpacing: "0.5px" }}>MUTATE SECURITY PASSWORD</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                    <div className="modal-input-vertical-stack">
                      <label style={labelHeaderStyle}>Current Password</label>
                      <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="••••••••" required style={glassInputStyle} />
                    </div>
                    <div className="modal-input-vertical-stack">
                      <label style={labelHeaderStyle}>New Security Password</label>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required style={glassInputStyle} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "15px", justifyContent: "flex-end", marginTop: "10px" }}>
                    <button type="button" onClick={() => setShowSettingsModal(false)} style={{ background: "transparent", color: "#94a3b8", border: "1px solid #262930", width: "110px", padding: "12px", borderRadius: "10px", cursor: "pointer" }}>Cancel</button>
                    <button type="submit" style={{ width: "180px", padding: "12px", background: "#e11d48", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>Update Password</button>
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