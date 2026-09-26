import React, { useState, useEffect } from 'react';
import WaterLevelMonitor from './components/WaterLevelMonitor';
import WaterWasteForm from './components/WaterWasteForm';
import WaterConservationTips from './components/WaterConservationTips';
import Analytics from './components/Analytics';
import AiChatbot from './components/AiChatbot';
import GreenZoneAnalysis from './components/GreenZoneAnalysis';

function App() {
  const [activeTab, setActiveTab] = useState('report');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // PWA Install Prompt
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBtn(true);
    });
  }, []);

  const installApp = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted install');
        }
        setShowInstallBtn(false);
      });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ fontSize: '40px' }}>💧</div>
          <h1 style={{ color: '#1e3c72' }}>Smart Water Management System</h1>
          <p>AI-Powered Leak Detection & Water Conservation</p>
          
          {/* PWA Install Button */}
          {showInstallBtn && (
            <button
              onClick={installApp}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#10b981',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📱 Install App
            </button>
          )}
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('report')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'report' ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === 'report' ? '#667eea' : 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
          >
            📝 Report Leakage
          </button>
          
          <button
            onClick={() => setActiveTab('monitor')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'monitor' ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === 'monitor' ? '#667eea' : 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
          >
            💧 Water Monitor
          </button>
          
          <button
            onClick={() => setActiveTab('greenzone')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'greenzone' ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === 'greenzone' ? '#667eea' : 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
          >
            🌳 Green Zone
          </button>
          
          <button
            onClick={() => setActiveTab('tips')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'tips' ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === 'tips' ? '#667eea' : 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
          >
            💡 Conservation Tips
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'analytics' ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === 'analytics' ? '#667eea' : 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
          >
            📊 Analytics
          </button>
        </div>

        {/* Content - Active Tab */}
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {activeTab === 'report' && <WaterWasteForm />}
          {activeTab === 'monitor' && <WaterLevelMonitor />}
          {activeTab === 'greenzone' && <GreenZoneAnalysis />}
          {activeTab === 'tips' && <WaterConservationTips />}
          {activeTab === 'analytics' && <Analytics />}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '40px',
          textAlign: 'center',
          color: 'white',
          padding: '20px',
          borderTop: '1px solid rgba(255,255,255,0.2)'
        }}>
          <p>🚨 Emergency Helpline: <strong>1916</strong> (24/7 Water Department)</p>
          <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '10px' }}>
            Report leaks to help conserve water | AI-Powered Analysis
          </p>
          <p style={{ fontSize: '11px', opacity: 0.6, marginTop: '10px' }}>
            © 2024 Smart Water Management System | Version 2.0
          </p>
        </div>
      </div>

      {/* AI Chatbot - Floating */}
      <AiChatbot />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Smooth transitions */
        button {
          transition: all 0.3s ease !important;
        }
        
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.5);
        }
      `}</style>
    </div>
  );
}

export default App;