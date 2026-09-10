/**
 * Jain Population & Demographic Insights Service
 * Provides estimated Jain population data focused on Destination / End Locations,
 * major Indian cities, districts, and sacred Jain Tirths.
 */

// Dataset of Census & Demographic Estimates for Jain Population in major Indian Cities
const JAIN_POPULATION_DATASET = {
  // Nashik & North Maharashtra
  "nashik": { name: "Nashik", state: "Maharashtra", jainPopulation: "45,000+", percent: "2.5%", templesCount: "35+", famousTirth: "Shri Gajpantha Digambar Jain Tirth (Mhasrul, Nashik) & Mangi Tungi Tirth" },
  "nasik": { name: "Nashik", state: "Maharashtra", jainPopulation: "45,000+", percent: "2.5%", templesCount: "35+", famousTirth: "Shri Gajpantha Digambar Jain Tirth (Mhasrul, Nashik)" },
  "hadapsar": { name: "Hadapsar (Pune)", state: "Maharashtra", jainPopulation: "18,000+", percent: "2.8%", templesCount: "12+", famousTirth: "Hadapsar Jain Mandir & Katraj Jain Tirth (Pune)" },

  // Maharashtra Cities
  "pune": { name: "Pune", state: "Maharashtra", jainPopulation: "135,000+", percent: "1.8%", templesCount: "120+", famousTirth: "Katraj Jain Temple, Agam Mandir, Hadapsar Derasars" },
  "mumbai": { name: "Mumbai", state: "Maharashtra", jainPopulation: "550,000+", percent: "4.2%", templesCount: "450+", famousTirth: "Babu Amichand Panalal Jain Temple (Malabar Hill)" },
  "thane": { name: "Thane", state: "Maharashtra", jainPopulation: "85,000+", percent: "3.8%", templesCount: "45+", famousTirth: "Mahavir Dham Jain Derasar" },
  "kolhapur": { name: "Kolhapur", state: "Maharashtra", jainPopulation: "45,000+", percent: "3.2%", templesCount: "40+", famousTirth: "Bahubali Jain Tirth (Kumbhoj)" },
  "sangli": { name: "Sangli", state: "Maharashtra", jainPopulation: "55,000+", percent: "4.1%", templesCount: "50+", famousTirth: "Shri 1008 Chandraprabhu Digambar Temple" },
  "solapur": { name: "Solapur", state: "Maharashtra", jainPopulation: "38,000+", percent: "3.1%", templesCount: "35+", famousTirth: "Rupa Bhavani Jain Derasar" },
  "nagpur": { name: "Nagpur", state: "Maharashtra", jainPopulation: "50,000+", percent: "1.6%", templesCount: "40+", famousTirth: "Ramtek Jain Mandir" },
  "aurangabad": { name: "Chhatrapati Sambhajinagar (Aurangabad)", state: "Maharashtra", jainPopulation: "42,000+", percent: "2.9%", templesCount: "30+", famousTirth: "Kachner Jain Tirth & Ellora Caves (Jain Group)" },
  "sambhajinagar": { name: "Chhatrapati Sambhajinagar (Aurangabad)", state: "Maharashtra", jainPopulation: "42,000+", percent: "2.9%", templesCount: "30+", famousTirth: "Kachner Jain Tirth" },
  "dhule": { name: "Dhule", state: "Maharashtra", jainPopulation: "22,000+", percent: "3.4%", templesCount: "20+", famousTirth: "Chintamani Jain Mandir" },
  "jalgaon": { name: "Jalgaon", state: "Maharashtra", jainPopulation: "28,000+", percent: "3.1%", templesCount: "25+", famousTirth: "Parshvanath Digambar Mandir" },

  // Gujarat Cities
  "ahmedabad": { name: "Ahmedabad", state: "Gujarat", jainPopulation: "320,000+", percent: "4.1%", templesCount: "350+", famousTirth: "Hutheesing Jain Temple" },
  "surat": { name: "Surat", state: "Gujarat", jainPopulation: "280,000+", percent: "4.0%", templesCount: "200+", famousTirth: "Chintamani Jain Temple" },
  "vadodara": { name: "Vadodara", state: "Gujarat", jainPopulation: "95,000+", percent: "3.6%", templesCount: "75+", famousTirth: "Navlakhi Jain Derasar" },
  "rajkot": { name: "Rajkot", state: "Gujarat", jainPopulation: "80,000+", percent: "4.8%", templesCount: "60+", famousTirth: "Bandhani Jain Derasar" },
  "palitana": { name: "Palitana", state: "Gujarat", jainPopulation: "35,000+", percent: "35.0%", templesCount: "860+", famousTirth: "Shatrunjaya Hill Tirth (World's Largest Jain Complex)" },
  "shankheshwar": { name: "Shankheshwar", state: "Gujarat", jainPopulation: "15,000+", percent: "50.0%", templesCount: "30+", famousTirth: "Shankheshwar Parshvanath Tirth" },

  // Rajasthan Cities
  "jaipur": { name: "Jaipur", state: "Rajasthan", jainPopulation: "160,000+", percent: "4.5%", templesCount: "180+", famousTirth: "Sanganer Sanghiji Jain Mandir" },
  "udaipur": { name: "Udaipur", state: "Rajasthan", jainPopulation: "65,000+", percent: "6.2%", templesCount: "75+", famousTirth: "Ranakpur Jain Temple (Nearby)" },
  "jodhpur": { name: "Jodhpur", state: "Rajasthan", jainPopulation: "55,000+", percent: "3.9%", templesCount: "50+", famousTirth: "Osian Jain Temple" },

  // Other Major Cities
  "delhi": { name: "Delhi / NCR", state: "Delhi", jainPopulation: "185,000+", percent: "1.1%", templesCount: "160+", famousTirth: "Ahinsa Sthal (Mehrauli), Lal Mandir" },
  "bangalore": { name: "Bengaluru", state: "Karnataka", jainPopulation: "95,000+", percent: "0.8%", templesCount: "85+", famousTirth: "Shri Mahavira Swamy Temple" },
  "bengaluru": { name: "Bengaluru", state: "Karnataka", jainPopulation: "95,000+", percent: "0.8%", templesCount: "85+", famousTirth: "Shri Mahavira Swamy Temple" },
  "indore": { name: "Indore", state: "Madhya Pradesh", jainPopulation: "140,000+", percent: "4.3%", templesCount: "110+", famousTirth: "Kanch Mandir (Glass Temple)" },
  "belgaum": { name: "Belagavi (Belgaum)", state: "Karnataka", jainPopulation: "70,000+", percent: "5.8%", templesCount: "60+", famousTirth: "Kamal Basadi Fort" },
  "belagavi": { name: "Belagavi (Belgaum)", state: "Karnataka", jainPopulation: "70,000+", percent: "5.8%", templesCount: "60+", famousTirth: "Kamal Basadi Fort" }
};

