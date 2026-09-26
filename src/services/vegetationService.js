import axios from 'axios';

class VegetationService {
  
  // ========== NDVI THRESHOLDS FOR CLASSIFICATION ==========
  static NDVI_THRESHOLDS = {
    HIGH_VEGETATION: 0.6,      // > 0.6 = Dense forest/trees
    MEDIUM_VEGETATION: 0.4,    // 0.4 - 0.6 = Moderate vegetation
    LOW_VEGETATION: 0.2,       // 0.2 - 0.4 = Sparse vegetation
    NO_VEGETATION: 0.0         // < 0.2 = No vegetation/Urban
  };
  
  // ========== GET VEGETATION DATA FROM SENTINEL HUB ==========
  static async getVegetationData(lat, lng, radius = 500) {
    try {
      // Calculate bounding box around location
      const delta = radius / 111320; // Convert meters to degrees
      const bbox = {
        west: lng - delta,
        south: lat - delta,
        east: lng + delta,
        north: lat + delta
      };
      
      // Sentinel Hub Evalscript for NDVI calculation
      const evalscript = `
        //VERSION=3
        function setup() {
          return {
            input: ["B04", "B08"],
            output: { bands: 1 }
          };
        }
        
        function evaluatePixel(sample) {
          let nir = sample.B08;
          let red = sample.B04;
          let ndvi = (nir - red) / (nir + red);
          return [ndvi];
        }
      `;
      
      // Get access token from Sentinel Hub
      const token = await this.getSentinelToken();
      
      // Request satellite data
      const response = await axios.post(
        'https://services.sentinel-hub.com/api/v1/process',
        {
          input: {
            bounds: {
              geometry: {
                type: "Polygon",
                coordinates: [[
                  [bbox.west, bbox.south],
                  [bbox.east, bbox.south],
                  [bbox.east, bbox.north],
                  [bbox.west, bbox.north],
                  [bbox.west, bbox.south]
                ]]
              },
              properties: { crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84" }
            },
            data: [
              {
                type: "sentinel-2-l2a",
                dataFilter: {
                  timeRange: {
                    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    to: new Date().toISOString().split('T')[0]
                  },
                  maxCloudCoverage: 20
                }
              }
            ]
          },
          output: {
            width: 512,
            height: 512,
            responsetype: "image/tiff"
          },
          evalscript: evalscript
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // For demo without actual satellite API, use fallback
      // In production, you would decode the TIFF response
      return this.fallbackAnalysis(lat, lng);
      
    } catch (error) {
      console.error("Satellite API Error:", error);
      return this.fallbackAnalysis(lat, lng);
    }
  }
  
  // ========== GET SENTINEL HUB ACCESS TOKEN ==========
  static async getSentinelToken() {
    // For demo, return mock token
    // In production, implement OAuth flow
    return 'mock-token-for-demo';
  }
  
  // ========== FALLBACK: Use OpenStreetMap / Overpass API for vegetation data ==========
  static async getVegetationFromOSM(lat, lng, radius = 500) {
    try {
      // Overpass API query for green areas (parks, gardens, forests)
      const query = `
        [out:json];
        (
          way["leisure"="park"](around:${radius},${lat},${lng});
          way["landuse"="forest"](around:${radius},${lat},${lng});
          way["landuse"="grass"](around:${radius},${lat},${lng});
          way["natural"="wood"](around:${radius},${lat},${lng});
          relation["leisure"="park"](around:${radius},${lat},${lng});
        );
        out body;
      `;
      
      const response = await axios.post(
        'https://overpass-api.de/api/interpreter',
        query,
        { headers: { 'Content-Type': 'text/plain' } }
      );
      
      const elements = response.data.elements || [];
      
      // Calculate area coverage
      let totalGreenArea = 0;
      let estimatedCoverage = 0;
      
      // Each green feature contributes to coverage estimate
      if (elements.length > 10) estimatedCoverage = 70;
      else if (elements.length > 5) estimatedCoverage = 50;
      else if (elements.length > 0) estimatedCoverage = 25;
      else estimatedCoverage = 10;
      
      return {
        ndvi: estimatedCoverage / 100,
        greenCoverPercentage: estimatedCoverage,
        classification: this.classifyByNDVI(estimatedCoverage / 100),
        featuresFound: elements.length,
        dataSource: 'OSM'
      };
      
    } catch (error) {
      console.error("OSM API Error:", error);
      return this.mockAnalysis(lat, lng);
    }
  }
  
  // ========== CLASSIFY BASED ON NDVI VALUE ==========
  static classifyByNDVI(ndvi) {
    if (ndvi >= this.NDVI_THRESHOLDS.HIGH_VEGETATION) {
      return {
        zone: 'HIGH',
        color: '#10b981',
        status: 'Dense Vegetation',
        description: 'This area has dense tree cover. High water retention capacity.',
        waterRequirement: 'LOW',
        icon: '🌳🌳🌳'
      };
    } else if (ndvi >= this.NDVI_THRESHOLDS.MEDIUM_VEGETATION) {
      return {
        zone: 'MEDIUM',
        color: '#f59e0b',
        status: 'Moderate Vegetation',
        description: 'This area has moderate green cover. Balanced water needs.',
        waterRequirement: 'MEDIUM',
        icon: '🌳🌳'
      };
    } else if (ndvi >= this.NDVI_THRESHOLDS.LOW_VEGETATION) {
      return {
        zone: 'LOW',
        color: '#ef4444',
        status: 'Sparse Vegetation',
        description: 'This area has low tree cover. Low water retention.',
        waterRequirement: 'HIGH',
        icon: '🌳'
      };
    } else {
      return {
        zone: 'URBAN',
        color: '#6b7280',
        status: 'Urban Area / No Vegetation',
        description: 'This area has minimal or no tree cover. Water conservation needed.',
        waterRequirement: 'CRITICAL',
        icon: '🏙️'
      };
    }
  }
  
  // ========== FALLBACK: Mock Analysis (When APIs fail) ==========
  static fallbackAnalysis(lat, lng) {
    // Use location-based heuristic (cities have less trees, rural areas have more)
    const isUrban = this.isUrbanArea(lat, lng);
    let ndvi;
    
    if (isUrban) {
      ndvi = Math.random() * 0.3; // Urban: 0-30% vegetation
    } else {
      ndvi = 0.3 + Math.random() * 0.6; // Rural: 30-90% vegetation
    }
    
    return {
      ndvi: ndvi,
      greenCoverPercentage: Math.round(ndvi * 100),
      classification: this.classifyByNDVI(ndvi),
      dataSource: 'heuristic'
    };
  }
  
  // ========== MOCK ANALYSIS (For development) ==========
  static mockAnalysis(lat, lng) {
    // Use location-based deterministic values for demo
    // In production, this would be replaced with actual satellite data
    
    // Create deterministic but realistic values based on coordinates
    const seed = (Math.sin(lat) + Math.cos(lng)) * 100;
    const ndvi = Math.abs((seed % 70) / 100); // Range: 0.00 to 0.70
    
    return {
      ndvi: parseFloat(ndvi.toFixed(2)),
      greenCoverPercentage: Math.round(ndvi * 100),
      classification: this.classifyByNDVI(ndvi),
      dataSource: 'satellite-simulated',
      note: 'This is simulated data. For real data, configure Sentinel Hub API keys.'
    };
  }
  
  // Helper to check if coordinates are in urban area (simplified)
  static isUrbanArea(lat, lng) {
    // Major Indian cities bounding boxes (simplified)
    const urbanZones = [
      { name: 'Delhi', latMin: 28.4, latMax: 28.9, lngMin: 77.0, lngMax: 77.3 },
      { name: 'Mumbai', latMin: 18.9, latMax: 19.2, lngMin: 72.8, lngMax: 72.9 },
      { name: 'Bangalore', latMin: 12.9, latMax: 13.1, lngMin: 77.5, lngMax: 77.7 },
      { name: 'Chennai', latMin: 13.0, latMax: 13.2, lngMin: 80.2, lngMax: 80.3 },
      { name: 'Kolkata', latMin: 22.5, latMax: 22.6, lngMin: 88.3, lngMax: 88.4 },
      { name: 'Indore', latMin: 22.7, latMax: 22.8, lngMin: 75.8, lngMax: 75.9 }
    ];
    
    return urbanZones.some(zone => 
      lat >= zone.latMin && lat <= zone.latMax && 
      lng >= zone.lngMin && lng <= zone.lngMax
    );
  }
  
  // ========== GET COMPLETE ZONE ANALYSIS ==========
  static async analyzeZone(lat, lng, address = '') {
    // Try OSM first (free, no API key needed)
    let vegetationData;
    
    try {
      vegetationData = await this.getVegetationFromOSM(lat, lng);
    } catch (error) {
      console.warn("OSM failed, using fallback");
      vegetationData = this.mockAnalysis(lat, lng);
    }
    
    const classification = vegetationData.classification;
    
    // Determine water management priority based on vegetation
    let priority;
    let waterSuggestion;
    
    switch(classification.zone) {
      case 'HIGH':
        priority = 'LOW';
        waterSuggestion = 'Natural water retention is high. Focus on maintaining existing green cover.';
        break;
      case 'MEDIUM':
        priority = 'MEDIUM';
        waterSuggestion = 'Moderate vegetation. Consider planting more trees to improve water retention.';
        break;
      case 'LOW':
        priority = 'HIGH';
        waterSuggestion = 'URGENT: Low vegetation detected. Immediate afforestation needed for water conservation.';
        break;
      default:
        priority = 'CRITICAL';
        waterSuggestion = 'CRITICAL: Urban heat island effect likely. Tree plantation urgently required.';
    }
    
    return {
      location: { lat, lng, address },
      vegetation: {
        ndvi: vegetationData.ndvi,
        greenCoverPercentage: vegetationData.greenCoverPercentage,
        classification: classification,
        featuresFound: vegetationData.featuresFound || 0
      },
      waterManagement: {
        priority: priority,
        suggestion: waterSuggestion,
        recommendedAction: this.getRecommendedAction(classification.zone)
      },
      timestamp: new Date().toISOString(),
      dataSource: vegetationData.dataSource
    };
  }
  
  static getRecommendedAction(zone) {
    switch(zone) {
      case 'HIGH':
        return '✅ Maintain existing greenery. Regular monitoring recommended.';
      case 'MEDIUM':
        return '🟠 Plant 50-100 additional trees per hectare to reach optimal levels.';
      case 'LOW':
        return '🔴 IMMEDIATE: Plant 200+ trees per hectare. Install rainwater harvesting.';
      default:
        return '🚨 CRITICAL: Urgent urban forestry program needed. Contact municipal corporation.';
    }
  }
}

export default VegetationService;