import React, { useState, useEffect } from 'react';

const WaterLevelMonitor = () => {
  const [areas, setAreas] = useState([
    { id: 1, name: "Vijay Nagar", waterLevel: 85, status: "high", lastUpdate: new Date().toLocaleTimeString(), consumption: 12500, population: 25000 },
    { id: 2, name: "Indrapuri", waterLevel: 45, status: "medium", lastUpdate: new Date().toLocaleTimeString(), consumption: 18750, population: 32000 },
    { id: 3, name: "Scheme No. 54", waterLevel: 25, status: "low", lastUpdate: new Date().toLocaleTimeString(), consumption: 8900, population: 15000 },
    { id: 4, name: "Mahalaxmi Nagar", waterLevel: 92, status: "high", lastUpdate: new Date().toLocaleTimeString(), consumption: 15600, population: 28000 },
    { id: 5, name: "Gumasta Nagar", waterLevel: 15, status: "low", lastUpdate: new Date().toLocaleTimeString(), consumption: 4500, population: 8000 },
    { id: 6, name: "Jawahar Chowk", waterLevel: 68, status: "medium", lastUpdate: new Date().toLocaleTimeString(), consumption: 22300, population: 45000 },
    { id: 7, name: "New Adarsh Nagar", waterLevel: 78, status: "high", lastUpdate: new Date().toLocaleTimeString(), consumption: 9800, population: 18000 },
    { id: 8, name: "Sanjeevani Nagar", waterLevel: 32, status: "low", lastUpdate: new Date().toLocaleTimeString(), consumption: 6700, population: 12000 }
  ]);

  const [stats, setStats] = useState({});
  const [dataSource, setDataSource] = useState('demo');

  // Calculate statistics
  useEffect(() => {
    setStats({
      total: areas.length,
      high: areas.filter(a => a.status === 'high').length,
      medium: areas.filter(a => a.status === 'medium').length,
      low: areas.filter(a => a.status === 'low').length,
      avgLevel: Math.round(areas.reduce((sum, a) => sum + a.waterLevel, 0) / areas.length)
    });
  }, [areas]);

  // Real-time updates for demo mode
  useEffect(() => {
    if (dataSource === 'demo') {
      const interval = setInterval(() => {
        setAreas(prev => prev.map(area => {
          const change = (Math.random() - 0.5) * 8;
          let newLevel = area.waterLevel + change;
          newLevel = Math.min(100, Math.max(0, Math.round(newLevel)));
          let newStatus = 'medium';
          if (newLevel >= 70) newStatus = 'high';
          else if (newLevel >= 40) newStatus = 'medium';
          else newStatus = 'low';
          
          return {
            ...area,
            waterLevel: newLevel,
            status: newStatus,
            lastUpdate: new Date().toLocaleTimeString()
          };
        }));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [dataSource]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getWaterIcon = (level) => {
    if (level >= 70) return '💧💧💧';
    if (level >= 40) return '💧💧';
    return '💧';
  };

  return (
    <div>
      {/* Data Source Selector - Future Ready */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <strong>📡 Data Source:</strong>
            <select 
              value={dataSource} 
              onChange={(e) => setDataSource(e.target.value)}
              style={{
                marginLeft: '10px',
                padding: '8px 15px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                cursor: 'pointer'
              }}
            >
              <option value="demo">🎮 Demo Mode (Current)</option>
              <option value="api">🏛️ Government API (Future)</option>
              <option value="database">🗄️ Database (Future)</option>
            </select>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            💡 Future: Connect to real data by updating data source
          </div>
        </div>
        
        {dataSource !== 'demo' && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: '#fef3c7',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#92400e'
          }}>
            💡 Future Mode: When government provides API, update the data source above.
          </div>
        )}
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px', color: 'white' }}>
        <h2 style={{ fontSize: '28px' }}>💧 Water Level Monitor</h2>
        <p>Real-time water monitoring across {stats.total} areas</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '30px' }}>🏘️</div>
          <h3 style={{ fontSize: '12px', color: '#666' }}>Total Areas</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3c72' }}>{stats.total}</div>
        </div>
        <div style={{ background: '#d1fae5', borderRadius: '15px', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '30px' }}>🟢</div>
          <h3 style={{ fontSize: '12px', color: '#666' }}>Safe Zones</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.high}</div>
        </div>
        <div style={{ background: '#fed7aa', borderRadius: '15px', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '30px' }}>🟠</div>
          <h3 style={{ fontSize: '12px', color: '#666' }}>Warning Zones</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.medium}</div>
        </div>
        <div style={{ background: '#fee2e2', borderRadius: '15px', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '30px' }}>🔴</div>
          <h3 style={{ fontSize: '12px', color: '#666' }}>Critical Zones</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{stats.low}</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '20px',
        background: 'rgba(255,255,255,0.9)',
        padding: '10px 20px',
        borderRadius: '50px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: '#10b981', borderRadius: '50%' }}></div>
          <span>High Level (70-100%) - Safe</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: '#f59e0b', borderRadius: '50%' }}></div>
          <span>Medium Level (40-69%) - Warning</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: '#ef4444', borderRadius: '50%' }}></div>
          <span>Low Level (0-39%) - Critical</span>
        </div>
      </div>

      {/* Areas Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {areas.map(area => (
          <div key={area.id} style={{
            background: 'white',
            borderRadius: '15px',
            padding: '20px',
            transition: 'transform 0.3s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '18px', color: '#1e3c72' }}>{area.name}</h3>
              <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                background: area.status === 'high' ? '#d1fae5' : area.status === 'medium' ? '#fed7aa' : '#fee2e2',
                color: area.status === 'high' ? '#10b981' : area.status === 'medium' ? '#f59e0b' : '#ef4444'
              }}>
                {area.status === 'high' ? '🟢 SAFE' : area.status === 'medium' ? '🟠 WARNING' : '🔴 CRITICAL'}
              </span>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px', color: '#666' }}>
                <span>Water Level</span>
                <span>{area.waterLevel}%</span>
              </div>
              <div style={{ width: '100%', height: '30px', background: '#e2e8f0', borderRadius: '15px', overflow: 'hidden' }}>
                <div style={{
                  width: `${area.waterLevel}%`,
                  height: '100%',
                  background: getStatusColor(area.status),
                  transition: 'width 0.5s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  {getWaterIcon(area.waterLevel)}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
              <span>📊 {(area.consumption || 0).toLocaleString()} L/day</span>
              <span>👥 {(area.population || 0).toLocaleString()}</span>
              <span>🕐 {area.lastUpdate}</span>
            </div>
            
            {area.status === 'low' && (
              <div style={{
                marginTop: '15px',
                padding: '10px',
                background: '#fee2e2',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#dc2626'
              }}>
                ⚠️ Alert: Low water level! Conservation needed.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Alert Banner */}
      {stats.low > 0 && (
        <div style={{
          marginTop: '30px',
          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
          color: 'white',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{ fontSize: '40px' }}>🚨</div>
          <h3>URGENT: {stats.low} Area(s) Critical Water Level!</h3>
          <p>Immediate water conservation required in these areas.</p>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
};

export default WaterLevelMonitor;