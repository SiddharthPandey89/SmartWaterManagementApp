// ============================================
// DYNAMIC WATER DATA SERVICE
// Future: Connect to Government API, Database, Backend
// ============================================

class WaterDataService {
  
  // ========== DATA SOURCE CONFIGURATION ==========
  static dataSource = 'demo'; // Options: 'demo', 'api', 'database', 'firebase'
  
  // API Endpoints (Future use)
  static apiEndpoints = {
    government: 'https://api.data.gov.in/resource/water-levels',
    stateWaterBoard: 'https://mpjalnigam.nic.in/api/water-level',
    municipalCorp: 'https://imcindore.mp.gov.in/api/water-data'
  };
  
  // ========== DEMO DATA (Current) ==========
  static getDemoData() {
    return [
      { id: 1, name: "Vijay Nagar", waterLevel: 85, status: "high", lastUpdate: new Date().toLocaleTimeString(), consumption: 12500, population: 25000 },
      { id: 2, name: "Indrapuri", waterLevel: 45, status: "medium", lastUpdate: new Date().toLocaleTimeString(), consumption: 18750, population: 32000 },
      { id: 3, name: "Scheme No. 54", waterLevel: 25, status: "low", lastUpdate: new Date().toLocaleTimeString(), consumption: 8900, population: 15000 },
      { id: 4, name: "Mahalaxmi Nagar", waterLevel: 92, status: "high", lastUpdate: new Date().toLocaleTimeString(), consumption: 15600, population: 28000 },
      { id: 5, name: "Gumasta Nagar", waterLevel: 15, status: "low", lastUpdate: new Date().toLocaleTimeString(), consumption: 4500, population: 8000 },
      { id: 6, name: "Jawahar Chowk", waterLevel: 68, status: "medium", lastUpdate: new Date().toLocaleTimeString(), consumption: 22300, population: 45000 },
      { id: 7, name: "New Adarsh Nagar", waterLevel: 78, status: "high", lastUpdate: new Date().toLocaleTimeString(), consumption: 9800, population: 18000 },
      { id: 8, name: "Sanjeevani Nagar", waterLevel: 32, status: "low", lastUpdate: new Date().toLocaleTimeString(), consumption: 6700, population: 12000 }
    ];
  }
  
  // ========== FUTURE: GET DATA FROM GOVERNMENT API ==========
  static async getDataFromGovernmentAPI() {
    try {
      const response = await fetch(this.apiEndpoints.government);
      const data = await response.json();
      return data.map(item => ({
        id: item.zone_id,
        name: item.zone_name,
        waterLevel: item.water_level_percentage,
        status: this.calculateStatus(item.water_level_percentage),
        lastUpdate: new Date(item.last_updated).toLocaleTimeString(),
        consumption: item.daily_consumption,
        population: item.population
      }));
    } catch (error) {
      console.error("Government API Error:", error);
      return this.getDemoData();
    }
  }
  
  // ========== FUTURE: GET DATA FROM DATABASE ==========
  static async getDataFromDatabase() {
    try {
      const response = await fetch('http://localhost:5000/api/water-levels');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Database Error:", error);
      return this.getDemoData();
    }
  }
  
  // ========== FUTURE: GET DATA FROM FIREBASE ==========
  static async getDataFromFirebase() {
    try {
      const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        databaseURL: "https://your-project.firebaseio.com"
      };
      const response = await fetch(`${firebaseConfig.databaseURL}/water-levels.json`);
      const data = await response.json();
      return Object.values(data);
    } catch (error) {
      console.error("Firebase Error:", error);
      return this.getDemoData();
    }
  }
  
  // ========== MAIN GET DATA FUNCTION ==========
  static async getWaterData() {
    switch(this.dataSource) {
      case 'api':
        return await this.getDataFromGovernmentAPI();
      case 'database':
        return await this.getDataFromDatabase();
      case 'firebase':
        return await this.getDataFromFirebase();
      default:
        return this.getDemoData();
    }
  }
  
  // ========== HELPER: Calculate Status ==========
  static calculateStatus(waterLevel) {
    if (waterLevel >= 70) return 'high';
    if (waterLevel >= 40) return 'medium';
    return 'low';
  }
  
  // ========== HELPER: Get Status Color ==========
  static getStatusColor(status) {
    switch(status) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  }
  
  // ========== GET STATISTICS ==========
  static getStatistics(areas) {
    return {
      total: areas.length,
      high: areas.filter(a => a.status === 'high').length,
      medium: areas.filter(a => a.status === 'medium').length,
      low: areas.filter(a => a.status === 'low').length,
      avgLevel: Math.round(areas.reduce((sum, a) => sum + a.waterLevel, 0) / areas.length),
      totalConsumption: areas.reduce((sum, a) => sum + (a.consumption || 0), 0),
      totalPopulation: areas.reduce((sum, a) => sum + (a.population || 0), 0)
    };
  }
}

export default WaterDataService;