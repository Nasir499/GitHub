import React, { useEffect, useState } from "react";

// Simple CSS-based heat map (no external dependency needed)
const HeatMapProfile = () => {
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    // Generate mock activity data for the past year
    const data = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const count = Math.floor(Math.random() * 10);
      data.push({
        date: currentDate.toISOString().split("T")[0],
        count,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setActivityData(data);
  }, []);

  const getColor = (count) => {
    if (count === 0) return '#161b22';
    if (count <= 2) return '#0e4429';
    if (count <= 4) return '#006d32';
    if (count <= 6) return '#26a641';
    return '#39d353';
  };

  // Group by weeks for grid display
  const weeks = [];
  for (let i = 0; i < activityData.length; i += 7) {
    weeks.push(activityData.slice(i, i + 7));
  }

  return (
    <div className="heatmap-container">
      <h4 style={{ color: 'white', marginBottom: '12px' }}>Contribution Activity</h4>
      <div style={{
        display: 'flex',
        gap: '3px',
        overflowX: 'auto',
        paddingBottom: '8px'
      }}>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                title={`${day.date}: ${day.count} contributions`}
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: getColor(day.count),
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
        <span style={{ color: '#8b949e', fontSize: '12px', marginRight: '4px' }}>Less</span>
        {[0, 2, 4, 6, 8].map((level) => (
          <div
            key={level}
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: getColor(level),
              borderRadius: '2px',
            }}
          />
        ))}
        <span style={{ color: '#8b949e', fontSize: '12px', marginLeft: '4px' }}>More</span>
      </div>
    </div>
  );
};

export default HeatMapProfile;
