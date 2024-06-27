import { getTabValuesByTitle } from '../google/googleSheetIntegration/getSheetData.js';
import { copyPasteNormal } from '../google/sheetDataMethods/copyPaste.js';
import {
  findMatchingColumnByTabId,
  findTabTitleDataInArray,
  getHeaderAndFooterDataByTabTitle,
  getTabIdFromTitle,
} from '../google/sheetDataMethods/getSheetInfo.js';
import { dataObjects } from '../index.js';
import { numberToLetter } from '../sharedMethods/dataHandler.js';
import { solidBlackWidthOne, solidBlackWidthTwo } from './summaryStyles.js';
import { DEFAULT_HEADER_METRICS, HEADER_INDICATORS } from '../../constants.js';

/**
 * Asynchronously fetches values for given tab titles from the previous month.
 *
 * @param {string[]} titles - An array of tab titles to fetch values for.
 * @returns {Promise<object[]>} - A promise that resolves to an array of tab values corresponding to the provided titles.
 */
export const fetchLastMonthTabValues = async (titles) => {
  // Define the additional arguments that getTabValuesByTitle expects
  const sheetsInstance = '';
  const authParam = '';
  const spreadsheetIdParam = '';

  const data = await Promise.all(
    titles.map((title) =>
      getTabValuesByTitle(title, sheetsInstance, authParam, spreadsheetIdParam)
    )
  );
  dataObjects.lastMonthSheetValues.push(data);
  return data;
};

/**
 * Retrieves the column numbers corresponding to the given header indicators.
 *
 * @param {Array<string>} headerIndicators - List of header indicators to locate in the tab.
 * @param {Object} headerFooterData - Data containing header values from the tab.
 * @returns {Array<number>} - List of column numbers corresponding to the provided header indicators.
 */
export const getSourceColumnNumbers = (headerIndicators, headerFooterData) => {
  return headerIndicators
    .map((value) => headerFooterData.headerValues.indexOf(value))
    .filter((index) => index !== -1);
};

/**
 * Identifies the index of the header row within the provided rows.
 * The header row is determined by the presence of all header indicators.
 *
 * @param {string[][]} rows - A 2D array representing rows of data.
 * @returns {number} - The index of the header row. If not found, it returns a value incremented by 1.
 */
export const findHeaderRowIndex = (rows) => {
  return (
    rows.findIndex((row) =>
      HEADER_INDICATORS.every((indicator) => row.includes(indicator))
    ) + 1
  );
};

/**
 * Finds the starting column index for header metrics based on the title and default metrics.
 *
 * @param {string} title - The title to search for.
 * @param {Array} defaultHeaderMetrics - Default header metrics to consider.
 * @returns {Promise<number>} - Starting column index for header metrics.
 */
export const getHeaderMetricsSourceColumnStart = async (
  title,
  defaultHeaderMetrics
) => {
  return await findMatchingColumnByTabId(title, defaultHeaderMetrics);
};

/**
 * Calculates the ending column index for header metrics.
 *
 * @param {number} startColumn - Starting column index.
 * @param {number} indicatorsLength - Length of header indicators.
 * @returns {number} - Ending column index for header metrics.
 */
export const getHeaderMetricsSourceColumnEnd = (
  startColumn,
  indicatorsLength
) => {
  return startColumn + indicatorsLength;
};

/**
 * Retrieves the header row index from the provided data.
 *
 * @param {Object} headerFooterData - Data containing header row details.
 * @returns {number} - Header row index.
 */
export const getAdjustedHeaderRowIndex = (headerFooterData) => {
  return headerFooterData.headerRow - 1;
};

// Calculate header indicators' length for reference.
export const getHeaderIndicatorsLength = () => {
  return HEADER_INDICATORS.length;
};

/**
 * Finds the maximum header index within a series of source tabs.
 *
 * @param {string[]} sourceTabTitles - The titles of the source tabs.
 * @param {Array} lastMonthTabValues - The tab values from the last month.
 * @param {Object} columnMetrics - The current metrics for columns.
 * @returns {Promise<Object>} - The updated column metrics.
 * @throws {Error} - If data for any source tab title cannot be found or is invalid.
 */
