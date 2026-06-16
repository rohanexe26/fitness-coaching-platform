import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Onboarding() {
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("M"); // Default 'M' for Male, 'F' for Female
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("maintain");
  const [activityLevel, setActivityLevel] = useState("sedentary");

  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  // Automatically formats text input to DD/MM/YYYY as the user types
  const handleDobChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // Remove all non-numeric characters
    if (input.length > 8) input = input.substring(0, 8); // Cap at 8 digits

    // Add slashes automatically
    if (input.length > 4) {
      input = `${input.substring(0, 2)}/${input.substring(2, 4)}/${input.substring(4)}`;
    } else if (input.length > 2) {
      input = `${input.substring(0, 2)}/${input.substring(2)}`;
    }

    setDateOfBirth(input);
  };

  const handleSaveMetrics = async (e) => {
    e.preventDefault();
    if (!dateOfBirth || !weight || !height || !gender) {
      alert("Please fill out all health metric configurations.");
      return;
    }

    // 1. STAGE ONE VALIDATION: Strict Date Breakdown Verification Checks
    const parts = dateOfBirth.split("/");
    if (parts.length !== 3 || parts[2].length !== 4) {
      alert("Please enter a valid date of birth (DD/MM/YYYY).");
      return;
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const currentYear = new Date().getFullYear(); // 2026

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > currentYear) {
      alert("Please enter a valid date of birth (DD/MM/YYYY).");
      return;
    }

    // 2. STAGE TWO VALIDATION: Hard Metric Boundary Safeguards
    const parsedWeight = parseFloat(weight);
    const parsedHeight = parseFloat(height);

    if (parsedWeight > 500 || parsedHeight > 500) {
      alert("Weight and Height metrics cannot exceed a maximum value of 500.");
      return;
    }

    // Convert DD/MM/YYYY string to backend expected YYYY-MM-DD format
    const backendFormattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    try {
      // Send onboarding tracking parameters to backend save interface endpoint
      await axios.post(
        "http://127.0.0.1:8000/api/save-onboarding/",
        { 
          date_of_birth: backendFormattedDate, 
          gender: gender,
          weight: parsedWeight, 
          height: parsedHeight, 
          fitness_goal: fitnessGoal,
          activity_level: activityLevel 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Metrics synced! Loading your custom environment...");
      navigate("/profile");
    } catch (error) {
      console.error("Onboarding submission error:", error);
      alert("Failed to save health metrics. Please try again.");
    }
  };

  return (
    <div className="container" style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div className="onboarding-card-glass">
        <h1>Fit<span>Track</span><div className="pulse-dot"></div></h1>
        <p className="onboard-tag">MEMBER CONFIGURATION MATRIX</p>
        
        <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", margin: "-15px 0 25px 0", lineHeight: "1.6" }}>
          Tell us about yourself to instantly generate your custom caloric needs, protein goals, and training plan splits.
        </p>

        <form onSubmit={handleSaveMetrics} className="onboard-flex-form">
          {/* Row Configuration Fields */}
          <div className="input-row-grid">
            <div className="input-field-group">
              <label>Date of Birth</label>
              <input 
                type="text" 
                placeholder="dd/mm/yyyy" 
                value={dateOfBirth} 
                onChange={handleDobChange} 
                required 
              />
            </div>
            <div className="input-field-group">
              <label>Weight (max 500)</label>
              <input 
                type="number" 
                placeholder="kg" 
                step="0.1"
                max="500"
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
                required 
              />
            </div>
            <div className="input-field-group">
              <label>Height (max 500)</label>
              <input 
                type="number" 
                placeholder="cm" 
                step="0.1"
                max="500"
                value={height} 
                onChange={(e) => setHeight(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Biological Gender Toggle Selection Layout Box */}
          <div className="onboard-section">
            <label className="section-label">Biological Gender</label>
            <div className="selection-chip-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div 
                className={`select-chip ${gender === "M" ? "active" : ""}`}
                onClick={() => setGender("M")}
                style={{ textAlign: "center", padding: "12px" }}
              >
                <h4>Male</h4>
                <p>Baseline Metabolic Offset</p>
              </div>
              <div 
                className={`select-chip ${gender === "F" ? "active" : ""}`}
                onClick={() => setGender("F")}
                style={{ textAlign: "center", padding: "12px" }}
              >
                <h4>Female</h4>
                <p>Baseline Metabolic Offset</p>
              </div>
            </div>
          </div>

          {/* Dynamic Selectable Cards - Goals */}
          <div className="onboard-section">
            <label className="section-label">Target Fitness Objective</label>
            <div className="selection-chip-grid">
              {[
                { id: 'slim', label: 'Fat Loss', sub: 'Caloric Deficit' },
                { id: 'maintain', label: 'Maintenance', sub: 'Stay Balanced' },
                { id: 'gain', label: 'Hypertrophy', sub: 'Build Muscle' }
              ].map(item => (
                <div 
                  key={item.id}
                  className={`select-chip ${fitnessGoal === item.id ? 'active' : ''}`}
                  onClick={() => setFitnessGoal(item.id)}
                >
                  <h4>{item.label}</h4>
                  <p>{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Selectable Cards - Activity Options */}
          <div className="onboard-section">
            <label className="section-label">Weekly Physical Activity Intensity</label>
            <div className="selection-chip-grid vertical">
              {[
                { id: 'sedentary', label: 'Sedentary Mode', sub: 'Desk job, little to no weekly exercise.' },
                { id: 'light', label: 'Light Routine', sub: 'Basic active movements or training 1-3 days a week.' },
                { id: 'moderate', label: 'Moderate Schedule', sub: 'Consistent dedicated workouts 3-5 days a week.' },
                { id: 'active', label: 'Elite Athlete Mode', sub: 'Heavy performance sports conditioning 6-7 days a week.' }
              ].map(item => (
                <div 
                  key={item.id}
                  className={`select-chip-wide ${activityLevel === item.id ? 'active' : ''}`}
                  onClick={() => setActivityLevel(item.id)}
                >
                  <div className="chip-radio-circle"></div>
                  <div className="chip-text-block">
                    <h4>{item.label}</h4>
                    <p>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" style={{ width: "100%", marginTop: "15px", padding: "14px" }}>
            Initialize Dashboard Core
          </button>
        </form>
      </div>
    </div>
  );
}

export default Onboarding;
