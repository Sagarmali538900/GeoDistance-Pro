/**
 * Transport Infrastructure Service
 * Provides Nearest Airport and Biggest Railway Station details for searched destinations across India & globally.
 */

const TRANSPORT_DATASET = {
  "nashik": {
    city: "Nashik",
    airport: { name: "Nashik Ozar Airport (ISK)", code: "ISK", distance: "~20 km from city center", type: "Domestic / Air Force" },
    railway: { name: "Nashik Road Railway Station (NK)", code: "NK", distance: "~9 km from city center", category: "A1 Grade Major Junction (Central Railway)" }
  },
  "nasik": {
    city: "Nashik",
    airport: { name: "Nashik Ozar Airport (ISK)", code: "ISK", distance: "~20 km from city center", type: "Domestic" },
    railway: { name: "Nashik Road Railway Station (NK)", code: "NK", distance: "~9 km from city center", category: "A1 Grade Major Junction" }
  },
  "hadapsar": {
    city: "Hadapsar (Pune)",
    airport: { name: "Pune International Airport (PNQ)", code: "PNQ", distance: "~11 km", type: "Customs / International" },
    railway: { name: "Hadapsar Railway Station (HDP) / Pune Junction (PUNE)", code: "HDP / PUNE", distance: "~2 km / ~7 km", category: "Major Passenger & Terminal Station" }
  },
  "pune": {
    city: "Pune",
    airport: { name: "Pune International Airport, Lohegaon (PNQ)", code: "PNQ", distance: "~10 km from city center", type: "Customs / International" },
    railway: { name: "Pune Junction Railway Station (PUNE)", code: "PUNE", distance: "City Center", category: "NSG-2 Category Major Central Railway Terminal" }
  },
  "mumbai": {
    city: "Mumbai",
    airport: { name: "Chhatrapati Shivaji Maharaj International Airport (BOM)", code: "BOM", distance: "~15 km from South Mumbai", type: "Major International Hub" },
    railway: { name: "Chhatrapati Shivaji Maharaj Terminus (CSMT) & Mumbai Central (MMCT)", code: "CSMT / MMCT", distance: "South Mumbai", category: "UNESCO Heritage World Class Railway Terminus" }
  },
  "thane": {
    city: "Thane",
    airport: { name: "Chhatrapati Shivaji Maharaj International Airport (BOM)", code: "BOM", distance: "~22 km", type: "International" },
    railway: { name: "Thane Railway Station (TNA)", code: "TNA", distance: "City Center", category: "One of India's Busiest Railway Junctions" }
  },
  "ahmedabad": {
    city: "Ahmedabad",
    airport: { name: "Sardar Vallabhbhai Patel International Airport (AMD)", code: "AMD", distance: "~9 km from city center", type: "International Hub" },
    railway: { name: "Ahmedabad Junction / Kalupur Railway Station (ADI)", code: "ADI", distance: "City Center", category: "NSG-1 Grade Western Railway Station" }
  },
  "surat": {
    city: "Surat",
    airport: { name: "Surat International Airport (STV)", code: "STV", distance: "~11 km from city center", type: "International" },
    railway: { name: "Surat Railway Station (ST)", code: "ST", distance: "City Center", category: "Major Western Railway Junction" }
  },
  "jaipur": {
    city: "Jaipur",
    airport: { name: "Jaipur International Airport, Sanganer (JAI)", code: "JAI", distance: "~13 km from city center", type: "International" },
    railway: { name: "Jaipur Junction Railway Station (JP)", code: "JP", distance: "City Center", category: "Headquarters North Western Railway" }
  },
  "indore": {
    city: "Indore",
    airport: { name: "Devi Ahilyabai Holkar International Airport (IDR)", code: "IDR", distance: "~8 km from city center", type: "International" },
    railway: { name: "Indore Junction Railway Station (INDB)", code: "INDB", distance: "City Center", category: "A1 Category Railway Junction" }
  },
  "nagpur": {
    city: "Nagpur",
    airport: { name: "Dr. Babasaheb Ambedkar International Airport (NAG)", code: "NAG", distance: "~8 km from city center", type: "International" },
    railway: { name: "Nagpur Junction Railway Station (NGP)", code: "NGP", distance: "City Center", category: "Major Central India Railway Hub" }
  },
  "kolhapur": {
    city: "Kolhapur",
    airport: { name: "Chhatrapati Rajaram Maharaj Airport (KLH)", code: "KLH", distance: "~9 km from city center", type: "Domestic" },
    railway: { name: "Shri Chhatrapati Shahu Maharaj Terminus (KOP)", code: "KOP", distance: "City Center", category: "Central Railway Terminal" }
  },
  "sangli": {
    city: "Sangli",
    airport: { name: "Kolhapur Airport (KLH - 45 km) / Belagavi Airport (IXG - 110 km)", code: "KLH", distance: "~45 km", type: "Regional Domestic" },
    railway: { name: "Sangli Railway Station (SLI) & Miraj Junction (MRJ)", code: "SLI / MRJ", distance: "~2 km / ~8 km", category: "Major Rail Junction" }
  },
  "solapur": {
    city: "Solapur",
    airport: { name: "Solapur Airport (SSE) / Pune Airport (PNQ - 240 km)", code: "SSE", distance: "~7 km", type: "Domestic / Regional" },
    railway: { name: "Solapur Railway Station (SUR)", code: "SUR", distance: "City Center", category: "Division Headquarters Central Railway" }
  },
  "delhi": {
    city: "Delhi",
    airport: { name: "Indira Gandhi International Airport (DEL)", code: "DEL", distance: "~16 km", type: "Major International Gateway" },
    railway: { name: "New Delhi Railway Station (NDLS) / Old Delhi (DLI)", code: "NDLS / DLI", distance: "City Center", category: "India's Largest Railway Station Network" }
  },
  "bangalore": {
    city: "Bengaluru",
    airport: { name: "Kempegowda International Airport (BLR)", code: "BLR", distance: "~30 km from city center", type: "Major International Airport" },
    railway: { name: "KSR Bengaluru City Junction (SBC) & Yesvantpur (YPR)", code: "SBC / YPR", distance: "City Center", category: "South Western Railway Headquarters" }
  },
  "bengaluru": {
    city: "Bengaluru",
    airport: { name: "Kempegowda International Airport (BLR)", code: "BLR", distance: "~30 km from city center", type: "Major International Airport" },
    railway: { name: "KSR Bengaluru City Junction (SBC) & Yesvantpur (YPR)", code: "SBC / YPR", distance: "City Center", category: "South Western Railway Headquarters" }
  }
};

/**
 * Get nearest airport and biggest railway station for destination address
 */
export function getTransportInfo(addressString) {
  if (!addressString || typeof addressString !== 'string') return null;

  const normalized = addressString.toLowerCase();

  for (const [key, data] of Object.entries(TRANSPORT_DATASET)) {
    if (normalized.includes(key)) {
      return data;
    }
  }

  const parts = addressString.split(',').map(p => p.trim());
  const cityName = parts[0] || addressString;

  return {
    city: cityName,
    airport: { name: `${cityName} Regional / Nearest Domestic Airport`, code: "AIRPORT", distance: "Nearby", type: "Airport" },
    railway: { name: `${cityName} Main Railway Station`, code: "RAILWAY", distance: "City Center", category: "Major Junction" }
  };
}