export const findLongestHeaderWithinSeries = async (
  sourceTabTitles,
  lastMonthTabValues,
  columnMetrics
) => {
  let updatedColumnMetrics = { ...columnMetrics };
  try {
    for (const sourceTabTitle of sourceTabTitles) {
      const sourceData = await findTabTitleDataInArray(
        lastMonthTabValues,
        sourceTabTitle
      );
      if (
        !sourceData ||
        !sourceData.data ||
        !Array.isArray(sourceData.data.values)
      ) {
        throw new Error(
          `Data for source tab title "${sourceTabTitle}" could not be found or is invalid.`
        );
      }

      const headerRowIndex = findHeaderRowIndex(sourceData.data.values);
      if (typeof headerRowIndex !== 'number') {
        throw new Error(
          `findHeaderRowIndex did not return a numeric value for title "${sourceTabTitle}".`
        );
      }

      const headerRowActual = headerRowIndex + 1;
      updatedColumnMetrics.longestHeaderEnd = Math.max(
        updatedColumnMetrics.longestHeaderEnd,
        headerRowActual
      );
    }
    return updatedColumnMetrics.longestHeaderEnd;
  } catch (error) {
    console.error('Failed to find longest header within series:', error);
    throw error;
  }
};

/**
 * Initializes an object to hold various payload categories required for report construction.
 *
 * @returns {object} - An object with empty arrays for body payload, header payload, summary header style payload, and summary grid styles.
 */
export const initializeReportPayload = () => ({
  bodyPayload: [],
  headerPayload: [],
  summaryHeaderStylePayload: [],
  summaryGridStyles: [],
});

/**
 * Initializes column metrics object to manage column positions and header lengths during report construction.
 *
 * @returns {object} - An object containing metrics for next available column, default header metrics for destination column,
 * longest header end position, and end position for default header metrics destination column.
 */
export const initializeReportColumnMetrics = (headerIndicatorsLength) => {
  return {
    nextAvailableColumn: 0,
    defaultHeaderMetricsDestinationColumn: 0,
    longestHeaderEnd: 0,
    defaultHeaderMetricsDestinationColumnEnd: headerIndicatorsLength,
  };
};

/**
 * Processes source columns and populates the summary payload for further actions.
 * This function iterates over each header indicator, identifies relevant columns,
 * and prepares configuration payloads for copy-pasting operations.
 *
 * @param {Object} headerFooterData - Data regarding the header and footer positions of the tab.
 * @param {string} title - Title of the tab being processed.
 * @param {number} sourcePageId - ID of the source tab.
 * @param {number} destinationTabId - ID of the destination tab.
 * @param {Object} summaryPayload - Aggregated payload object that accumulates configurations.
 * @param {Object} columnMetrics - Metrics associated with columns being processed.
 * @param {string} destinationTabTitle - Title of the destination tab.
 * @param {number} headerIndicatorsLength - Length of header indicators to process.
 */
