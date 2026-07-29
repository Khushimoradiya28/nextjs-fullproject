/**
 * City alias map for fuzzy/smart city matching.
 * Keys are normalized aliases (lowercase, trimmed).
 * Values are the canonical city name used in the database.
 *
 * If a user searches for any alias, it resolves to the canonical name.
 * If no alias matches, the original input is used as-is (fallback).
 */

const CITY_ALIASES = {
  // Ahmedabad
  ahmedabad: "Ahmedabad",
  ahemdabad: "Ahmedabad",
  ahmadabad: "Ahmedabad",
  amdavad: "Ahmedabad",
  amdvad: "Ahmedabad",
  amadavad: "Ahmedabad",
  amdabad: "Ahmedabad",

  // Vadodara / Baroda
  vadodara: "Vadodara",
  baroda: "baroda",
  // baroda: "Vadodara",
  vadodra: "Vadodara",
  vadodara: "Vadodara",

  // Surat
  surat: "Surat",
  surt: "Surat",
  suart: "Surat",

  // Rajkot
  rajkot: "Rajkot",
  "rajkot city": "Rajkot",
  rajkot: "Rajkot",

  // Bhavnagar
  bhavnagar: "Bhavnagar",
  bhavanagar: "Bhavnagar",
  bhavnager: "Bhavnagar",

  // Gandhinagar
  gandhinagar: "Gandhinagar",
  "gandhinagar city": "Gandhinagar",
  gandhi_nagar: "Gandhinagar",
  gandinagar: "Gandhinagar",

  // Mumbai
  mumbai: "Mumbai",
  bombay: "Mumbai",

  // Delhi
  delhi: "Delhi",
  "new delhi": "Delhi",
  newdelhi: "Delhi",

  // Bengaluru
  bengaluru: "Bengaluru",
  bangalore: "Bengaluru",
  banglore: "Bengaluru",

  // Hyderabad
  hyderabad: "Hyderabad",
  hyd: "Hyderabad",

  // Pune
  pune: "Pune",
  poona: "Pune",

  // Jaipur
  jaipur: "Jaipur",
  jaipur_city: "Jaipur",

  // Chennai
  chennai: "Chennai",
  madras: "Chennai",

  // Kolkata
  kolkata: "Kolkata",
  calcutta: "Kolkata",
};

/**
 * Normalizes a city input to its canonical name.
 * Returns the canonical city name if an alias matches, otherwise returns the original input.
 */
export function normalizeCity(input) {
  if (!input) return "";
  const normalized = input.toLowerCase().trim().replace(/[_\-]+/g, " ");
  return CITY_ALIASES[normalized] || input.trim();
}
