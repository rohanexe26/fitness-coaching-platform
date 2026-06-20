import React, { useState, useEffect } from 'react';

// MET values for standard activities
const MET_VALUES = { RUN: 9.8, CYCLE: 8.0, WALK: 4.3, ELLIPTICAL: 5.0 };

export default function CardioTracker({ userWeightKg = 60, onSessionSave }) {
  const [activity, setActivity] = useState('RUN');
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [distance, setDistance] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
        
        // MET formula: Calories/min = MET * 3.5 * weight(kg) / 200
        // Divided by 60 to compute burn rate per second incrementally
        const caloriesPerSecond = (MET_VALUES[activity] * 3.5 * userWeightKg) / 200 / 60;
        setCaloriesBurned((prev) => prev + caloriesPerSecond);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, activity, userWeightKg]);

  const handleFinish = async () => {
    setIsActive(false);
    setLoading(true);
    setMessage('');

    const token = localStorage.getItem('access_token'); // Adjust key name based on your app setup
    const endpoint = '/api/log-cardio/'; // Fallback path maps to Option A URLs smoothly

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activity_type: activity,
          duration_seconds: seconds,
          distance_km: distance ? parseFloat(distance) : 0.0,
          calories_burned: Math.round(caloriesBurned)
        })
      });

      const resData = await response.json();

      if (response.ok) {
        setMessage('🎯 Run saved successfully!');
        if (onSessionSave) onSessionSave();
        // Reset metrics
        setSeconds(0);
        setCaloriesBurned(0);
        setDistance('');
      } else {
        setMessage(`Error: ${resData.error || 'Failed to sync log data'}`);
      }
    } catch (err) {
      setMessage('Error connecting to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ background: '#121824', padding: '24px', borderRadius: '12px', border: '1px solid #232d42', color: '#fff', width: '100%', maxWidth: '450px', margin: '20px auto' }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>🏃‍♂️ Cardio & Run Tracker</h3>
      
      <label style={{ fontSize: '12px', color: '#8a99ad', display: 'block', marginBottom: '6px' }}>SELECT ACTIVITY TYPE</label>
      <select 
        value={activity} 
        onChange={(e) => { setActivity(e.target.value); setSeconds(0); setCaloriesBurned(0); }} 
        disabled={isActive}
        style={{ background: '#1a2333', color: '#fff', padding: '10px', borderRadius: '6px', width: '100%', marginBottom: '15px', border: '1px solid #232d42' }}
      >
        <option value="RUN">Running</option>
        <option value="CYCLE">Cycling</option>
        <option value="WALK">Walking</option>
        <option value="ELLIPTICAL">Elliptical</option>
      </select>

      <label style={{ fontSize: '12px', color: '#8a99ad', display: 'block', marginBottom: '6px' }}>OPTIONAL DISTANCE (KM)</label>
      <input 
        type="number" 
        step="0.1"
        placeholder="e.g. 5.2" 
        value={distance}
        onChange={(e) => setDistance(e.target.value)}
        style={{ background: '#1a2333', color: '#fff', padding: '10px', borderRadius: '6px', width: '100%', marginBottom: '20px', border: '1px solid #232d42' }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-around', background: '#161f30', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <small style={{ color: '#8a99ad', fontSize: '11px', fontWeight: 'bold' }}>DURATION</small>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '28px', fontFamily: 'monospace' }}>{formatTime(seconds)}</h2>
        </div>
        <div style={{ textAlign: 'center' }}>
          <small style={{ color: '#8a99ad', fontSize: '11px', fontWeight: 'bold' }}>EST. BURNED</small>
          <h2 style={{ margin: '5px 0 0 0', fontSize: '28px', color: '#38bdf8', fontFamily: 'monospace' }}>{Math.round(caloriesBurned)} kcal</h2>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={() => setIsActive(!isActive)} 
          style={{ flex: 1, padding: '12px', background: isActive ? '#e11d48' : '#16a34a', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}
        >
          {isActive ? 'Pause Workout' : 'Start Workout'}
        </button>
        <button 
          onClick={handleFinish} 
          disabled={seconds === 0 || loading} 
          style={{ flex: 1, padding: '12px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', opacity: (seconds === 0 || loading) ? 0.5 : 1 }}
        >
          {loading ? 'Saving...' : 'Finish Session'}
        </button>
      </div>

      {message && (
        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px', color: message.includes('successfully') ? '#4ade80' : '#f87171' }}>
          {message}
        </div>
      )}
    </div>
  );
}
