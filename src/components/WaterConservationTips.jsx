import React, { useState, useEffect } from 'react';

const WaterConservationTips = () => {
  const [tips] = useState([
    { id: 1, category: "🚿 Bathroom", title: "Shorten Your Showers", description: "Reduce shower time by 2 minutes to save up to 4,000 liters per month.", savings: "4,000 L/month", difficulty: "Easy", points: 50 },
    { id: 2, category: "💧 Daily Habits", title: "Fix Leaking Taps", description: "A dripping tap can waste up to 15,000 liters of water per year.", savings: "15,000 L/year", difficulty: "Easy", points: 100 },
    { id: 3, category: "🍽️ Kitchen", title: "Use Dishwasher Efficiently", description: "Only run dishwasher when full. Saves up to 2,500 liters per month.", savings: "2,500 L/month", difficulty: "Medium", points: 75 },
    { id: 4, category: "🌿 Garden", title: "Water Plants in Morning", description: "Watering early morning reduces evaporation by 30%.", savings: "30% saved", difficulty: "Easy", points: 40 },
    { id: 5, category: "🧺 Laundry", title: "Full Load Only", description: "Wash full loads instead of partial to save up to 3,000 liters per month.", savings: "3,000 L/month", difficulty: "Easy", points: 60 },
    { id: 6, category: "💡 Smart Tech", title: "Install Smart Water Meter", description: "Track usage and detect leaks automatically.", savings: "20-30% reduction", difficulty: "Hard", points: 150 },
    { id: 7, category: "🚰 Daily", title: "Turn Off Tap While Brushing", description: "Save up to 8 liters per minute while brushing teeth.", savings: "8 L/min", difficulty: "Easy", points: 30 },
    { id: 8, category: "🧼 Cleaning", title: "Use Bucket Instead of Hose", description: "Washing car with bucket saves 300 liters per wash.", savings: "300 L/wash", difficulty: "Easy", points: 45 },
  ]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [acceptedChallenges, setAcceptedChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [badges, setBadges] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState(null);

  const categories = ['all', '🚿 Bathroom', '💧 Daily Habits', '🍽️ Kitchen', '🌿 Garden', '🧺 Laundry', '💡 Smart Tech'];

  // Load saved data from localStorage
  useEffect(() => {
    const savedChallenges = localStorage.getItem('acceptedChallenges');
    const savedCompleted = localStorage.getItem('completedChallenges');
    const savedPoints = localStorage.getItem('totalPoints');
    const savedBadges = localStorage.getItem('badges');
    const savedStreak = localStorage.getItem('streak');
    const savedLastDate = localStorage.getItem('lastCompletedDate');
    
    if (savedChallenges) setAcceptedChallenges(JSON.parse(savedChallenges));
    if (savedCompleted) setCompletedChallenges(JSON.parse(savedCompleted));
    if (savedPoints) setTotalPoints(parseInt(savedPoints));
    if (savedBadges) setBadges(JSON.parse(savedBadges));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedLastDate) setLastCompletedDate(savedLastDate);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('acceptedChallenges', JSON.stringify(acceptedChallenges));
    localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges));
    localStorage.setItem('totalPoints', totalPoints);
    localStorage.setItem('badges', JSON.stringify(badges));
    localStorage.setItem('streak', streak);
    localStorage.setItem('lastCompletedDate', lastCompletedDate);
  }, [acceptedChallenges, completedChallenges, totalPoints, badges, streak, lastCompletedDate]);

  // Check and update streak
  useEffect(() => {
    const today = new Date().toDateString();
    if (lastCompletedDate) {
      const lastDate = new Date(lastCompletedDate);
      const currentDate = new Date();
      const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day
        setStreak(prev => prev + 1);
      } else if (diffDays > 1) {
        // Streak broken
        setStreak(0);
      }
    }
  }, [completedChallenges.length]);

  // Check for new badges
  useEffect(() => {
    const newBadges = [];
    
    if (totalPoints >= 100 && !badges.includes('🌱 Beginner')) {
      newBadges.push('🌱 Beginner');
      showBadgeNotification('🌱 Beginner Badge Unlocked!');
    }
    if (totalPoints >= 500 && !badges.includes('💧 Water Saver')) {
      newBadges.push('💧 Water Saver');
      showBadgeNotification('💧 Water Saver Badge Unlocked!');
    }
    if (totalPoints >= 1000 && !badges.includes('🏆 Conservation Hero')) {
      newBadges.push('🏆 Conservation Hero');
      showBadgeNotification('🏆 Conservation Hero Badge Unlocked!');
    }
    if (streak >= 7 && !badges.includes('🔥 7 Day Streak')) {
      newBadges.push('🔥 7 Day Streak');
      showBadgeNotification('🔥 7 Day Streak Badge Unlocked!');
    }
    if (completedChallenges.length >= 10 && !badges.includes('🎖️ Challenge Master')) {
      newBadges.push('🎖️ Challenge Master');
      showBadgeNotification('🎖️ Challenge Master Badge Unlocked!');
    }
    
    if (newBadges.length > 0) {
      setBadges([...badges, ...newBadges]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [totalPoints, streak, completedChallenges.length]);

  const showBadgeNotification = (message) => {
    const notification = document.createElement('div');
    notification.innerHTML = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.background = 'linear-gradient(135deg, #f59e0b, #ea580c)';
    notification.style.color = 'white';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '10px';
    notification.style.zIndex = '1000';
    notification.style.fontWeight = 'bold';
    notification.style.animation = 'slideIn 0.5s ease';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const acceptChallenge = (tip) => {
    if (acceptedChallenges.some(c => c.id === tip.id)) {
      alert("You've already accepted this challenge!");
      return;
    }
    
    setAcceptedChallenges([...acceptedChallenges, { ...tip, acceptedDate: new Date().toISOString(), status: 'in-progress' }]);
    alert(`✅ Challenge "${tip.title}" accepted! Complete it to earn ${tip.points} points.`);
  };

  const completeChallenge = (tip) => {
    if (completedChallenges.some(c => c.id === tip.id)) {
      alert("You've already completed this challenge!");
      return;
    }
    
    if (!acceptedChallenges.some(c => c.id === tip.id)) {
      alert("Please accept the challenge first!");
      return;
    }
    
    // Mark as completed
    setCompletedChallenges([...completedChallenges, { ...tip, completedDate: new Date().toISOString() }]);
    setTotalPoints(prev => prev + tip.points);
    setLastCompletedDate(new Date().toDateString());
    
    // Remove from accepted challenges
    setAcceptedChallenges(acceptedChallenges.filter(c => c.id !== tip.id));
    
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    
    alert(`🎉 Congratulations! You earned ${tip.points} points for completing "${tip.title}"!`);
  };

  const cancelChallenge = (id) => {
    setAcceptedChallenges(acceptedChallenges.filter(c => c.id !== id));
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'Easy') return '#10b981';
    if (difficulty === 'Medium') return '#f59e0b';
    return '#ef4444';
  };

  const filteredTips = selectedCategory === 'all' ? tips : tips.filter(tip => tip.category === selectedCategory);
  const inProgressCount = acceptedChallenges.length;
  const completedCount = completedChallenges.length;

  return (
    <div>
      {/* Confetti Effect */}
      {showConfetti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            background: 'white',
            padding: '20px 40px',
            borderRadius: '20px',
            fontSize: '24px',
            animation: 'bounce 0.5s ease'
          }}>
            🎉 Achievement Unlocked! 🎉
          </div>
        </div>
      )}

      {/* User Stats Card */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '30px',
        color: 'white'
      }}>
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🏆 Your Conservation Journey
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px'
        }}>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '10px' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalPoints}</div>
            <div style={{ fontSize: '12px' }}>Total Points</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '10px' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{completedCount}</div>
            <div style={{ fontSize: '12px' }}>Completed</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '10px' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{inProgressCount}</div>
            <div style={{ fontSize: '12px' }}>In Progress</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.2)', padding: '15px', borderRadius: '10px' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>🔥 {streak}</div>
            <div style={{ fontSize: '12px' }}>Day Streak</div>
          </div>
        </div>
        
        {/* Badges */}
        {badges.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <div style={{ fontSize: '12px', marginBottom: '8px' }}>🎖️ Badges Earned:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {badges.map((badge, i) => (
                <span key={i} style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px'
                }}>{badge}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Challenges Section */}
      {acceptedChallenges.length > 0 && (
        <div style={{
          background: '#fef3c7',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          borderLeft: '4px solid #f59e0b'
        }}>
          <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🔥 Your Active Challenges ({acceptedChallenges.length})
          </h3>
          {acceptedChallenges.map(challenge => (
            <div key={challenge.id} style={{
              background: 'white',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div>
                <strong>{challenge.title}</strong>
                <div style={{ fontSize: '12px', color: '#666' }}>+{challenge.points} points</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => completeChallenge(challenge)} style={{
                  padding: '8px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  ✅ Complete
                </button>
                <button onClick={() => cancelChallenge(challenge.id)} style={{
                  padding: '8px 16px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  ❌ Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px', color: 'white' }}>
        <h2 style={{ fontSize: '28px' }}>💡 Water Conservation Challenges</h2>
        <p>Accept challenges, earn points, and become a water conservation hero!</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>💧</div>
          <h3>Potential Savings</h3>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>Up to 45,000 L/month</p>
        </div>
        <div style={{ background: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>💰</div>
          <h3>Money Saved</h3>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>₹5,000 - ₹8,000/year</p>
        </div>
        <div style={{ background: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>🌍</div>
          <h3>Your Impact</h3>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#667eea' }}>{totalPoints} Points Earned</p>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
            padding: '8px 20px',
            background: selectedCategory === cat ? 'white' : 'rgba(255,255,255,0.2)',
            color: selectedCategory === cat ? '#667eea' : 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer'
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Tips Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {filteredTips.map(tip => {
          const isAccepted = acceptedChallenges.some(c => c.id === tip.id);
          const isCompleted = completedChallenges.some(c => c.id === tip.id);
          
          return (
            <div key={tip.id} style={{
              background: isCompleted ? '#d1fae5' : 'white',
              borderRadius: '15px',
              padding: '20px',
              transition: 'transform 0.3s',
              opacity: isCompleted ? 0.7 : 1,
              position: 'relative'
            }}>
              {isCompleted && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  fontSize: '24px'
                }}>✅</div>
              )}
              <div style={{ fontSize: '12px', color: '#667eea', marginBottom: '10px' }}>{tip.category}</div>
              <h3 style={{ marginBottom: '10px', color: '#1e3c72' }}>{tip.title}</h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>{tip.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ background: '#d1fae5', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: '#10b981' }}>💧 {tip.savings}</span>
                <span style={{ background: `${getDifficultyColor(tip.difficulty)}20`, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: getDifficultyColor(tip.difficulty) }}>
                  {tip.difficulty} • +{tip.points} pts
                </span>
              </div>
              
              {!isCompleted ? (
                !isAccepted ? (
                  <button onClick={() => acceptChallenge(tip)} style={{
                    width: '100%',
                    padding: '10px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    🎯 Accept Challenge
                  </button>
                ) : (
                  <button onClick={() => completeChallenge(tip)} style={{
                    width: '100%',
                    padding: '10px',
                    background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    ✅ Complete Challenge
                  </button>
                )
              ) : (
                <button disabled style={{
                  width: '100%',
                  padding: '10px',
                  background: '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'not-allowed'
                }}>
                  ✓ Completed
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Daily Challenge Section */}
      <div style={{
        marginTop: '30px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        borderRadius: '15px',
        padding: '30px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h3>🎯 Today's Special Challenge</h3>
        <p style={{ marginTop: '10px' }}>Take a 5-minute shower instead of 10 minutes and save 250 liters today!</p>
        <button style={{
          marginTop: '15px',
          padding: '10px 25px',
          background: 'white',
          border: 'none',
          borderRadius: '25px',
          color: '#667eea',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Accept Daily Challenge ✅
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default WaterConservationTips;