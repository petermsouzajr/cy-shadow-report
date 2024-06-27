import {
  getFormattedMonth,
  getPreviousMonthsYear,
} from '../../sharedMethods/dateFormatting.js';

/**
 * Retrieves sheet titles that match the last month and its corresponding year from existing sheet titles.
 *
 * @param {string[]} existingTabTitles - Array of existing sheet titles.
 * @returns {string[]} - Array of sheet titles that match the criteria.
 * @throws {TypeError} - If the input is not an array or contains non-string elements.
 */
export const getLastMonthTabTitles = (existingTabTitles) => {
  if (!Array.isArray(existingTabTitles)) {
    throw new TypeError('Invalid input: Expected an array of strings.');
  }

  existingTabTitles.forEach((title, index) => {
    if (typeof title !== 'string') {
      throw new TypeError(
        `Invalid element at index ${index}: Expected a string.`
      );
    }
  });

  const lastMonth = getFormattedMonth('lastMonth');
  const currentMonth = getFormattedMonth();
  const lastMonthsYear = getPreviousMonthsYear(currentMonth);

  return existingTabTitles.filter(
    (existingTabTitle) =>
      existingTabTitle.toLowerCase().includes(lastMonth.toLowerCase()) &&
      existingTabTitle.includes(lastMonthsYear) &&
      /^([A-Z][a-z]{2} \d{1,2}, \d{4})$/.test(existingTabTitle)
  );
};
