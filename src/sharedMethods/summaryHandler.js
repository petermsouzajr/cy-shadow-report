import {
  getExistingTabTitlesInRange,
  getTabIdFromTitle,
} from '../google/sheetDataMethods/getSheetInfo.js';
import { auth, sheets, spreadsheetId } from '../google/auth.js';
import { addColumnsAndRowsToTabId } from '../google/sheetDataMethods/processSheetData.js';
import { createSummaryTitle } from '../google/sheetDataMethods/createTabNames.js';
import { constructPayloadForCopyPaste } from '../monthlySummaryMethods/buildSummary.js';
import { getLastMonthTabTitles } from '../google/sheetDataMethods/getLastMonthTabTitles.js';
import { createNewTab } from '../google/googleSheetIntegration/createNewTab.js';
import { HEADER_INDICATORS } from '../../constants.js';
import { getCurrentTime, getFormattedMonth } from './dateFormatting.js';
import { isSummaryRequired } from './summaryRequired.js';
import chalk from 'chalk';

/**
 * Send the summary data (payload) to a specified destination sheet tab.
 *
 * @param {Object} payload - The data to be written to the destination sheet.
 * @returns {Promise<void>}
 */
const sendSummaryBody = async (payload) => {
  try {
    await sheets.spreadsheets.batchUpdate({
      auth,
      spreadsheetId,
      resource: {
        requests: [payload],
      },
    });
  } catch (error) {
    console.error(`Error writing to project: ${spreadsheetId}`, error);
    throw new Error('Failed to send summary body.');
  }
};

/**
 * Add required number of columns and rows to the specified sheet tab.
 *
 * @param {string[]} lastMonthSheetTitles - Titles from last month's sheet to calculate the number of columns.
 * @param {string[]} headerIndicators - Headers to calculate the number of columns.
 * @param {Object[]} payload - Data objects containing information about where data should be pasted in the sheet.
 * @param {string} destinationTabTitle - The title of the destination tab in the sheet.
 * @returns {Promise<void>}
 */
const addColumnsAndRows = async (
  lastMonthSheetTitles,
  headerIndicators,
  payload,
  destinationTabTitle
) => {
  try {
    const numberOfColumnsNeeded =
      lastMonthSheetTitles.length * headerIndicators.length;
    const numberOfRowsNeeded = Math.max(
      ...payload.map((item) => item.copyPaste.destination.endRowIndex)
    );

    const destinationTabId = await getTabIdFromTitle(destinationTabTitle);
    await addColumnsAndRowsToTabId(
      destinationTabId,
      numberOfColumnsNeeded,
      numberOfRowsNeeded
    );
  } catch (error) {
    console.error('Error in adding columns and rows:', error);
    throw new Error('Unable to add columns and rows to the sheet.');
  }
};

/**
 * Send headers to a Google Sheets spreadsheet using Google Sheets API.
 *
 * @param {Array<Object>} payload - An array of objects containing data for batch updating values in the sheet.
 * @returns {Promise<void>}
 */
const sendSummaryHeaders = async (payload) => {
  try {
    await sheets.spreadsheets.values.batchUpdate({
      auth,
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: payload,
      },
    });
  } catch (error) {
    console.error('An error occurred while sending summary headers:', error);
    throw new Error('Failed to send summary headers.');
  }
};

/**
 * Apply styling to the header of a Google Sheets spreadsheet using a batch update request.
 *
 * @param {Object} payload - The request payload, specifically containing mergeCells request for defining the range and type of cells to be merged.
 * @returns {Promise<void>}
 */
const summaryHeaderStyling = async (payload) => {
  try {
    await sheets.spreadsheets.batchUpdate({
      auth,
      spreadsheetId,
      requestBody: {
        requests: [payload],
      },
    });
  } catch (error) {
    console.error('An error occurred while applying header styling:', error);
    throw new Error('Failed to apply summary header styling.');
  }
};

/**
 * Handles the creation and population of a monthly summary report.
 *
 * @param {Object} options - Configuration options for generating reports.
 * @param {boolean} options.csv - If true, outputs in CSV format.
 * @param {boolean} options.duplicate - If true, allows creating a duplicate report for the day.
 * @param {boolean} options.cypress - If true, parses test result JSON in cypress format.
 * @param {boolean} options.playwright - If true, parses test result JSON in playwright format.
 */
export const handleSummary = async ({
  csv,
  duplicate,
  cypress,
  playwright,
}) => {
  try {
    const summaryRequired = await isSummaryRequired({ csv });

    const lastMonth = getFormattedMonth('lastMonth');
    const noSummaryMessage = chalk.yellow(
      `No ${lastMonth} summary required. If you would like to create a duplicate, use the Monthly Summary command directly, with the optional flag ${chalk.green('--duplicate')}, e.g. ${chalk.green('qa-shadow-report monthly-summary --duplicate')}.`
    );

    if (csv) {
      console.warn(
        chalk.yellow('CSV format is not supported for summary reports')
      );
      return;
    }

    if (!summaryRequired && !duplicate) {
      console.info(noSummaryMessage);
      return;
    }

    const existingSheetTitles = await getExistingTabTitlesInRange();
    const lastMonthSheetTitles =
      await getLastMonthTabTitles(existingSheetTitles);
    const summaryTitle = createSummaryTitle();
    const currentTime = getCurrentTime();

    const summaryPageTitle = duplicate
      ? `${summaryTitle}_${currentTime}`
      : summaryTitle;

    await createNewTab(summaryPageTitle);
    const fullSummaryPayload = await constructPayloadForCopyPaste(
      lastMonthSheetTitles,
      summaryPageTitle
    );

    await addColumnsAndRows(
      lastMonthSheetTitles,
      HEADER_INDICATORS,
      fullSummaryPayload.bodyPayload,
      summaryPageTitle
    );
    await sendSummaryHeaders(fullSummaryPayload.headerPayload);
    await sendSummaryBody(fullSummaryPayload.bodyPayload);
    await summaryHeaderStyling(fullSummaryPayload.summaryHeaderStylePayload);
  } catch (error) {
    console.error('An error occurred in handleSummary:', error);
    throw new Error('Failed to handle summary.');
  }
};
