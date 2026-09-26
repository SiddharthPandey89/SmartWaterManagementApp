import React, { useState } from 'react';

const AIChatbot = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your AI water management assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const getAIResponse = (question) => {
    const msg = question.toLowerCase();
    
    if (msg.includes('leak') || msg.includes('leakage')) {
      return "🔧 To report a leak, go to the 'Report Leakage' tab. Fill the form with details and upload photos. Our system will notify government officials.";
    }
    if (msg.includes('water level')) {
      return "💧 Check the 'Water Monitor' tab for real-time water levels in different areas. Green is safe, Orange is warning, Red is critical.";
    }
    if (msg.includes('helpline') || msg.includes('contact')) {
      return "📞 Emergency Helpline: 1916 (Water Department, 24/7)\n📞 Municipal Corporation: 155304\n📞 Emergency Services: 112";
    }
    if (msg.includes('save water') || msg.includes('conserve')) {
      return "💡 Water Conservation Tips:\n• Fix leaking taps immediately\n• Take shorter showers\n• Use bucket instead of hose\n• Collect rainwater for plants";
    }
    if (msg.includes('report')) {
      return "📝 To report a water issue, go to 'Report Leakage' tab. Fill the form with location, leak type, severity, and upload photos.";
    }
    
    return "🤖 I'm your AI assistant. You can ask me about:\n• Reporting water leaks\n• Water level monitoring\n• Conservation tips\n• Emergency helplines\n\nHow can I help you?";
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { role: 'user', content: input }]);
    const response = getAIResponse(input);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    }, 500);
    setInput('');
  };

  return (
    <>
      {/* Chat Button */}
      <div onClick={() => setIsOpen(!isOpen)} style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        zIndex: 1000,
        transition: 'transform 0.3s'
      }}>
        <span style={{ fontSize: '28px' }}>🤖</span>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: '350px',
          height: '500px',
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>🤖 AI Water Assistant</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>×</button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '10px'
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '10px',
                  borderRadius: '12px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f0f0f0',
                  color: msg.role === 'user' ? 'white' : '#333',
                  whiteSpace: 'pre-line'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #eee' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything about water..."
              style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px', marginRight: '10px' }}
            />
            <button onClick={sendMessage} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Send
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default AIChatbot;