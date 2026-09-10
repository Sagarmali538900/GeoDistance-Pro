/**
 * Jain Population & Demographic Insights Service
 * Provides estimated Jain population data by city, district, and state across India and globally,
 * along with major Jain Tirth / pilgrimage sites.
 */

// Dataset of Census & Demographic Estimates for Jain Population in major Indian Cities & States
const JAIN_POPULATION_DATASET = {
  // Cities
  "mumbai": { name: "Mumbai", state: "Maharashtra", jainPopulation: "550,000+", percent: "4.2%", templesCount: "450+", famousTirth: "Babu Amichand Panalal Jain Temple (Malabar Hill)" },
  "pune": { name: "Pune", state: "Maharashtra", jainPopulation: "135,000+", percent: "1.8%", templesCount: "120+", famousTirth: "Katraj Jain Temple, Agam Mandir" },
  "ahmedabad": { name: "Ahmedabad", state: "Gujarat", jainPopulation: "320,000+", percent: "4.1%", templesCount: "350+", famousTirth: "Hutheesing Jain Temple" },
  "surat": { name: "Surat", state: "Gujarat", jainPopulation: "280,000+", percent: "4.0%", templesCount: "200+", famousTirth: "Chintamani Jain Temple" },
  "delhi": { name: "Delhi / NCR", state: "Delhi", jainPopulation: "185,000+", percent: "1.1%", templesCount: "160+", famousTirth: "Ahinsa Sthal (Mehrauli), Lal Mandir (Chandni Chowk)" },
  "jaipur": { name: "Jaipur", state: "Rajasthan", jainPopulation: "160,000+", percent: "4.5%", templesCount: "180+", famousTirth: "Sanganer Jain Temple, Sanghiji Mandir" },
  "bangalore": { name: "Bengaluru", state: "Karnataka", jainPopulation: "95,000+", percent: "0.8%", templesCount: "85+", famousTirth: "Shri Mahavira Swamy Jain Temple" },
  "bengaluru": { name: "Bengaluru", state: "Karnataka", jainPopulation: "95,000+", percent: "0.8%", templesCount: "85+", famousTirth: "Shri Mahavira Swamy Jain Temple" },
  "kolhapur": { name: "Kolhapur", state: "Maharashtra", jainPopulation: "45,000+", percent: "3.2%", templesCount: "40+", famousTirth: "Bahubali Jain Tirth (Kumbhoj)" },
  "sangli": { name: "Sangli", state: "Maharashtra", jainPopulation: "55,000+", percent: "4.1%", templesCount: "50+", famousTirth: "Shri 1008 Chandraprabhu Digambar Temple" },
  "indore": { name: "Indore", state: "Madhya Pradesh", jainPopulation: "140,000+", percent: "4.3%", templesCount: "110+", famousTirth: "Kanch Mandir (Glass Temple)" },
  "udaipur": { name: "Udaipur", state: "Rajasthan", jainPopulation: "65,000+", percent: "6.2%", templesCount: "75+", famousTirth: "Ranakpur Jain Temple (Nearby), Jagdish Area Derasars" },
  "belgaum": { name: "Belagavi (Belgaum)", state: "Karnataka", jainPopulation: "70,000+", percent: "5.8%", templesCount: "60+", famousTirth: "Kamal Basadi (Belgaum Fort)" },
  "belagavi": { name: "Belagavi (Belgaum)", state: "Karnataka", jainPopulation: "70,000+", percent: "5.8%", templesCount: "60+", famousTirth: "Kamal Basadi (Belgaum Fort)" },
  "palitana": { name: "Palitana", state: "Gujarat", jainPopulation: "35,000+", percent: "35.0%", templesCount: "860+", famousTirth: "Shatrunjaya Hill Tirth (World's Largest Jain Temple Complex)" },
  "shravanabelagola": { name: "Shravanabelagola", state: "Karnataka", jainPopulation: "12,000+", percent: "45.0%", templesCount: "25+", famousTirth: "Lord Gommateshwara Bahubali Monolith Statue" },
  "shikharji": { name: "Sammed Shikharji", state: "Jharkhand", jainPopulation: "N/A", percent: "Sacred", templesCount: "31 Tonks", famousTirth: "Parasnath Hill (20 Tirthankaras Moksha Bhumi)" },
  "chennai": { name: "Chennai", state: "Tamil Nadu", jainPopulation: "50,000+", percent: "0.6%", templesCount: "45+", famousTirth: "Sowcarpet Jain Temples" },
  "kolkata": { name: "Kolkata", state: "West Bengal", jainPopulation: "75,000+", percent: "0.5%", templesCount: "55+", famousTirth: "Pareshnath Jain Temple (Badridas)" },
  "nagpur": { name: "Nagpur", state: "Maharashtra", jainPopulation: "50,000+", percent: "1.6%", templesCount: "40+", famousTirth: "Ramtek Jain Mandir" },
  "solapur": { name: "Solapur", state: "Maharashtra", jainPopulation: "38,000+", percent: "3.1%", templesCount: "35+", famousTirth: "Rupa Bhavani Jain Derasar" },

  // States
  "maharashtra": { name: "Maharashtra State", jainPopulation: "1,400,000+", percent: "1.25%", famousTirth: "Gajpantha, Ellora Jain Caves, Stavanidhi, Bahubali" },
  "rajasthan": { name: "Rajasthan State", jainPopulation: "620,000+", percent: "0.91%", famousTirth: "Dilwara (Abu), Ranakpur, Nakoda, Mahavirji, Sanganer" },
  "gujarat": { name: "Gujarat State", jainPopulation: "580,000+", percent: "0.96%", famousTirth: "Palitana (Shatrunjaya), Girnar, Shankheshwar, Taranga" },
  "karnataka": { name: "Karnataka State", jainPopulation: "440,000+", percent: "0.72%", famousTirth: "Shravanabelagola, Moodabidri (1000 Pillars), Karkala, Dharmastala" },
  "madhya pradesh": { name: "Madhya Pradesh State", jainPopulation: "560,000+", percent: "0.77%", famousTirth: "Sonagiri, Muktagiri, Kundalpur, Bawangaja" }
};

