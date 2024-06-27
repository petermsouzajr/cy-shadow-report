import { jest } from '@jest/globals';
import { dataObjects } from '../../index.js';
import {
  getFormattedMonth,
  getPreviousMonthsYear,
  getTodaysFormattedDate,
} from '../../sharedMethods/dateFormatting.js';
import { getTopLevelSpreadsheetData } from '../googleSheetIntegration/getSheetData.js';
import { createSummaryTitle } from './createTabNames.js';
import {
  findTabTitleDataInArray,
  getExistingTabTitlesInRange,
  getTabIdFromTitle,
  findMatchingColumnByTabId,
  getHeaderAndFooterDataByTabTitle,
} from './getSheetInfo.js';

describe('findTabTitleDataInArray', () => {
  it('should find the sheet data object by title', () => {
    const sheetValuesArray = [
      { config: { url: 'http://example.com/sheet1' } },
      { config: { url: 'http://example.com/sheet2' } },
    ];
    const sheetTitle = 'sheet2';
    const result = findTabTitleDataInArray(sheetValuesArray, sheetTitle);
    expect(result).toEqual({ config: { url: 'http://example.com/sheet2' } });
  });

  it('should return undefined if the sheet title is not found', () => {
    const sheetValuesArray = [
      { config: { url: 'http://example.com/sheet1' } },
      { config: { url: 'http://example.com/sheet3' } },
    ];
    const sheetTitle = 'sheet2';
    const result = findTabTitleDataInArray(sheetValuesArray, sheetTitle);
    expect(result).toBeUndefined();
  });

  it('should throw a TypeError if sheetValuesArray is not an array', () => {
    expect(() => findTabTitleDataInArray({}, 'sheet1')).toThrow(
      'Invalid sheetValuesArray: Expected an array.'
    );
  });

  it('should throw a TypeError if sheetTitle is not a string', () => {
    expect(() => findTabTitleDataInArray([], 123)).toThrow(
      'Invalid sheetTitle: Expected a string.'
    );
  });
});

// describe('getExistingTabTitlesInRange', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should return titles that match the last month and year criteria', async () => {
//     getFormattedMonth
//       .mockReturnValueOnce('March')
//       .mockReturnValueOnce('February');
//     getPreviousMonthsYear.mockReturnValue('2023');
//     getTopLevelSpreadsheetData.mockResolvedValue({
//       data: {
//         sheets: [
//           { properties: { title: 'February 20, 2023' } },
//           { properties: { title: 'March 15, 2023' } },
//           { properties: { title: 'February 25, 2023' } },
//         ],
//       },
//     });

//     const titles = await getExistingTabTitlesInRange('lastMonth');
//     expect(titles).toEqual(['February 20, 2023', 'February 25, 2023']);
//   });

//   it('should return all titles if "when" is not "lastMonth"', async () => {
//     getFormattedMonth.mockReturnValue('March');
//     getTopLevelSpreadsheetData.mockResolvedValue({
//       data: {
//         sheets: [
//           { properties: { title: 'February 20, 2023' } },
//           { properties: { title: 'March 15, 2023' } },
//         ],
//       },
//     });

//     const titles = await getExistingTabTitlesInRange('');
//     expect(titles).toEqual(['February 20, 2023', 'March 15, 2023']);
//   });

//   it('should throw a TypeError if "when" is not a string', async () => {
//     await expect(getExistingTabTitlesInRange(123)).rejects.toThrow(TypeError);
//   });

//   it('should throw an error if metadata format is invalid', async () => {
//     getTopLevelSpreadsheetData.mockResolvedValue({ data: {} });

//     await expect(getExistingTabTitlesInRange('lastMonth')).rejects.toThrow(
//       'Invalid spreadsheet metadata format.'
//     );
//   });
// });

// jest.mock('../../sharedMethods/dateFormatting');
// jest.mock('../googleSheetIntegration/getSheetData');
// jest.mock('../../index', () => ({
//   dataObjects: {
//     topLevelSpreadsheetData: {},
//   },
// }));

// describe('getExistingTabTitlesInRange', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

// it('should return titles that match the last month and year criteria', async () => {
// getFormattedMonth
//   .mockReturnValueOnce('lastMonth')
// .mockReturnValueOnce('February');
// getPreviousMonthsYear.mockReturnValue('2023');
// getTopLevelSpreadsheetData.mockResolvedValue({
//   data: {
//     sheets: [
//       { properties: { title: 'February 20, 2023' } },
//       { properties: { title: 'March 15, 2023' } },
//       { properties: { title: 'February 25, 2023' } },
//     ],
//   },
// });

// const titles = await getExistingTabTitlesInRange('lastMonth');
//   expect(titles).toEqual(['February 20, 2023', 'February 25, 2023']);
// });

