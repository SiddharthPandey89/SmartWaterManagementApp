import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

class AIService {
  
  // ========== GEMINI AI - LEAK SEVERITY ANALYSIS ==========
  static async analyzeLeakSeverity(description, leakType, severity) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `You are a water leak detection expert. Analyze this leak report and determine severity.
      
      Report Details:
      - Description: ${description}
      - Leak Type: ${leakType}
      - User Selected Severity: ${severity}
      
      Respond in JSON format only (no extra text):
      {
        "severity": "low/medium/high/emergency",
        "confidence": 0-100,
        "color": "hex code",
        "reason": "brief explanation",
        "recommendedAction": "what to do immediately"
      }`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.getFallbackAnalysis(description, leakType);
    } catch (error) {
      console.error("Gemini API Error:", error);
      return this.getFallbackAnalysis(description, leakType);
    }
  }
  
  // ========== GEMINI AI - SOLUTION GENERATOR ==========
  static async generateAISolution(leakType, severity, description, location) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Generate a comprehensive water leak solution based on:
      
      Leak Type: ${leakType}
      Severity: ${severity}
      Description: ${description}
      Location: ${location}
      
      Respond in JSON format:
      {
        "immediateActions": ["action1", "action2", "action3", "action4"],
        "shortTermSolutions": ["solution1", "solution2", "solution3"],
        "longTermSolutions": ["solution1", "solution2", "solution3"],
        "estimatedTime": "time string",
        "estimatedCost": "cost string",
        "emergencyContacts": ["1916 - Water Helpline", "112 - Emergency"],
        "waterWastage": {
          "daily": "number in liters",
          "monthly": "number in liters"
        }
      }`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.getFallbackSolution(leakType, severity);
    } catch (error) {
      console.error("Gemini API Error:", error);
      return this.getFallbackSolution(leakType, severity);
    }
  }
  
  // ========== GEMINI AI - REPORT SUMMARY ==========
  static async generateAIReport(reportData) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Generate a professional water leakage report summary based on:
      
      Report ID: ${reportData.id}
      Location: ${reportData.area}, ${reportData.location}
      Leak Type: ${reportData.leakType}
      Severity: ${reportData.severity}
      Description: ${reportData.description}
      Reporter: ${reportData.name}
      
      Respond in JSON format:
      {
        "summary": "brief 2-line summary of the issue",
        "urgency": "low/medium/high/emergency",
        "recommendation": "what authorities should do",
        "estimatedWaterLoss": "number in liters per day",
        "actionRequired": "immediate action needed"
      }`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.getFallbackReport(reportData);
    } catch (error) {
      console.error("Gemini API Error:", error);
      return this.getFallbackReport(reportData);
    }
  }
  
  // ========== FALLBACK METHODS ==========
  static getFallbackAnalysis(description, leakType) {
    const text = description.toLowerCase();
    if (text.includes('burst') || text.includes('flood') || text.includes('emergency')) {
      return { severity: 'emergency', confidence: 85, color: '#dc2626', reason: 'Emergency keywords detected', recommendedAction: 'Call 1916 immediately' };
    }
    if (text.includes('major') || text.includes('severe') || text.includes('heavy')) {
      return { severity: 'high', confidence: 75, color: '#ef4444', reason: 'High severity indicators', recommendedAction: 'Schedule urgent repair' };
    }
    if (text.includes('leak') || text.includes('dripping')) {
      return { severity: 'medium', confidence: 65, color: '#f59e0b', reason: 'Leak detected', recommendedAction: 'Schedule repair within 48 hours' };
    }
    return { severity: 'low', confidence: 55, color: '#10b981', reason: 'Minor issue detected', recommendedAction: 'Monitor the situation' };
  }
  
  static getFallbackSolution(leakType, severity) {
    return {
      immediateActions: ['📞 Call emergency helpline: 1916', '⚠️ Mark the area', '📸 Take photos', '💧 Collect water if possible'],
      shortTermSolutions: ['🔧 Schedule professional inspection', '📊 Monitor the situation', '🔄 Arrange alternate water supply'],
      longTermSolutions: ['🏗️ Plan permanent repair', '📋 Update maintenance schedule', '🔧 Consider pipe replacement'],
      estimatedTime: '2-4 hours',
      estimatedCost: '₹2,000 - ₹10,000',
      emergencyContacts: ['1916 - Water Helpline', '112 - Emergency'],
      waterWastage: { daily: '28,800', monthly: '864,000' }
    };
  }
  
  static getFallbackReport(reportData) {
    return {
      summary: `Water leakage reported in ${reportData.area} with ${reportData.severity} severity.`,
      urgency: reportData.severity,
      recommendation: `Immediate inspection required in ${reportData.area}.`,
      estimatedWaterLoss: '10,000',
      actionRequired: 'Dispatch team for inspection'
    };
  }
}

export default AIService;