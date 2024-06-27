import {
  handleSummary,
  sendSummaryBody,
  addColumnsAndRows,
  sendSummaryHeaders,
  summaryHeaderStyling,
} from '../yourModule'; // Adjust the path to your module
import { isSummaryRequired } from './summaryRequired';
import {
  getExistingTabTitlesInRange,
  getTabIdFromTitle,
} from '../google/sheetDataMethods/getSheetInfo';
import { createSummaryTitle } from '../google/sheetDataMethods/createTabNames';
import { getLastMonthTabTitles } from '../google/sheetDataMethods/getLastMonthTabTitles';
import { constructPayloadForCopyPaste } from '../monthlySummaryMethods/buildSummary';
import { createNewTab } from '../google/googleSheetIntegration/createNewTab';
import { auth, sheets, spreadsheetId } from '../google/auth';
import { getFormattedMonth, getCurrentTime } from './dateFormatting';
import { HEADER_INDICATORS } from '../../constants';
import chalk from 'chalk';

jest.mock('../google/sheetDataMethods/getSheetInfo');
jest.mock('../google/auth');
jest.mock('../google/sheetDataMethods/processSheetData');
jest.mock('../google/sheetDataMethods/createTabNames');
jest.mock('../monthlySummaryMethods/buildSummary');
jest.mock('../google/sheetDataMethods/getLastMonthTabTitles');
jest.mock('../google/googleSheetIntegration/createNewTab');
jest.mock('./dateFormatting');
jest.mock('./summaryRequired');
jest.mock('../../constants');

describe('handleSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.console.error = jest.fn();
    global.console.warn = jest.fn();
    global.console.info = jest.fn();
  });

  it('should log a warning and return if CSV format is true', async () => {
    await handleSummary({ csv: true });

    expect(global.console.warn).toHaveBeenCalledWith(
      chalk.yellow('CSV format is not supported for summary reports')
    );
  });

  it('should log no summary message and return if summary is not required and duplicate is false', async () => {
    isSummaryRequired.mockResolvedValue(false);
    getFormattedMonth.mockReturnValue('Jan');

    await handleSummary({ csv: false, duplicate: false });

    expect(global.console.info).toHaveBeenCalledWith(
      expect.stringContaining('No Jan summary required')
    );
  });

  it('should handle errors and log them', async () => {
    isSummaryRequired.mockRejectedValue(new Error('Test error'));

    await expect(handleSummary({ csv: false })).rejects.toThrow(
      'Failed to handle summary'
    );
    expect(global.console.error).toHaveBeenCalledWith(
      'An error occurred in handleSummary:',
      expect.any(Error)
    );
  });

  it('should complete the summary process if conditions are met', async () => {
    isSummaryRequired.mockResolvedValue(true);
    getFormattedMonth.mockReturnValue('Jan');
    getCurrentTime.mockReturnValue('2022-01-01T00:00:00Z');
    getExistingTabTitlesInRange.mockResolvedValue(['Dec 2021']);
    getLastMonthTabTitles.mockResolvedValue(['Dec 2021']);
    createSummaryTitle.mockReturnValue('Summary Jan 2022');
    constructPayloadForCopyPaste.mockResolvedValue({
      bodyPayload: [{ copyPaste: { destination: { endRowIndex: 10 } } }],
      headerPayload: [{ range: 'A1', values: [['Header']] }],
      summaryHeaderStylePayload: {
        mergeCells: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 2,
          },
          mergeType: 'MERGE_ALL',
        },
      },
    });
    createNewTab.mockResolvedValue();

    await handleSummary({ csv: false, duplicate: false });

    expect(createNewTab).toHaveBeenCalledWith('Summary Jan 2022');
    expect(constructPayloadForCopyPaste).toHaveBeenCalledWith(
      ['Dec 2021'],
      'Summary Jan 2022'
    );
    expect(addColumnsAndRows).toHaveBeenCalledWith(
      ['Dec 2021'],
      HEADER_INDICATORS,
      [{ copyPaste: { destination: { endRowIndex: 10 } } }],
      'Summary Jan 2022'
    );
    expect(sendSummaryHeaders).toHaveBeenCalledWith([
      { range: 'A1', values: [['Header']] },
    ]);
    expect(sendSummaryBody).toHaveBeenCalledWith([
      { copyPaste: { destination: { endRowIndex: 10 } } },
    ]);
    expect(summaryHeaderStyling).toHaveBeenCalledWith({
      mergeCells: {
        range: {
          sheetId: 0,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 2,
        },
        mergeType: 'MERGE_ALL',
      },
    });
  });
});