//   it('should return all titles if "when" is not "lastMonth"', async () => {
//     getFormattedMonth.mockReturnValue('March');
//     getTopLevelSpreadsheetData.mockResolvedValue({
//       data: {
//         sheets: [
//           { properties: { title: 'February 20, 2023' } },
//           { properties: { title: 'March 15, 2023' } },
//         ],
//       },
//     });

//     const titles = await getExistingTabTitlesInRange('');
//     expect(titles).toEqual(['February 20, 2023', 'March 15, 2023']);
//   });

//   it('should throw a TypeError if "when" is not a string', async () => {
//     await expect(getExistingTabTitlesInRange(123)).rejects.toThrow(
//       'Invalid input: "when" must be a string.'
//     );
//   });

//   it('should throw an error if metadata format is invalid', async () => {
//     getTopLevelSpreadsheetData.mockResolvedValue({ data: {} });

//     await expect(getExistingTabTitlesInRange('lastMonth')).rejects.toThrow(
//       'Invalid spreadsheet metadata format.'
//     );
//   });

//   it('should throw an error if titles format is invalid', async () => {
//     getTopLevelSpreadsheetData.mockResolvedValue({
//       data: {
//         sheets: [
//           { properties: { title: 'February 20, 2023' } },
//           { properties: { title: 123 } },
//         ],
//       },
//     });

//     await expect(getExistingTabTitlesInRange('lastMonth')).rejects.toThrow(
//       'Invalid titles format: Expected an array of strings.'
//     );
//   });

//   it('should handle errors during data fetching', async () => {
//     getTopLevelSpreadsheetData.mockRejectedValue(new Error('Network error'));

//     await expect(getExistingTabTitlesInRange('lastMonth')).rejects.toThrow(
//       'Unable to fetch sheet titles in range.'
//     );
//   });
// });

// jest.mock('../../sharedMethods/dateFormatting');
// jest.mock('../googleSheetIntegration/getSheetData');
// jest.mock('../../index', () => ({
//   dataObjects: {
//     topLevelSpreadsheetData: {},
//     summaryTabData: {},
//     todaysReportData: {},
//   },
// }));

// describe('getTabIdFromTitle', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should throw an error if tabTitle is not a valid string', async () => {
//     await expect(getTabIdFromTitle('')).rejects.toThrow(
//       'Invalid tabTitle: Expected a non-empty string.'
//     );
//     await expect(getTabIdFromTitle(null)).rejects.toThrow(
//       'Invalid tabTitle: Expected a non-empty string.'
//     );
//   });

//   it('should return null if sheet list data is not available', async () => {
//     dataObjects.topLevelSpreadsheetData = {};
//     dataObjects.summaryTabData = {};
//     dataObjects.todaysReportData = {};

//     const tabId = await getTabIdFromTitle('Some Title');
//     expect(tabId).toBeNull();
//   });

//   it("should return the sheet ID for summary or today's report titles", async () => {
//     const mockSheetId = 12345;
//     dataObjects.summaryTabData = {
//       data: {
//         replies: [{ addSheet: { properties: { sheetId: mockSheetId } } }],
//       },
//     };
//     dataObjects.todaysReportData = {
//       data: {
//         replies: [{ addSheet: { properties: { sheetId: mockSheetId } } }],
//       },
//     };

//     createSummaryTitle.mockReturnValue('Summary Title');
//     getTodaysFormattedDate.mockReturnValue("Today's Date");

//     let tabId = await getTabIdFromTitle('Summary Title');
//     expect(tabId).toBe(mockSheetId);

//     tabId = await getTabIdFromTitle("Today's Date");
//     expect(tabId).toBe(mockSheetId);
//   });

//   it('should return the sheet ID for other titles', async () => {
//     const mockSheetId = 67890;
//     dataObjects.topLevelSpreadsheetData = {
//       data: {
//         sheets: [
//           { properties: { title: 'Other Title', sheetId: mockSheetId } },
//         ],
//       },
//     };

//     const tabId = await getTabIdFromTitle('Other Title');
//     expect(tabId).toBe(mockSheetId);
//   });

//   it('should return null if the sheet title is not found', async () => {
//     dataObjects.topLevelSpreadsheetData = {
//       data: { sheets: [{ properties: { title: 'Non-matching Title' } }] },
//     };

//     const tabId = await getTabIdFromTitle('Some Title');
//     expect(tabId).toBeNull();
//   });

//   it('should handle errors during fetching tab ID', async () => {
//     dataObjects.topLevelSpreadsheetData = { data: { sheets: null } };

//     await expect(getTabIdFromTitle('Some Title')).rejects.toThrow(
//       'Unable to fetch tab ID from title.'
//     );
//   });
// });

// jest.mock('../../index.js', () => ({
//   dataObjects: {
//     lastMonthSheetValues: [
//       [
//         {
//           data: {
//             range: "'Sheet1'!A1:Z1",
//             values: [['Metric1', 'Metric2', 'Metric3']],
//           },
//         },
//         {
//           data: {
//             range: "'Sheet2'!A1:Z1",
//             values: [['Header1', 'Header2', 'Header3']],
//           },
//         },
//       ],
//     ],
//   },
// }));

