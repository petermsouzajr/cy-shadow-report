import { COLUMNS_AVAILABLE } from '../../../constants.js';
import { generateStateReports } from './reportGenerationHelpers.js';

/**
 * Asynchronously appends state reports to the header payload based on metrics.
 * @param {Array<Array<string>>} headerPayload - The header payload to which the state reports are appended.
 * @param {Array<string>} defaultHeaderMetrics - An array of metric names to generate reports for.
 * @param {Boolean} playwright - A boolean indicating if the test is in playwright format.
 * @throws {Error} Throws error if report generation fails.
 */
export const appendStateReportsToHeader = (
  headerPayload,
  defaultHeaderMetrics,
  playwright
) => {
  if (!Array.isArray(headerPayload)) {
    throw new Error('Invalid headerPayload: Expected an array.');
  }

  if (!Array.isArray(defaultHeaderMetrics)) {
    throw new Error('Invalid defaultHeaderMetrics: Expected an array.');
  }

  if (typeof playwright !== 'boolean') {
    throw new Error('Invalid playwright value: Expected a boolean.');
  }

  const columnsAvailable = COLUMNS_AVAILABLE(playwright);

  try {
    // If headerPayload is empty, initialize it with defaultHeaderMetrics structure
    if (headerPayload.length === 0 && defaultHeaderMetrics.length > 0) {
      // Create a new array with the length of defaultHeaderMetrics and fill it with empty strings
      headerPayload.push(new Array(defaultHeaderMetrics.length).fill(''));
    }

    // Ensure headerPayload has the same length as defaultHeaderMetrics
    while (headerPayload.length < defaultHeaderMetrics.length) {
      // If headerPayload is shorter, add empty sub-arrays to match the length
      headerPayload.push(new Array(headerPayload[0].length).fill(''));
    }

    for (let i = 0; i < defaultHeaderMetrics.length; i++) {
      const newReport = generateStateReports(defaultHeaderMetrics, i);

      if (!Array.isArray(newReport) || !newReport[i]) {
        throw new Error(
          `New report at index ${i} is not defined or not an array.`
        );
      }

      // Ensure the header payload at index i is an array to push to
      if (!Array.isArray(headerPayload[i])) {
        throw new Error(
          `Header payload at index ${i} is undefined or not an array.`
        );
      }

      while (headerPayload[i].length < columnsAvailable.indexOf('state') - 1) {
        // If headerPayload is shorter, add empty sub-arrays to match the length
        headerPayload[i].push('');
      }

      headerPayload[i].push(...newReport[i]); // Append the new report for the metric at index i
    }
  } catch (error) {
    console.error('Error appending state reports to header:', error);
    throw error;
  }
};
