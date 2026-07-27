/**
 * Shared property options used across the entire application.
 * Single source of truth — later replaceable by backend API.
 */

export const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Plot",
  "Office",
  "Shop",
  "Studio",
  "Penthouse",
  "Farmhouse",
  "Other",
];

export const CITIES = [
  "Ahmedabad",
  "Amreli",
  "Anand",
  "Baroda",
  "Bharuch",
  "Bhavnagar",
  "Bhuj",
  "Botad",
  "Devbhoomi Dwarka",
  "Gandhidham",
  "Gandhinagar",
  "Junagadh",
  "Kutch",
  "Mehsana",
  "Morbi",
  "Nadiad",
  "Navsari",
  "Porbandar",
  "Rajkot",
  "Surat",
  "Vadodara",
  "Vapi",
];

export const BHK_OPTIONS = [
  { value: "1", label: "1 BHK" },
  { value: "2", label: "2 BHK" },
  { value: "3", label: "3 BHK" },
  { value: "4", label: "4 BHK" },
  { value: "5", label: "5+ BHK" },
];

export const FURNISHING_OPTIONS = [
  { value: "Unfurnished", label: "Unfurnished" },
  { value: "Semi Furnished", label: "Semi Furnished" },
  { value: "Fully Furnished", label: "Fully Furnished" },
];
