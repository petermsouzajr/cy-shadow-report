import { createNewTab } from '../google/googleSheetIntegration/createNewTab.js';
import {
  batchUpdateMasterSheet,
  writeToSheet,
} from '../google/googleSheetIntegration/writeToSheet.js';
import { loadJSON } from '../sharedMethods/dataHandler.js';
import { getCurrentTime, getTodaysFormattedDate } from './dateFormatting.js';
import { createMergeQueries } from '../dailyReportMethods/reportGeneration/reportGenerationHelpers.js';
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
import { saveCSV } from './csvHandler.js';
import { doesTodaysReportExist } from './dailyReportRequired.js';
import { transformPlaywrightToFriendlyFormat } from './convertPayloads.js';
import chalk from 'chalk';
import { processHeaderWithFormulas } from '../dailyReportMethods/reportGeneration/processHeaderWithFormulas.js';
import { buildDailyPayload } from '../dailyReportMethods/reportGeneration/buildDailyPayload.js';

/**
 * Handles the creation and population of a daily report.
 * Depending on the specified format, it may generate a standard report or a CSV formatted report.
 * The function builds the payload, creates a new tab for the report, processes the header with formulas,
 * and writes the header and body to the sheet. The output format is determined by the 'format' parameter.
 *
 * @async
 * @function handleDailyReport
 * @param {Object} options - Configuration options for generating reports.
 * @param {boolean} options.csv - If true, outputs in CSV format.
 * @param {boolean} options.duplicate - If true, allows creating a duplicate report for the day.
 * @param {boolean} options.cypress - If true, parses test result JSON in cypress format.
 * @param {boolean} options.playwright - If true, parses test result JSON in playwright format.
 * */
export const handleDailyReport = async ({
  csv,
  duplicate,
  cypress,
  playwright,
}) => {
  try {
    const todaysDate = getTodaysFormattedDate();
    const currentTime = getCurrentTime();
    const todaysTitle = duplicate ? `${todaysDate}_${currentTime}` : todaysDate;
    const jsonFilePath = TEST_DATA(cypress);
    const dataSet = await loadJSON(jsonFilePath);
    let testPayload = cypress ? dataSet.results : dataSet.suites;

    if (playwright) {
      testPayload = transformPlaywrightToFriendlyFormat(testPayload);
    }
    const fullDailyPayload = await buildDailyPayload(testPayload, playwright);
    if (csv) {
      const reportPayload = [
        // Gets the last element of the headerPayload array, which is the column titles
        fullDailyPayload.headerPayload[
          fullDailyPayload.headerPayload.length - 1
        ],
        ...fullDailyPayload.bodyPayload,
      ];
      saveCSV(reportPayload, duplicate);
    } else {
      const todaysReportExists = await doesTodaysReportExist();
      const noReportMessage = chalk.yellow(`Today\`s report already exists.
      If you would like to create a duplicate, use the optional flag ${chalk.green(
        '--duplicate'
      )} in your reporting command,e.g. ${chalk.yellow(
        'qa-shadow-report --duplicate'
      )}.`);
      if (todaysReportExists && !duplicate) {
        console.info(noReportMessage);
        return;
      }
      await createNewTab(todaysTitle);
      const destinationTabId = await getTabIdFromTitle(todaysTitle);
      const headerRowIndex = fullDailyPayload.headerPayload.length + 1;
      const bodyRowCount = fullDailyPayload.bodyPayload.length;
      const totalNumberOfRows = headerRowIndex + bodyRowCount - 1;

      await processHeaderWithFormulas(
        fullDailyPayload.headerPayload,
        headerRowIndex,
        totalNumberOfRows,
        bodyRowCount,
        playwright
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
      );

      const textStyle = await BuildTextStyles(
        destinationTabId,
        fullDailyPayload
      );
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
    }
  } catch (error) {
    console.error('Error in handleDailyReport:', error);
    throw error; // Depending on the context you might want to handle the error differently
  }
};
