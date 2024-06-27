/**
 * Truncates a string or number to the specified maximum length.
 * @param {string|number|null|undefined} str - The string, number, or nullish value to be truncated.
 * @param {number} maxLength - The maximum length to enforce.
 * @returns {string} - The truncated string or an empty string if the input is nullish or invalid.
 * @throws {Error} - If maxLength is not a positive integer.
 */
export const enforceMaxLength = (str, maxLength) => {
  if (!Number.isInteger(maxLength) || maxLength < 0) {
    throw new Error('maxLength must be a positive integer');
  }

  if (str == null) {
    return '';
  }

  try {
    // Convert the input to a string if it's a number
    const result =
      typeof str === 'number' || typeof str === 'string' ? String(str) : '';
    // Return the truncated string
    return result.substring(0, maxLength);
  } catch (error) {
    console.error('Error in enforceMaxLength:', error);
    return '';
  }
};
