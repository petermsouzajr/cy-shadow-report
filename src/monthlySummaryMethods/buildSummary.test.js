// import {
//   getExistingTabTitlesInRange,
//   getTabIdFromTitle,
// } from '../google/sheetDataMethods/getSheetInfo';
// import { getLastMonthTabTitles } from '../google/sheetDataMethods/getLastMonthTabTitles';
// import {
//   fetchLastMonthTabValues,
//   findLongestHeaderWithinSeries,
//   getHeaderIndicatorsLength,
//   initializeReportColumnMetrics,
//   initializeReportPayload,
//   processSourceTabTitles,
// } from './summaryGenerationHelpers';
// import { constructPayloadForCopyPaste } from './buildSummary';

// jest.mock('../google/sheetDataMethods/getSheetInfo');
// jest.mock('../google/sheetDataMethods/getLastMonthTabTitles');
// jest.mock('./summaryGenerationHelpers');

describe('constructPayloadForCopyPaste', () => {
  //   beforeEach(() => {
  //     jest.clearAllMocks();
  //   });

  it('should construct payload successfully', async () => {
    //     const sourceTabTitles = ['2021-12-01', '2021-12-15'];
    //     const destinationTabTitle = 'Summary Jan 2022';
    //     getHeaderIndicatorsLength.mockReturnValue(5);
    //     getExistingTabTitlesInRange.mockResolvedValue(['2021-12-01', '2021-12-15']);
    //     fetchLastMonthTabValues.mockResolvedValue({
    //       '2021-12-01': { data: 'data for 2021-12-01' },
    //       '2021-12-15': { data: 'data for 2021-12-15' },
    //     });
    //     initializeReportPayload.mockReturnValue({});
    //     initializeReportColumnMetrics.mockReturnValue({ longestHeaderEnd: 0 });
    //     getTabIdFromTitle.mockResolvedValue(123);
    //     findLongestHeaderWithinSeries.mockResolvedValue(10);
    //     processSourceTabTitles.mockResolvedValue();
    //     const result = await constructPayloadForCopyPaste(
    //       sourceTabTitles,
    //       destinationTabTitle
    //     );
    //     expect(getHeaderIndicatorsLength).toHaveBeenCalled();
    //     expect(getExistingTabTitlesInRange).toHaveBeenCalled();
    //     expect(fetchLastMonthTabValues).toHaveBeenCalledWith([
    //       '2021-12-01',
    //       '2021-12-15',
    //     ]);
    //     expect(initializeReportPayload).toHaveBeenCalled();
    //     expect(initializeReportColumnMetrics).toHaveBeenCalledWith(5);
    //     expect(getTabIdFromTitle).toHaveBeenCalledWith(destinationTabTitle);
    //     expect(findLongestHeaderWithinSeries).toHaveBeenCalledWith(
    //       ['2021-12-01', '2021-12-15'],
    //       {
    //         '2021-12-01': { data: 'data for 2021-12-01' },
    //         '2021-12-15': { data: 'data for 2021-12-15' },
    //       },
    //       { longestHeaderEnd: 0 }
    //     );
    //     expect(processSourceTabTitles).toHaveBeenCalledWith(
    //       ['2021-12-01', '2021-12-15'],
    //       123,
    //       {},
    //       { longestHeaderEnd: 10 },
    //       destinationTabTitle,
    //       5
    //     );
    //     expect(result).toEqual({});
    //   });
    //   it('should handle errors and log them', async () => {
    //     const sourceTabTitles = ['2021-12-01', '2021-12-15'];
    //     const destinationTabTitle = 'Summary Jan 2022';
    //     getHeaderIndicatorsLength.mockReturnValue(5);
    //     getExistingTabTitlesInRange.mockRejectedValue(new Error('Test error'));
    //     await expect(
    //       constructPayloadForCopyPaste(sourceTabTitles, destinationTabTitle)
    //     ).rejects.toThrow('Error building copy-paste payload.');
    //     expect(global.console.error).toHaveBeenCalledWith(
    //       'Error building copy-paste payload:',
    //       expect.any(Error)
    //     );
  });
});
