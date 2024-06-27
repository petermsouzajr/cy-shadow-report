// Utility functions imports
import { formatDuration } from '../sharedMethods/dateFormatting.js';

// Data extraction and reporting imports
import * as dataExtraction from './extraction/dataExtractionUtilities.js';

// Shared methods imports
import { enforceMaxLength } from './utilities/cellMaxLength.js';

// Configuration and constants imports
import * as constants from '../../constants.js';

/**
 * Constructs a single report payload entry based on the test result and details.
 * @param {Object} result - The test result data.
 * @param {Object} test - The detailed test information.
 * @param {Boolean} playwright - A boolean indicating if the test is in playwright format.
 * @returns {Promise<Object>} A promise that resolves to the constructed payload entry.
 */
export const constructReportPayloadEntry = async (result, test, playwright) => {
  const typesAvailable = constants.TEST_TYPES_AVAILABLE();
  const categoriesAvailable = constants.TEST_CATEGORIES_AVAILABLE();
  const allTeamNames = constants.ALL_TEAM_NAMES();
  try {
    const area = playwright
      ? test.projectName
      : await dataExtraction.extractAreaFromFullFile(
          result.fullFile,
          typesAvailable
        );

    const spec = await dataExtraction.extractSpecFromFullFile(result.fullFile);
    const type = await dataExtraction.extractTypeFromFullFile(
      result.fullFile,
      typesAvailable
    );
    const speed = await formatDuration(test.duration);
    const manualTestId =
      await dataExtraction.extractManualTestCaseIdFromTest(test);
    const teamName = await dataExtraction.extractTeamNameFromTest(
      test,
      allTeamNames
    );
    const category = await dataExtraction.extractCategoryFromTest(
      test,
      categoriesAvailable
    );
    const testName = await dataExtraction.extractTestNameFromFullTitle(
      test.fullTitle
    );

    const errorMessage = playwright ? test.err : test.err?.message;

    let payloadEntry = {
      area,
      spec,
      testName,
      type,
      category,
      team: teamName,
      priority: '',
      status: '',
      state: test.state,
      manualTestId,
      error: errorMessage,
      speed,
    };
    // Enforce a maximum length for each cell in the payload entry
    Object.keys(payloadEntry).forEach((key) => {
      payloadEntry[key] = enforceMaxLength(payloadEntry[key], 500);
    });

    return payloadEntry;
  } catch (error) {
    console.error('Error constructing report payload entry:', error);
    throw error;
  }
};
