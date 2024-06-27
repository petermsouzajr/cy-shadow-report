import {
  TEST_TYPES_AVAILABLE,
  TEST_CATEGORIES_AVAILABLE,
  ALL_TEAM_NAMES,
} from '../../../constants.js';
import { combineReports } from './combineReports.js';
import {
  generateReport,
  generatePlaceholders,
} from './reportGenerationHelpers.js';

/**
 * Asynchronously constructs a header report from the given payload.
 * @param {Array<Array<string>>} payload - The payload data to construct the report from.
 * @returns {Promise<Array<Array<string>>>} A promise that resolves with the constructed report as a 2D string array.
 * @throws {Error} Throws an error if report generation fails.
 */
export const constructHeaderReport = async (payload) => {
  if (!Array.isArray(payload)) {
    throw new Error('Invalid payload: Expected an array.');
  }

  const typesAvailable = TEST_TYPES_AVAILABLE();
  const categoriesAvailable = TEST_CATEGORIES_AVAILABLE();
  const teamNames = ALL_TEAM_NAMES();

  try {
    // Define the structure for the types to be reported
    const typeArrays = [
      { types: typesAvailable, index: 3 },
      { types: categoriesAvailable, index: 4 },
      { types: teamNames, index: 5 },
    ];

    // Initialize an array to store all report entries
    const allReportEntries = [];

    // Loop through each type structure to generate report entries
    for (const typeData of typeArrays) {
      if (!Array.isArray(typeData.types)) {
        throw new Error(
          `Invalid types: Expected an array at index ${typeData.index}.`
        );
      }
      const reportEntry = await generateReport(
        typeData.types,
        payload,
        typeData.index,
        typeData.index === 5 // Some additional condition based on index
      );
      allReportEntries.push(reportEntry);
    }

    // Calculate the maximum number of types across all categories
    const maxTypes = Math.max(...typeArrays.map((t) => t.types.length));

    // Generate placeholders for the report
    const placeholders = generatePlaceholders(maxTypes);

    // Combine all report entries and placeholders into one report
    return combineReports(allReportEntries, placeholders);
  } catch (error) {
    console.error('Error constructing header report:', error);
    throw new Error('Failed to construct header report');
  }
};