// describe('findMatchingColumnByTabId', () => {
//   it('should throw an error if sheetId is not a valid string', async () => {
//     await expect(findMatchingColumnByTabId('', ['Metric1'])).rejects.toThrow(
//       'Invalid sheetId: Expected a non-empty string.'
//     );
//     await expect(findMatchingColumnByTabId(null, ['Metric1'])).rejects.toThrow(
//       'Invalid sheetId: Expected a non-empty string.'
//     );
//   });

//   it('should throw an error if defaultHeaderMetrics is not a valid array', async () => {
//     await expect(findMatchingColumnByTabId('Sheet1', [])).rejects.toThrow(
//       'Invalid defaultHeaderMetrics: Expected a non-empty array.'
//     );
//     await expect(findMatchingColumnByTabId('Sheet1', null)).rejects.toThrow(
//       'Invalid defaultHeaderMetrics: Expected a non-empty array.'
//     );
//   });

//   it('should return the index of the matching column', async () => {
//     const sheetId = 'Sheet1';
//     const defaultHeaderMetrics = ['Metric2'];
//     const index = await findMatchingColumnByTabId(
//       sheetId,
//       defaultHeaderMetrics
//     );
//     expect(index).toBe(1);
//   });

//   it('should return null if no matching column is found', async () => {
//     const sheetId = 'Sheet2';
//     const defaultHeaderMetrics = ['Metric1'];
//     const index = await findMatchingColumnByTabId(
//       sheetId,
//       defaultHeaderMetrics
//     );
//     expect(index).toBeNull();
//   });

//   it('should throw an error if sheet data is not found or invalid', async () => {
//     dataObjects.lastMonthSheetValues[0] = [
//       {
//         data: {
//           range: "'InvalidSheet'!A1:Z1",
//           values: [],
//         },
//       },
//     ];
//     await expect(
//       findMatchingColumnByTabId('InvalidSheet', ['Metric1'])
//     ).rejects.toThrow(
//       'Sheet data not found or invalid for sheetId: InvalidSheet'
//     );
//   });

//   it('should handle errors during fetching tab ID', async () => {
//     dataObjects.lastMonthSheetValues[0] = null;
//     await expect(
//       findMatchingColumnByTabId('Sheet1', ['Metric1'])
//     ).rejects.toThrow('Unable to find matching column by tab ID.');
//   });
// });
// const FOOTER_ROW = ['', '', '', '', '', '-END-'];
// jest.mock('../../index.js', () => ({
//   dataObjects: {
//     lastMonthSheetValues: [
//       [
//         {
//           data: {
//             range: "'Sheet1'!A1:Z100",
//             values: [
//               ['Header1', 'Header2', 'Header3'],
//               ['Metric1', 'Metric2', 'Metric3'],
//               ['Data1', 'Data2', 'Data3'],
//               [FOOTER_ROW, 'Footer2', 'Footer3'],
//             ],
//           },
//         },
//         {
//           data: {
//             range: "'Sheet2'!A1:Z100",
//             values: [
//               ['HeaderA', 'HeaderB', 'HeaderC'],
//               ['MetricA', 'MetricB', 'MetricC'],
//               ['DataA', 'DataB', 'DataC'],
//               ['FooterA', 'FooterB', 'FooterC'],
//             ],
//           },
//         },
//       ],
//     ],
//   },
// }));

// describe('getHeaderAndFooterDataByTabTitle', () => {
//   it('should throw an error if sheetTitle is not a valid string', async () => {
//     await expect(getHeaderAndFooterDataByTabTitle('')).rejects.toThrow(
//       'Invalid sheetTitle: Expected a non-empty string.'
//     );
//     await expect(getHeaderAndFooterDataByTabTitle(null)).rejects.toThrow(
//       'Invalid sheetTitle: Expected a non-empty string.'
//     );
//   });

//   it('should return header and footer data for a valid sheet title', async () => {
//     const sheetTitle = 'Sheet1';
//     const result = await getHeaderAndFooterDataByTabTitle(sheetTitle);

//     expect(result).toEqual({
//       headerRow: 1,
//       footerRow: 4,
//       headerValues: ['Header1', 'Header2', 'Header3'],
//     });
//   });

//   it('should return null if no data is found for the sheet title', async () => {
//     const sheetTitle = 'NonExistentSheet';
//     const result = await getHeaderAndFooterDataByTabTitle(sheetTitle);

//     expect(result).toBeNull();
//   });

//   it('should handle errors during data retrieval', async () => {
//     const sheetTitle = 'SheetWithError';
//     dataObjects.lastMonthSheetValues[0] = null;
//     await expect(getHeaderAndFooterDataByTabTitle(sheetTitle)).rejects.toThrow(
//       'Unable to retrieve header and footer data.'
//     );
//   });
// });
