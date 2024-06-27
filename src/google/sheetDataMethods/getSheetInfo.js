import {
  getFormattedMonth,
  getPreviousMonthsYear,
  getTodaysFormattedDate,
} from '../../sharedMethods/dateFormatting.js';
import { getTopLevelSpreadsheetData } from '../googleSheetIntegration/getSheetData.js';
import { dataObjects } from '../../index.js';
import { createSummaryTitle } from './createTabNames.js';
import { FOOTER_ROW, HEADER_INDICATORS } from '../../../constants.js';

/**
 * Find a sheet data object in the array that matches a specific title.
 * @param {Array} sheetValuesArray - Array of sheet data objects.
 * @param {string} sheetTitle - The title of the sheet to find.
 * @returns {Object|undefined} The sheet data object or undefined if not found.
 * @throws {TypeError} - If the input types are invalid.
 */
export const findTabTitleDataInArray = (sheetValuesArray, sheetTitle) => {
  if (!Array.isArray(sheetValuesArray)) {
    throw new TypeError('Invalid sheetValuesArray: Expected an array.');
  }
  if (typeof sheetTitle !== 'string') {
    throw new TypeError('Invalid sheetTitle: Expected a string.');
  }

  return sheetValuesArray.find((sheet) => {
    if (typeof sheet.config.url !== 'string') {
      throw new TypeError('Invalid sheet config: Expected url to be a string.');
    }
    const url = decodeURIComponent(sheet.config.url);
    return url.includes(`/${sheetTitle}`);
  });
};

/**
 * Fetches existing tab titles in range based on the given criteria.
 * @param {string} when - Time frame filter criteria.
 * @returns {Promise<Array>} An array of titles that match the given criteria.
 * @throws {Error} If fetching or processing data fails.
 */
export const getExistingTabTitlesInRange = async (when = '') => {
  if (typeof when !== 'string') {
    throw new TypeError('Invalid input: "when" must be a string.');
  }

  const currentMonth = getFormattedMonth();
  const lastMonth = getFormattedMonth('lastMonth').toLowerCase();
  const previousMonthYear = getPreviousMonthsYear(currentMonth);

  try {
    const metaData =
      Object.keys(dataObjects.topLevelSpreadsheetData).length === 0
        ? await getTopLevelSpreadsheetData()
        : dataObjects.topLevelSpreadsheetData;

    if (!metaData || !metaData.data || !Array.isArray(metaData.data.sheets)) {
      throw new Error('Invalid spreadsheet metadata format.');
    }

    const titles = metaData.data.sheets.map((sheet) => sheet.properties.title);

    if (!Array.isArray(titles)) {
      throw new Error('Invalid titles format: Expected an array of strings.');
    }

    return when !== 'lastMonth'
      ? titles
      : titles.filter(
          (title) =>
            title.toLowerCase().includes(lastMonth) &&
            title.includes(previousMonthYear) &&
            /^([A-Z][a-z]{2} \d{1,2}, \d{4})$/.test(title)
        );
  } catch (error) {
    console.error('Error fetching sheet titles in range:', error);
    throw new Error('Unable to fetch sheet titles in range.');
  }
};

/**
 * Gets the ID of the tab by its title.
 * @param {string} tabTitle - The title of the tab.
 * @returns {Promise<number|null>} The ID of the tab or null if not found.
 * @throws {Error} If fetching or processing data fails.
 */
export const getTabIdFromTitle = async (tabTitle) => {
  if (typeof tabTitle !== 'string' || tabTitle.trim() === '') {
    throw new Error('Invalid tabTitle: Expected a non-empty string.');
  }

  let sheetList;
  if (tabTitle.includes(createSummaryTitle())) {
    sheetList = dataObjects.summaryTabData;
  } else if (tabTitle.includes(getTodaysFormattedDate())) {
    sheetList = dataObjects.todaysReportData;
  } else {
    sheetList = dataObjects.topLevelSpreadsheetData;
  }

  if (!sheetList || Object.keys(sheetList).length === 0) {
    console.error('Sheet list data is not available');
    return null;
  }

  try {
    if (
      tabTitle.includes(createSummaryTitle()) ||
      tabTitle.includes(getTodaysFormattedDate())
    ) {
      return sheetList.data.replies[0].addSheet.properties.sheetId;
    }

    const sheet = sheetList.data.sheets.find(
      (sheet) => sheet.properties.title === tabTitle
    );
    return sheet ? sheet.properties.sheetId : null;
  } catch (error) {
    console.error('Error fetching tab ID from title:', error);
    throw new Error('Unable to fetch tab ID from title.');
  }
};

/**
 * Finds the index of the column whose header matches any of the default metrics.
 * @param {string} sheetId - The ID of the sheet/tab to look into.
 * @param {Array<string>} defaultHeaderMetrics - An array of metric names to match against.
 * @returns {Promise<number|null>} The index of the matching column or null if no match is found.
 * @throws {Error} If fetching or processing data fails.
 */
export const findMatchingColumnByTabId = async (
  sheetId,
  defaultHeaderMetrics
) => {
  if (typeof sheetId !== 'string' || sheetId.trim() === '') {
    throw new Error('Invalid sheetId: Expected a non-empty string.');
  }

  if (
    !Array.isArray(defaultHeaderMetrics) ||
    defaultHeaderMetrics.length === 0
  ) {
    throw new Error(
      'Invalid defaultHeaderMetrics: Expected a non-empty array.'
    );
  }

  try {
    const metaData = dataObjects.lastMonthSheetValues[0].find((item) =>
      item.data.range.startsWith(`'${sheetId}'`)
    );

    if (!metaData || !metaData.data.values || !metaData.data.values[0]) {
      throw new Error(
        `Sheet data not found or invalid for sheetId: ${sheetId}`
      );
    }

    const headers = metaData.data.values[0];

    const matchingIndex = headers.findIndex((header) =>
      defaultHeaderMetrics.some((metric) => header.trim().includes(metric))
    );

    return matchingIndex !== -1 ? matchingIndex : null;
  } catch (error) {
    console.error('Error finding matching column by tab ID:', error);
    throw new Error('Unable to find matching column by tab ID.');
  }
};

/**
 * Retrieves header and footer data of a tab by its title.
 * @param {string} sheetTitle - The title of the tab.
 * @returns {Promise<Object|null>} An object containing header row, footer row, and header values, or null if not found.
 * @throws {Error} Throws an error if data retrieval fails.
 */
export const getHeaderAndFooterDataByTabTitle = async (sheetTitle) => {
  if (typeof sheetTitle !== 'string' || sheetTitle.trim() === '') {
    throw new Error('Invalid sheetTitle: Expected a non-empty string.');
  }

  try {
    let headerRow = 0;
    let footerRow = 0;
    let headerValues = [];

    // Find the right sheet data
    const metaData = dataObjects.lastMonthSheetValues[0].find((item) =>
      item.data.range.startsWith(`'${sheetTitle}'`)
    );

    if (!metaData) {
      console.error(`No data found for sheet title: ${sheetTitle}`);
      return null;
    }

    const rows = metaData.data.values;

    rows.forEach((row, index) => {
      if (row.includes(FOOTER_ROW)) footerRow = index + 1; // Assuming FOOTER_ROW marks the end row
      if (HEADER_INDICATORS.every((indicator) => row.includes(indicator))) {
        headerRow = index + 1;
        headerValues = row;
      }
    });

    return { headerRow, footerRow, headerValues };
  } catch (error) {
    console.error('Error retrieving header and footer data:', error);
    throw new Error('Unable to retrieve header and footer data.');
  }
};
