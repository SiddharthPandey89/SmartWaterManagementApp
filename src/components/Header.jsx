import React from 'react';

const Header = () => {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
      color: 'white',
      padding: '20px 0',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            fontSize: '45px',
            animation: 'float 3s ease-in-out infinite'
          }}>💧</div>
          <div>
            <h1 style={{ fontSize: '24px', margin: 0 }}>Smart Water Management</h1>
            <p style={{ fontSize: '12px', opacity: 0.8, margin: '5px 0 0 0' }}>Detect | Report | Conserve</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px' }}>🏘️</div>
            <small>8 Areas</small>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px' }}>🚨</div>
            <small>24/7 Support</small>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px' }}>📞</div>
            <small>1916 Helpline</small>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </header>
  );
};

export default Header;