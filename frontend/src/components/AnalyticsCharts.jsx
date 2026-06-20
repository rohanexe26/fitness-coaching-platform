import React from 'react';

export default function AnalyticsCharts({ userData }) {
  const currentBMI = userData?.metrics?.bmi ?? 20.8;
  const intakeCals = userData?.metrics?.calories_consumed ?? 0;
  const burnedCals = userData?.metrics?.calories_burned ?? 0;
  const calorieLimit = userData?.metrics?.calorie_goal ?? 2430;

  // Render arrays straight from your profile data metrics
  const visualMetrics = [
    { label: "Intake Goal Progress", current: intakeCals, target: calorieLimit, unit: "kcal", color: "#a855f7" },
    { label: "Cardio Burned Active Outlay", current: burnedCals, target: 500, unit: "kcal", color: "#10b981" },
    { label: "Body Mass Profile Baseline", current: currentBMI, target: 25, unit: "BMI", color: "#38bdf8" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      <div style={{ background: '#13151a', border: '1px solid #262930', padding: '24px', borderRadius: '12px', textAlign: 'left' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#fff', fontWeight: '600' }}>Active Energy Balance & Metrics Analytics</h3>
        <p style={{ color: '#64748b', margin: '0 0 24px 0', fontSize: '13px' }}>Real-time telemetry breakdowns against target baselines</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {visualMetrics.map((item, idx) => {
            const percentage = Math.min((item.current / item.target) * 100, 100) || 0;
            return (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#94a3b8', fontWeight: '500' }}>{item.label}</span>
                  <span style={{ color: '#fff', fontWeight: '600' }}>
                    {item.current} / {item.target} {item.unit}
                  </span>
                </div>
                <div style={{ background: '#1e293b', height: '12px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #1a2333' }}>
                  <div 
                    style={{ 
                      width: `${percentage}%`, 
                      height: '100%', 
                      background: item.color, 
                      borderRadius: '6px',
                      transition: 'width 0.4s ease-in-out',
                      boxShadow: `0 0 8px ${item.color}80`
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
