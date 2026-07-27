/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

/**
 * Validate required fields
 * @param {object} fields - Object with field names and values
 * @returns {string[]} Array of missing field names
 */
const getMissingFields = (fields) => {
  return Object.entries(fields)
    .filter(([, value]) => !value || (typeof value === 'string' && !value.trim()))
    .map(([key]) => key);
};

module.exports = { isValidEmail, getMissingFields };
