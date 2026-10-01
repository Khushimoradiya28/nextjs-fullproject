/**
 * City Normalizer & Spelling Validator
 * Standardizes city names, handles common phonetic / spelling aliases,
 * and validates city format before storing in the database.
 */

const KNOWN_ALIASES = {
  // Dadra and Nagar Haveli / UT
  "selvas": "Silvassa",
  "silvasa": "Silvassa",
  "silvassa": "Silvassa",
  "silvassa city": "Silvassa",
  "daman": "Daman",
  "diu": "Diu",

  // Gujarat major cities & spelling variations
  "baroda": "Vadodara",
  "vadodra": "Vadodara",
  "ahemdabad": "Ahmedabad",
  "ahmadabad": "Ahmedabad",
  "ahmedabad city": "Ahmedabad",
  "amd": "Ahmedabad",
  "surat city": "Surat",
  "rajkot city": "Rajkot",
  "bhavnagr": "Bhavnagar",
  "bhavnagar city": "Bhavnagar",
  "gandhinagr": "Gandhinagar",
  "gandhi nagar": "Gandhinagar",
  "gandhidham": "Gandhidham",
  "gandhi dham": "Gandhidham",
  "navsaari": "Navsari",
  "morvi": "Morbi",
  "ankleswar": "Ankleshwar",
  "ankleshwr": "Ankleshwar",
  "vaapi": "Vapi",
  "valsad": "Valsad",
  "valsaad": "Valsad",
  "kachchh": "Kutch",
  "kutchh": "Kutch",
  "bhuj": "Bhuj",
  "dwarka": "Devbhoomi Dwarka",
  "devbhumi dwarka": "Devbhoomi Dwarka",
  "devbhoomi dwarka": "Devbhoomi Dwarka",
  "himatnagar": "Himatnagar",
  "himmatnagar": "Himatnagar",
  "mehsana": "Mehsana",
  "mahesana": "Mehsana",
  "surendranagar": "Surendranagar",
  "surendra nagar": "Surendranagar",
  "godhra": "Godhra",
  "dahod": "Dahod",
  "amreli": "Amreli",
  "patan": "Patan",
  "palitana": "Palitana",
  "palanpur": "Palanpur",
  "veraval": "Veraval",
  "somnath": "Somnath",
  "porbandar": "Porbandar",
  "junagadh": "Junagadh",
  "junagadh city": "Junagadh",
  "anand": "Anand",
  "nadiad": "Nadiad",
  "bharuch": "Bharuch",
  "botad": "Botad",

  // Major Indian Metro Aliases
  "bombay": "Mumbai",
  "mumbay": "Mumbai",
  "mumbai": "Mumbai",
  "bangalore": "Bengaluru",
  "banglore": "Bengaluru",
  "bengaluru": "Bengaluru",
  "calcutta": "Kolkata",
  "kolkata": "Kolkata",
  "madras": "Chennai",
  "chennai": "Chennai",
  "poona": "Pune",
  "pune": "Pune",
  "delhi": "Delhi",
  "new delhi": "New Delhi",
  "noida": "Noida",
  "gurgaon": "Gurugram",
  "gurugram": "Gurugram",
  "hyderabad": "Hyderabad",
  "jaipur": "Jaipur",
  "indore": "Indore",
};

/**
 * Validate city string
 * @param {string} city 
 * @returns {{ valid: boolean, message?: string }}
 */
function validateCity(city) {
  if (!city || typeof city !== "string") {
    return { valid: false, message: "City name is required" };
  }

  const cleaned = city.trim();
  if (cleaned.length < 2) {
    return { valid: false, message: "City name must be at least 2 characters" };
  }

  if (cleaned.length > 50) {
    return { valid: false, message: "City name cannot exceed 50 characters" };
  }

  // Letters, spaces, hyphens, dots only
  const validPattern = /^[a-zA-Z\s.-]+$/;
  if (!validPattern.test(cleaned)) {
    return { valid: false, message: "City name can only contain letters, spaces, and hyphens" };
  }

  // Must contain at least 2 alphabetical letters
  const letterCount = (cleaned.match(/[a-zA-Z]/g) || []).length;
  if (letterCount < 2) {
    return { valid: false, message: "Please enter a valid city name" };
  }

  // Disallow 4+ consecutive identical characters (e.g. "aaaaa")
  if (/(.)\1{3,}/i.test(cleaned)) {
    return { valid: false, message: "Invalid repetitive city name" };
  }

  return { valid: true };
}

/**
 * Normalize and auto-correct city spelling
 * @param {string} city 
 * @returns {string} Standardized Title Case city name
 */
function normalizeCity(city) {
  if (!city || typeof city !== "string") return "";

  const trimmed = city.trim().replace(/\s+/g, " ");
  const lookupKey = trimmed.toLowerCase();

  // Check alias dictionary for known variations/corrections
  if (KNOWN_ALIASES[lookupKey]) {
    return KNOWN_ALIASES[lookupKey];
  }

  // Fallback: Convert to clean Title Case
  return trimmed
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
}

module.exports = {
  validateCity,
  normalizeCity,
  KNOWN_ALIASES,
};
