import React, { useState, useRef, useEffect } from 'react';
import AIService from '../services/aiService';

const WaterWasteForm = () => {
  const [formData, setFormData] = useState({
    area: '',
    location: '',
    leakType: 'pipe_burst',
    severity: 'medium',
    description: '',
    name: '',
    phone: ''
  });
  const [photos, setPhotos] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  
  // ========== AI STATES ==========
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiSolution, setAiSolution] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // ========== LOCATION STATES ==========
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ========== AI ANALYSIS ON DESCRIPTION CHANGE ==========
  useEffect(() => {
    const analyzeWithAI = async () => {
      if (formData.description && formData.description.length > 15) {
        setIsAnalyzing(true);
        const analysis = await AIService.analyzeLeakSeverity(
          formData.description,
          formData.leakType,
          formData.severity
        );
        setAiAnalysis(analysis);
        
        const solution = await AIService.generateAISolution(
          formData.leakType,
          analysis?.severity || formData.severity,
          formData.description,
          formData.area
        );
        setAiSolution(solution);
        setIsAnalyzing(false);
      }
    };
    
    const timeout = setTimeout(() => {
      analyzeWithAI();
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, [formData.description, formData.leakType]);

  // ========== AUTO DETECT CURRENT LOCATION ==========
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setLocationStatus('loading');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            const address = data.address;
            const areaName = address.suburb || address.city_district || address.city || address.town || 'Unknown Area';
            const fullAddress = data.display_name;
            
            setFormData(prev => ({
              ...prev,
              area: areaName,
              location: fullAddress
            }));
            setLocationStatus('success');
          } else {
            setFormData(prev => ({
              ...prev,
              location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            }));
            setLocationStatus('success');
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
          setLocationStatus('success');
        }
      },
      (error) => {
        console.error("Location error:", error);
        setLocationStatus('error');
        alert("Unable to get your location. Please enter manually.");
      }
    );
  };

  // ========== AUTO LOAD LOCATION ON PAGE LOAD ==========
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // ========== START CAMERA ==========
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      alert("Camera access denied. Please check permissions.");
    }
  };

  // ========== CAPTURE PHOTO ==========
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const photoUrl = URL.createObjectURL(blob);
        setPhotos([...photos, { url: photoUrl, blob: blob, file: blob }]);
      }, 'image/jpeg', 0.8);
      
      stopCamera();
    }
  };

  // ========== STOP CAMERA ==========
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  // ========== UPLOAD PHOTO FROM GALLERY ==========
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPhotos([...photos, { url: url, file: file }]);
      }
    });
  };

  // ========== REMOVE PHOTO ==========
  const removePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  // ========== SUBMIT FORM ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.area || !formData.location || !formData.name || !formData.phone) {
      alert("Please fill all required fields");
      return;
    }
    
    if (!/^\d{10}$/.test(formData.phone)) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    
    const newReportId = `WTR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setReportId(newReportId);
    
    // Generate AI Report
    const reportDataForAI = {
      id: newReportId,
      area: formData.area,
      location: formData.location,
      leakType: formData.leakType,
      severity: formData.severity,
      description: formData.description,
      name: formData.name,
      phone: formData.phone
    };
    
    const aiGeneratedReport = await AIService.generateAIReport(reportDataForAI);
    setAiReport(aiGeneratedReport);
    
    const reportData = {
      id: newReportId,
      ...formData,
      photos: photos.length,
      timestamp: new Date().toISOString(),
      status: 'pending',
      coordinates: currentLocation,
      aiAnalysis: aiAnalysis,
      aiSolution: aiSolution,
      aiReport: aiGeneratedReport
    };
    
    const reports = JSON.parse(localStorage.getItem('waterReports') || '[]');
    reports.unshift(reportData);
    localStorage.setItem('waterReports', JSON.stringify(reports));
    
    console.log('========================================');
    console.log('🚨 AI-ENHANCED WATER LEAKAGE REPORT 🚨');
    console.log('========================================');
    console.log('Report ID:', newReportId);
    console.log('AI Analysis:', aiAnalysis);
    console.log('AI Solution:', aiSolution);
    console.log('AI Report:', aiGeneratedReport);
    console.log('========================================');
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
        animation: 'fadeIn 0.5s ease'
      }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
        <h2 style={{ color: '#10b981', marginBottom: '10px' }}>Report Submitted Successfully!</h2>
        <p>Government officials have been notified.</p>
        
        <div style={{
          background: '#e0e7ff',
          padding: '15px',
          borderRadius: '10px',
          textAlign: 'left',
          marginBottom: '20px',
          marginTop: '20px'
        }}>
          <p><strong>📋 Report ID:</strong> {reportId}</p>
          <p><strong>📍 Location:</strong> {formData.area}</p>
          <p><strong>📸 Photos:</strong> {photos.length} uploaded</p>
          <p><strong>🚨 Severity:</strong> {formData.severity.toUpperCase()}</p>
        </div>
        
        {/* AI Report Display */}
        {aiReport && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <h3 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🤖 AI Generated Report
            </h3>
            <p><strong>Summary:</strong> {aiReport.summary}</p>
            <p><strong>Urgency:</strong> <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{aiReport.urgency}</span></p>
            <p><strong>Recommendation:</strong> {aiReport.recommendation}</p>
            <p><strong>Action Required:</strong> {aiReport.actionRequired}</p>
          </div>
        )}
        
        {/* AI Analysis Display */}
        {aiAnalysis && (
          <div style={{
            background: '#f0fdf4',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'left',
            borderLeft: `4px solid ${aiAnalysis.color || '#10b981'}`
          }}>
            <p><strong>🤖 AI Analysis:</strong> {aiAnalysis.reason}</p>
            <p><strong>Recommended Action:</strong> {aiAnalysis.recommendedAction}</p>
          </div>
        )}
        
        <div style={{ background: '#d1fae5', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
          <p><strong>📞 Emergency Helpline:</strong> 1916 (24/7)</p>
          <p>Keep this Report ID for tracking: <strong>{reportId}</strong></p>
        </div>
        
        <button onClick={() => window.location.reload()} style={{
          marginTop: '10px',
          padding: '12px 24px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
          📝 Report Another Leak
        </button>
        
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Camera Modal */}
      {showCamera && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <video ref={videoRef} autoPlay playsInline style={{ maxWidth: '90%', borderRadius: '10px' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
            <button onClick={capturePhoto} style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>📸 Capture</button>
            <button onClick={stopCamera} style={{ background: '#ef4444', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
      
      <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>📝 Report Water Leakage</h2>
      
      <form onSubmit={handleSubmit} style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        
        {/* Location Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#1e3c72' }}>📍 Location Details</h3>
            <button 
              type="button" 
              onClick={getCurrentLocation}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '5px 12px',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔄 Detect Again
            </button>
          </div>
          
          {locationStatus === 'loading' && (
            <div style={{ background: '#e0e7ff', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
              ⏳ Detecting your current location...
            </div>
          )}
          
          {locationStatus === 'success' && (
            <div style={{ background: '#d1fae5', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', fontSize: '13px' }}>
              ✅ Location detected automatically!
            </div>
          )}
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Area/Locality *</label>
            <input type="text" name="area" value={formData.area} onChange={handleChange} required placeholder="e.g., Vijay Nagar, Indore" style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px' }} />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Full Address *</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="Street address, landmark" style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px' }} />
          </div>
        </div>
        
        {/* AI Analysis Display while typing */}
        {isAnalyzing && (
          <div style={{ background: '#e0e7ff', padding: '12px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center' }}>
            🤖 AI is analyzing your report...
          </div>
        )}
        
        {aiAnalysis && !isAnalyzing && (
          <div style={{
            background: `${aiAnalysis.color}15`,
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            borderLeft: `4px solid ${aiAnalysis.color}`
          }}>
            <p><strong>🤖 AI Analysis:</strong> {aiAnalysis.reason}</p>
            <p><strong>Recommended:</strong> {aiAnalysis.recommendedAction}</p>
            <p><strong>Confidence:</strong> {aiAnalysis.confidence}%</p>
          </div>
        )}
        
        {/* AI Solutions Display */}
        {aiSolution && !isAnalyzing && (
          <div style={{
            background: '#fef3c7',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <p><strong>💡 AI Solutions:</strong></p>
            <ul style={{ marginLeft: '20px' }}>
              {aiSolution.immediateActions?.slice(0, 2).map((action, i) => <li key={i}>{action}</li>)}
            </ul>
          </div>
        )}
        
        {/* Leak Details */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#1e3c72' }}>💧 Leak Details</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Type of Leak *</label>
            <select name="leakType" value={formData.leakType} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px' }}>
              <option value="pipe_burst">💥 Pipe Burst - Major pipe rupture</option>
              <option value="small_leak">💧 Small Leak - Minor leakage</option>
              <option value="valve_leak">🔧 Valve Leak - Leaking from valves</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Severity Level *</label>
            <select name="severity" value={formData.severity} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px' }}>
              <option value="low">🟢 Low - Minor issue</option>
              <option value="medium">🟠 Medium - Needs attention</option>
              <option value="high">🔴 High - Urgent action required</option>
              <option value="emergency">🚨 Emergency - Immediate response needed</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required placeholder="Describe the leak, duration, visible damage... (AI will analyze automatically)" style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px' }} />
          </div>
        </div>
        
        {/* Photo Upload */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#1e3c72' }}>📸 Upload Evidence Photos</h3>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <button type="button" onClick={startCamera} style={{ background: '#3b82f6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              📷 Take Photo
            </button>
            <label style={{ background: '#10b981', color: 'white', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer' }}>
              📁 Upload from Gallery
              <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
          </div>
          
          {photos.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
              {photos.map((photo, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img src={photo.url} alt="Evidence" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                  <button type="button" onClick={() => removePhoto(index)} style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    cursor: 'pointer'
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Contact Section */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#1e3c72' }}>📞 Your Contact</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Your Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px' }} />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Phone Number *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="10-digit mobile number" style={{ width: '100%', padding: '12px', border: '2px solid #ddd', borderRadius: '8px' }} />
            <small style={{ fontSize: '11px', color: '#666' }}>For tracking and updates</small>
          </div>
        </div>
        
        <button type="submit" disabled={locationStatus === 'loading'} style={{
          width: '100%',
          padding: '15px',
          background: locationStatus === 'loading' ? '#ccc' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: locationStatus === 'loading' ? 'not-allowed' : 'pointer'
        }}>
          {locationStatus === 'loading' ? '📍 Detecting Location...' : `🚨 Submit AI-Powered Report ${photos.length > 0 ? `(${photos.length} photos)` : ''}`}
        </button>
        
        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '12px', color: '#666' }}>
          🤖 AI analyzes your report | 📍 Location auto-detected | 📸 Photo evidence supported
        </p>
      </form>
    </div>
  );
};

export default WaterWasteForm;