/**
 * Lookup Jain population estimates by matching address string
 */
export function getJainDemographics(addressString) {
  if (!addressString || typeof addressString !== 'string') return null;

  const normalized = addressString.toLowerCase();

  // Check city matches
  for (const [key, data] of Object.entries(JAIN_POPULATION_DATASET)) {
    if (normalized.includes(key)) {
      return data;
    }
  }

  // Fallback heuristic estimation based on region
  if (normalized.includes("maharashtra") || normalized.includes("mh")) {
    return { name: addressString.split(',')[0], state: "Maharashtra", jainPopulation: "Est. 1.2% - 3.5%", percent: "1.8% avg", templesCount: "Multiple Derasars", famousTirth: "Regional Jain Derasar" };
  }
  if (normalized.includes("gujarat") || normalized.includes("gj")) {
    return { name: addressString.split(',')[0], state: "Gujarat", jainPopulation: "Est. 2.0% - 4.5%", percent: "2.5% avg", templesCount: "Multiple Derasars", famousTirth: "Regional Jain Derasar" };
  }
  if (normalized.includes("rajasthan") || normalized.includes("rj")) {
    return { name: addressString.split(',')[0], state: "Rajasthan", jainPopulation: "Est. 1.5% - 5.0%", percent: "2.2% avg", templesCount: "Multiple Derasars", famousTirth: "Regional Jain Temple" };
  }
  if (normalized.includes("karnataka") || normalized.includes("ka")) {
    return { name: addressString.split(',')[0], state: "Karnataka", jainPopulation: "Est. 0.8% - 4.0%", percent: "1.2% avg", templesCount: "Basadi / Temples", famousTirth: "Digambar Jain Basadi" };
  }

  return {
    name: addressString.split(',')[0],
    state: "India / Global",
    jainPopulation: "Community Present",
    percent: "~1.0%",
    templesCount: "Local Derasar",
    famousTirth: "Jain Community Center"
  };
}

/**
 * Get list of top Jain Population Centers & Sacred Tirths
 */
export function getAllJainCenters() {
  return Object.values(JAIN_POPULATION_DATASET);
}
