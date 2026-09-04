import React, { useEffect, useState } from "react";
import API from "../../api.js";
import { useAuth } from "../../useAuth.js";

const HeatMapProfile = ({ userId: propUserId }) => {
  const { currentUser } = useAuth();
  const userId = propUserId || currentUser || localStorage.getItem('userId');
  const [activityData, setActivityData] = useState([]);
  const [totalContributions, setTotalContributions] = useState(0);

  useEffect(() => {
    const fetchRealActivity = async () => {
      let realActivityMap = {};

      if (userId) {
        try {
          const response = await API.get(`/user/activity/${userId}`);
          realActivityMap = response.data?.activityMap || {};
        } catch (err) {
          console.error("Error fetching real activity data:", err);
        }
      }

      // Generate 1 full year date range (365 days)
      const data = [];
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1);

      let currentDate = new Date(startDate);
      let totalCount = 0;

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const count = realActivityMap[dateStr] || 0;
        totalCount += count;

        data.push({
          date: dateStr,
          count,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      setActivityData(data);
      setTotalContributions(totalCount);
    };

    fetchRealActivity();
  }, [userId]);

  const getColor = (count) => {
    if (count === 0) return '#161b22';
    if (count === 1) return '#0e4429';
    if (count <= 3) return '#006d32';
    if (count <= 5) return '#26a641';
    return '#39d353';
  };

  // Group by weeks (7 days per column)
  const weeks = [];
  for (let i = 0; i < activityData.length; i += 7) {
    weeks.push(activityData.slice(i, i + 7));
  }

  return (
    <div className="heatmap-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ color: 'white', margin: 0 }}>Contribution Activity</h4>
        <span style={{ color: '#8b949e', fontSize: '13px' }}>
          {totalContributions} contributions in the last year
        </span>
      </div>

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
                title={`${day.date}: ${day.count} contribution(s)`}
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: getColor(day.count),
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease',
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
        <span style={{ color: '#8b949e', fontSize: '12px', marginRight: '4px' }}>Less</span>
        {[0, 1, 3, 5, 7].map((level) => (
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
