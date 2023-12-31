import { createNewTab } from '../google/googleSheetIntegration/createNewTab.js';
import {
  batchUpdateMasterSheet,
  writeToSheet,
} from '../google/googleSheetIntegration/writeToSheet.js';
import {
  buildDailyPayload,
  processHeaderWithFormulas,
} from '../dailyReportMethods/buildReport.js';
import { loadJSON } from '../sharedMethods/dataHandler.js';
import { getTodaysFormattedDate } from './dateFormatting.js';
import { createMergeQueries } from '../dailyReportMethods/reportGenerationHelpers.js';
import { getTabIdFromTitle } from '../google/sheetDataMethods/getSheetInfo.js';
import {
  BuildTextStyles,
  buildColorStylesPayload,
  buildRowHeightPayload,
  createConditionalFormattingPayload,
  freezeRowsInSheet,
  sendGridStyle,
  setColumnWidths,
  createTextAlignmentPayload,
  setTextWrappingToClip,
} from './styles.js';
import { TEST_DATA } from '../../constants.js';

/**
 * Handles the creation and population of a daily report.
 * It builds the payload, creates a new tab for the report, processes the header with formulas,
 * and writes the header and body to the sheet.
 * @async
 * @function handleDailyReport
 */
export const handleDailyReport = async () => {
  try {
    const todaysTitle = getTodaysFormattedDate();
    // Use path.join to create a relative path to the JSON file

    const jsonFilePath = TEST_DATA();

    const dataSet = await loadJSON(jsonFilePath);

    const fullDailyPayload = await buildDailyPayload(dataSet);
    await createNewTab(todaysTitle);

    const destinationTabId = await getTabIdFromTitle(todaysTitle);
    const headerRowIndex = fullDailyPayload.headerPayload.length + 1;
    const bodyRowCount = fullDailyPayload.bodyPayload.length;
    const totalNumberOfRows = headerRowIndex + bodyRowCount - 1;

    await processHeaderWithFormulas(
      fullDailyPayload.headerPayload,
      headerRowIndex,
      totalNumberOfRows,
      bodyRowCount
    );

    const rowMergePayload = createMergeQueries(
      fullDailyPayload.bodyPayload,
      headerRowIndex - 1,
      destinationTabId
    );

    const failedPayload = createConditionalFormattingPayload(
      destinationTabId,
      fullDailyPayload,
      'failed'
    );
    const passedPayload = createConditionalFormattingPayload(
      destinationTabId,
      fullDailyPayload,
      'passed'
    );

    const combinedPayload = {
      requests: [...failedPayload.requests, ...passedPayload.requests],
    };

    const frozenRowPayload = await freezeRowsInSheet(
      destinationTabId,
      headerRowIndex - 1
    );

    const colorStylesPayload = await buildColorStylesPayload(
      destinationTabId,
      fullDailyPayload
    );

    const rowHeightPayload = await buildRowHeightPayload(
      destinationTabId,
      fullDailyPayload
    ); // For example, to set the height of the first 100 rows to 21 pixels

    const textStyle = await BuildTextStyles(destinationTabId, fullDailyPayload);
    const wrapStrategyPayload = await setTextWrappingToClip(
      destinationTabId,
      fullDailyPayload
    );

    const textAlignmentPayload = await createTextAlignmentPayload(
      destinationTabId,
      fullDailyPayload
    );

    const columnWidthPayload = await setColumnWidths(
      destinationTabId,
      fullDailyPayload
    );

    await writeToSheet(todaysTitle, fullDailyPayload.headerPayload);
    await writeToSheet(todaysTitle, fullDailyPayload.bodyPayload);
    await writeToSheet(todaysTitle, fullDailyPayload.footerPayload);
    await sendGridStyle(destinationTabId, fullDailyPayload);
    await batchUpdateMasterSheet(combinedPayload);
    await batchUpdateMasterSheet(frozenRowPayload);
    await batchUpdateMasterSheet(colorStylesPayload);
    await batchUpdateMasterSheet(rowHeightPayload);
    await batchUpdateMasterSheet(textStyle);
    await batchUpdateMasterSheet(wrapStrategyPayload);
    await batchUpdateMasterSheet(textAlignmentPayload);
    await batchUpdateMasterSheet(columnWidthPayload);

    await batchUpdateMasterSheet(rowMergePayload);
  } catch (error) {
    console.error('Error in handleDailyReport:', error);
    throw error; // Depending on the context you might want to handle the error differently
  }
};
