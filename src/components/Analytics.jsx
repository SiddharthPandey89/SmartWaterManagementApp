import React, { useState, useEffect } from 'react';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalReports: 0,
    resolvedIssues: 0,
    pendingIssues: 0,
    avgResponseTime: 'Calculating...',
    waterSaved: 0,
    monthlySavings: 0,
    weeklyData: [0, 0, 0, 0, 0, 0, 0],
    areaWiseReports: {},
    severityDistribution: { low: 0, medium: 0, high: 0, emergency: 0 }
  });
  
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  // Fetch real data from localStorage
  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = () => {
    // Get reports from localStorage
    const reports = JSON.parse(localStorage.getItem('waterReports') || '[]');
    
    // Get reports from waterReports (from WaterWasteForm)
    const waterReports = JSON.parse(localStorage.getItem('waterReports') || '[]');
    const allReports = [...reports, ...waterReports];
    
    // Total reports
    const totalReports = allReports.length;
    
    // Count by severity
    const severityCount = {
      low: 0,
      medium: 0,
      high: 0,
      emergency: 0
    };
    
    // Area wise reports
    const areaWise = {};
    
    // Calculate water saved (based on reported leaks)
    let totalWaterWastage = 0;
    let resolvedCount = 0;
    
    allReports.forEach(report => {
      // Count severity
      const severity = report.severity || report.aiAnalysis?.severity || 'medium';
      severityCount[severity] = (severityCount[severity] || 0) + 1;
      
      // Count area wise
      const area = report.area || report.location?.split(',')[0] || 'Unknown';
      areaWise[area] = (areaWise[area] || 0) + 1;
      
      // Calculate water wastage
      let flowRate = 10;
      if (severity === 'emergency') flowRate = 100;
      else if (severity === 'high') flowRate = 50;
      else if (severity === 'medium') flowRate = 20;
      else flowRate = 5;
      
      const dailyWastage = flowRate * 60 * 24;
      totalWaterWastage += dailyWastage;
      
      // Check if resolved (if status exists)
      if (report.status === 'resolved') resolvedCount++;
    });
    
    // Water saved (assuming fixing leaks saves 80% of wastage)
    const waterSaved = Math.round(totalWaterWastage * 0.8);
    
    // Monthly savings (rough estimate: ₹0.05 per liter)
    const monthlySavings = Math.round(waterSaved * 0.05);
    
    // Weekly data (last 7 days)
    const weeklyData = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    
    allReports.forEach(report => {
      const reportDate = new Date(report.timestamp || report.submittedAt);
      const diffDays = Math.floor((today - reportDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        weeklyData[6 - diffDays]++;
      }
    });
    
    // Avg response time (mock calculation)
    const avgResponseTime = resolvedCount > 0 ? '2.4 hours' : 'No data';
    
    setAnalyticsData({
      totalReports,
      resolvedIssues: resolvedCount,
      pendingIssues: totalReports - resolvedCount,
      avgResponseTime,
      waterSaved,
      monthlySavings,
      weeklyData,
      areaWiseReports: areaWise,
      severityDistribution: severityCount
    });
    
    setLoading(false);
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'emergency': return '#dc2626';
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#10b981';
    }
  };

  // Get top affected areas
  const getTopAreas = () => {
    return Object.entries(analyticsData.areaWiseReports)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', color: 'white', padding: '50px' }}>
        <div style={{ fontSize: '40px' }}>📊</div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '30px', color: 'white' }}>
        <h2 style={{ fontSize: '28px' }}>📊 Real Water Management Analytics</h2>
        <p>Based on {analyticsData.totalReports} user reports</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>📝</div>
          <h3 style={{ fontSize: '12px', color: '#666' }}>Total Reports</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3c72' }}>{analyticsData.totalReports}</p>
        </div>
        <div style={{ background: '#d1fae5', borderRadius: '15px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>✅</div>
          <h3 style={{ fontSize: '12px', color: '#666' }}>Resolved Issues</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{analyticsData.resolvedIssues}</p>
        </div>
        <div style={{ background: '#fee2e2', borderRadius: '15px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>⏳</div>
          <h3 style={{ fontSize: '12px', color: '#666' }}>Pending Issues</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>{analyticsData.pendingIssues}</p>
        </div>
        <div style={{ background: '#e0e7ff', borderRadius: '15px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>💧</div>
          <h3 style={{ fontSize: '12px', color: '#666' }}>Water Saved</h3>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>{analyticsData.waterSaved.toLocaleString()} L</p>
        </div>
      </div>

      {/* Severity Distribution */}
      <div style={{ background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '20px', color: '#1e3c72' }}>📊 Leak Severity Distribution</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {Object.entries(analyticsData.severityDistribution).map(([severity, count]) => (
            <div key={severity} style={{ flex: 1, minWidth: '100px' }}>
              <div style={{ 
                height: '100px', 
                background: getSeverityColor(severity), 
                borderRadius: '10px',
                marginBottom: '10px',
                position: 'relative',
                transition: 'height 0.5s'
              }}>
                <span style={{
                  position: 'absolute',
                  bottom: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>{count}</span>
              </div>
              <p style={{ textAlign: 'center', textTransform: 'capitalize' }}>{severity}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Trends */}
      <div style={{ background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <h3>📈 Weekly Report Trends</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setPeriod('week')} style={{ padding: '5px 15px', background: period === 'week' ? '#667eea' : '#ddd', color: period === 'week' ? 'white' : '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Week</button>
            <button onClick={() => setPeriod('month')} style={{ padding: '5px 15px', background: period === 'month' ? '#667eea' : '#ddd', color: period === 'month' ? 'white' : '#333', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Month</button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '200px', gap: '10px' }}>
          {analyticsData.weeklyData.map((value, index) => {
            const maxValue = Math.max(...analyticsData.weeklyData, 1);
            const height = (value / maxValue) * 150;
            return (
              <div key={index} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ 
                  height: `${height}px`, 
                  background: 'linear-gradient(180deg, #667eea, #764ba2)', 
                  borderRadius: '10px 10px 0 0',
                  transition: 'height 0.5s'
                }}>
                  <span style={{ position: 'relative', top: '-25px', fontSize: '12px' }}>{value}</span>
                </div>
                <div style={{ marginTop: '10px', fontSize: '12px' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Affected Areas */}
      <div style={{ background: 'white', borderRadius: '15px', padding: '20px', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '20px', color: '#1e3c72' }}>📍 Most Affected Areas</h3>
        {getTopAreas().map(([area, count], index) => (
          <div key={area} style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>{index + 1}. {area}</span>
              <span>{count} report(s)</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(count / analyticsData.totalReports) * 100}%`, height: '100%', background: '#ef4444', borderRadius: '4px' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights (Based on real data) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '20px', borderLeft: '4px solid #f59e0b' }}>
          <h4>🎯 AI Insight</h4>
          <p>{analyticsData.totalReports > 10 ? `${getTopAreas()[0]?.[0] || 'Multiple areas'} has the highest number of reports. Focus conservation efforts here.` : 'More data needed for AI insights. Keep reporting leaks!'}</p>
        </div>
        <div style={{ background: 'white', borderRadius: '15px', padding: '20px', borderLeft: '4px solid #10b981' }}>
          <h4>💡 Recommendation</h4>
          <p>{analyticsData.waterSaved > 10000 ? `Excellent! ${(analyticsData.waterSaved / 1000).toFixed(1)}k liters saved through reporting.` : 'Each report helps save water. Keep reporting leaks!'}</p>
        </div>
        <div style={{ background: 'white', borderRadius: '15px', padding: '20px', borderLeft: '4px solid #667eea' }}>
          <h4>📊 Impact</h4>
          <p>Your reports have helped save approximately {Math.round(analyticsData.waterSaved / 1000)}k liters of water.</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;