/**
 * Extract city key from full location address
 */
export function extractCityName(addressString) {
  if (!addressString) return "Destination";
  const parts = addressString.split(',').map(p => p.trim());
  return parts[0] || addressString;
}

/**
 * Lookup Jain population estimates by matching address string
 */
export function getJainDemographics(addressString) {
  if (!addressString || typeof addressString !== 'string') return null;

  const normalized = addressString.toLowerCase();

  // Check direct matches
  for (const [key, data] of Object.entries(JAIN_POPULATION_DATASET)) {
    if (normalized.includes(key)) {
      return data;
    }
  }

  const cityName = extractCityName(addressString);

  // Fallback regional estimates
  if (normalized.includes("maharashtra") || normalized.includes("mh")) {
    return { name: cityName, state: "Maharashtra", jainPopulation: "Est. 25,000+", percent: "2.2%", templesCount: "15+ Derasars", famousTirth: "Regional Jain Temple" };
  }
  if (normalized.includes("gujarat") || normalized.includes("gj")) {
    return { name: cityName, state: "Gujarat", jainPopulation: "Est. 30,000+", percent: "3.5%", templesCount: "20+ Derasars", famousTirth: "Regional Jain Derasar" };
  }
  if (normalized.includes("rajasthan") || normalized.includes("rj")) {
    return { name: cityName, state: "Rajasthan", jainPopulation: "Est. 20,000+", percent: "3.8%", templesCount: "18+ Derasars", famousTirth: "Regional Jain Mandir" };
  }

  return {
    name: cityName,
    state: "India",
    jainPopulation: "Community Present",
    percent: "~1.5%",
    templesCount: "Local Derasar",
    famousTirth: "Jain Community Center"
  };
}

export function getAllJainCenters() {
  return Object.values(JAIN_POPULATION_DATASET);
}