const processSourceColumns = async (
  headerFooterData,
  title,
  sourcePageId,
  destinationTabId,
  summaryPayload,
  columnMetrics,
  destinationTabTitle,
  headerIndicatorsLength
) => {
  const lightGrey = { red: 0.9, green: 0.9, blue: 0.9 }; // Light grey color (e.g., #D9D9D9)
  const headerAndFooterRowFormat = {
    userEnteredFormat: {
      textFormat: { bold: true, fontSize: 12 },
    },
  };

  const sourceColumnNumbers = getSourceColumnNumbers(
    HEADER_INDICATORS,
    headerFooterData
  );

  const headerMetricsSourceColumnStart =
    await getHeaderMetricsSourceColumnStart(title, DEFAULT_HEADER_METRICS);
  const headerMetricsSourceColumnEnd = getHeaderMetricsSourceColumnEnd(
    headerMetricsSourceColumnStart,
    headerIndicatorsLength
  );
  const headerRowIndex = getAdjustedHeaderRowIndex(headerFooterData);
  /**
   * Calculates the ending row index for destination.
   *
   * @param {Object} columnMetrics - Metrics containing details about columns.
   * @param {Object} headerFooterData - Data containing footer row details.
   * @returns {number} - Ending row index for destination.
   */
  const destinationEndRowIndex =
    headerFooterData.footerRow - (headerRowIndex - 4);

  /**
   * Calculates the ending column for a given source column.
   *
   * @param {number} srcColNumber - Source column number.
   * @returns {number} - Ending column number.
   */
  const calculateSourceEndColumn = (srcColNumber) => {
    return srcColNumber + 1;
  };

  /**
   * Computes the ending column for the destination.
   *
   * @param {Object} columnMetrics - Metrics containing details about columns.
   * @returns {number} - Ending column for destination.
   */
  const calculateDestinationEndColumn = (columnMetrics) => {
    return columnMetrics.nextAvailableColumn + 1;
  };

  /**
   * Constructs the body source parameters.
   *
   * @param {Object} details - An object containing necessary details.
   * @returns {Object} - Body source parameters.
   */
  const buildBodySourceParams = ({
    sourcePageId,
    headerRowIndex,
    footerRow,
    srcColNumber,
    srcEndCol,
  }) => ({
    sourcePageId,
    startRow: headerRowIndex,
    endRow: footerRow,
    startCol: srcColNumber,
    endCol: srcEndCol,
  });

  /**
   * Constructs the body destination parameters.
   *
   * @param {Object} details - An object containing necessary details.
   * @returns {Object} - Body destination parameters.
   */
  const buildBodyDestinationParams = ({
    destinationTabId,
    startRowIndex,
    endRowIndex,
    nextAvailableColumn,
    endColumn,
  }) => ({
    destinationTabId,
    startRow: startRowIndex,
    endRow: endRowIndex,
    startCol: nextAvailableColumn,
    endCol: endColumn,
  });

  sourceColumnNumbers.forEach((srcColNumber) => {
    const srcEndCol = calculateSourceEndColumn(srcColNumber);
    const destinationEndColumn = calculateDestinationEndColumn(columnMetrics);

    const bodySourceParams = buildBodySourceParams({
      sourcePageId,
      headerRowIndex,
      footerRow: headerFooterData.footerRow,
      srcColNumber,
      srcEndCol,
    });

    const bodyDestinationParams = buildBodyDestinationParams({
      destinationTabId: destinationTabId,
      startRowIndex: 5,
      endRowIndex: destinationEndRowIndex,
      nextAvailableColumn: columnMetrics.nextAvailableColumn,
      endColumn: destinationEndColumn,
    });

    const copyPasteData = copyPasteNormal(
      bodySourceParams,
      bodyDestinationParams
    );
    summaryPayload.bodyPayload.push(copyPasteData);
    columnMetrics.nextAvailableColumn++;
  });

  /**
   * Constructs header metric source parameters.
   *
   * @param {Object} config - Configuration object with required properties.
   * @returns {Object} - Header metric source parameters.
   */
  const buildHeaderMetricSourceParams = ({
    sourcePageId,
    startRow = 0,
    startColumn,
    endColumn,
  }) => ({
    sourcePageId,
    startRow,
    endRow: 4,
    startCol: startColumn,
    endCol: endColumn,
  });

  const headerMetricSourceParams = buildHeaderMetricSourceParams({
    sourcePageId,
    headerRowIndex,
    startColumn: headerMetricsSourceColumnStart,
    endColumn: headerMetricsSourceColumnEnd,
  });

  /**
   * Calculates the start row for the header metric destination based on
   * the longest header and the header row data.
   * @constant
   * @type {number}
   */
  const headerMetricDestinationStartRow = 1;
  // columnMetrics.longestHeaderEnd - headerFooterData.headerRow; ///this activating this line will align metrics to bottom

  /**
   * Represents the parameters for the header metric destination.
   * @constant
   * @type {object}
   * @property {number|string} destinationTabId - The ID of the destination tab.
   * @property {number} startRow - The starting row index for the header metric destination.
   * @property {number} endRow - The ending row index for the header metric destination.
   * @property {number} startCol - The starting column index for the header metric destination.
   * @property {number} endCol - The ending column index for the header metric destination.
   */
  const headerMetricDestinationParams = {
    destinationTabId,
    startRow: headerMetricDestinationStartRow,
    endRow: 4,
    startCol: columnMetrics.defaultHeaderMetricsDestinationColumn,
    endCol: columnMetrics.defaultHeaderMetricsDestinationColumnEnd,
  };

  /**
   * Utilizes the copyPasteNormal function to generate data for copying and pasting
   * from the source parameters to the destination parameters for header metrics.
   * @constant
   * @type {object}
   */
  const copyPasteData = copyPasteNormal(
    headerMetricSourceParams,
    headerMetricDestinationParams
  );

  /**
   * Adds the generated copyPasteData to the body payload of the summary.
   */
  summaryPayload.bodyPayload.push(copyPasteData);

  /**
   * Converts the numeric value of the default header metrics destination column
   * to its corresponding alphabetical column representation (e.g., 1 -> A, 2 -> B).
   * @constant
   * @type {string}
   */
  const column = numberToLetter(
    columnMetrics.defaultHeaderMetricsDestinationColumn
  );

  /**
   * Pushes the header data into the header payload of the summary.
   * Constructs a range using the destination tab title and the computed column
   * to specify the location in the destination where the title will be placed.
   */
  summaryPayload.headerPayload.push({
    range: `${destinationTabTitle}!${column}1`,
    values: [[title]],
  });

  /**
   * Define starting and ending row positions for summary header.
   * `summaryHeaderRowStart` represents the starting row index for the summary header.
   * `summaryHeaderRowEnd` represents the ending row index for the summary header.
   */
  const summaryHeaderRowStart = 0;
  const summaryHeaderRowEnd = 1;

  /**
   * Adds a 'merge cells' style action to the summary payload.
   * This action aims to merge a specific range of cells in the header
   * of the summary tab for visual emphasis and clarity.
   */
  summaryPayload.summaryHeaderStylePayload.push(
    {
      mergeCells: {
        range: {
          sheetId: destinationTabId,
          startRowIndex: summaryHeaderRowStart,
          endRowIndex: summaryHeaderRowEnd,
          startColumnIndex: columnMetrics.defaultHeaderMetricsDestinationColumn,
          endColumnIndex:
            columnMetrics.defaultHeaderMetricsDestinationColumnEnd,
        },
        mergeType: 'MERGE_ALL',
      },
    },
    {
      mergeCells: {
        range: {
          sheetId: destinationTabId,
          startRowIndex: destinationEndRowIndex,
          endRowIndex: destinationEndRowIndex + 1,
          startColumnIndex: columnMetrics.defaultHeaderMetricsDestinationColumn,
          endColumnIndex:
            columnMetrics.defaultHeaderMetricsDestinationColumnEnd,
        },
        mergeType: 'MERGE_ALL',
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: destinationTabId,
          startRowIndex: summaryHeaderRowStart,
          endRowIndex: summaryHeaderRowEnd,
          startColumnIndex: columnMetrics.defaultHeaderMetricsDestinationColumn,
          endColumnIndex:
            columnMetrics.defaultHeaderMetricsDestinationColumnEnd,
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'CENTER',
          },
        },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    },
    {
      updateBorders: {
        range: {
          sheetId: destinationTabId,
          startRowIndex: summaryHeaderRowStart,
          endRowIndex: summaryHeaderRowEnd,
          startColumnIndex: columnMetrics.defaultHeaderMetricsDestinationColumn,
          endColumnIndex:
            columnMetrics.defaultHeaderMetricsDestinationColumnEnd,
        },
        top: solidBlackWidthTwo,
        bottom: solidBlackWidthTwo,
        left: solidBlackWidthOne,
        right: solidBlackWidthOne,
        innerHorizontal: solidBlackWidthTwo,
        innerVertical: solidBlackWidthOne,
      },
    },
    {
      updateBorders: {
        range: {
          sheetId: destinationTabId,
          startRowIndex: destinationEndRowIndex,
          endRowIndex: destinationEndRowIndex + 1,
          startColumnIndex: columnMetrics.defaultHeaderMetricsDestinationColumn,
          endColumnIndex:
            columnMetrics.defaultHeaderMetricsDestinationColumnEnd,
        },
        top: solidBlackWidthTwo,
        bottom: solidBlackWidthTwo,
        left: solidBlackWidthOne,
        right: solidBlackWidthOne,
        innerHorizontal: solidBlackWidthTwo,
        innerVertical: solidBlackWidthOne,
      },
    },
    {
      // Apply dark grey color to the header row
      repeatCell: {
        range: {
          sheetId: destinationTabId,
          startRowIndex: summaryHeaderRowStart,
          endRowIndex: summaryHeaderRowEnd,
          startColumnIndex: columnMetrics.defaultHeaderMetricsDestinationColumn,
          endColumnIndex:
            columnMetrics.defaultHeaderMetricsDestinationColumnEnd,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: lightGrey,
          },
        },
        fields: 'userEnteredFormat.backgroundColor',
      },
    },
    {
      // Apply bold and fontSize 12 to header row
      repeatCell: {
        range: {
          sheetId: destinationTabId,
          startRowIndex: summaryHeaderRowStart,
          endRowIndex: summaryHeaderRowEnd,
          startColumnIndex: columnMetrics.defaultHeaderMetricsDestinationColumn,
          endColumnIndex:
            columnMetrics.defaultHeaderMetricsDestinationColumnEnd,
        },
        cell: headerAndFooterRowFormat,
        fields: 'userEnteredFormat.textFormat',
      },
    }
  );

  /**
   * Adjusts the starting column index for the default header metrics destination.
   * This is typically required when there are additional header indicators or
   * columns introduced which shift the position of the header metrics.
   *
   * @param {number} length - The number of additional header indicators/columns.
   */
  const adjustDefaultHeaderMetricsDestinationStart = (length) => {
    columnMetrics.defaultHeaderMetricsDestinationColumn += length;
  };

  /**
   * Adjusts the ending column index for the default header metrics destination.
   * Like the start, the end may need adjustment when new columns or indicators
   * are introduced which affect the ending position of the header metrics.
   *
   * @param {number} length - The number of additional header indicators/columns.
   */
  const adjustDefaultHeaderMetricsDestinationEnd = (length) => {
    columnMetrics.defaultHeaderMetricsDestinationColumnEnd += length;
  };

  // Call the methods with the required length parameter
  // headerIndicatorsLength /* derived or given value */;
  adjustDefaultHeaderMetricsDestinationStart(headerIndicatorsLength);
  adjustDefaultHeaderMetricsDestinationEnd(headerIndicatorsLength);
};

/**
 * Processes source tab titles by fetching associated tab data and processing
 * its source columns. Each title corresponds to a tab whose data needs to be
 * processed and possibly merged/copied to a destination tab.
 *
 * @param {string[]} titles - An array of source tab titles to process.
 * @param {number} destinationTabId - The ID of the destination tab.
 * @param {Object} summaryPayload - An object to accumulate processing results.
 * @param {Object} columnMetrics - Metrics related to columns in the source and destination tabs.
 * @param {string} destinationTabTitle - Title of the destination tab.
 * @param {number} headerIndicatorsLength - Number of header indicators/columns to adjust columns by.
 *
 * @returns {Promise<void>}
 */
export const processSourceTabTitles = async (
  titles,
  destinationTabId,
  summaryPayload,
  columnMetrics,
  destinationTabTitle,
  headerIndicatorsLength
) => {
  for (let title of titles) {
    const headerFooterData = await getHeaderAndFooterDataByTabTitle(title);
    const sourcePageId = await getTabIdFromTitle(title);
    await processSourceColumns(
      headerFooterData,
      title,
      sourcePageId,
      destinationTabId,
      summaryPayload,
      columnMetrics,
      destinationTabTitle,
      headerIndicatorsLength
    );
  }
};
