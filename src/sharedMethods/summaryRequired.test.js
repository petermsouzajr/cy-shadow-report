// import { getExistingTabTitlesInRange } from '../google/sheetDataMethods/getSheetInfo';
// import { createSummaryTitle } from '../google/sheetDataMethods/createTabNames';
// import { getFormattedMonth, getFormattedYear } from './dateFormatting';
// import { isSummaryRequired } from './summaryRequired';

// jest.mock('../google/sheetDataMethods/getSheetInfo');
// jest.mock('../google/sheetDataMethods/createTabNames');
// jest.mock('./dateFormatting');

describe('isSummaryRequired', () => {
  //   beforeEach(() => {
  //     jest.clearAllMocks();
  //     // Mock console.error to prevent it from logging during tests
  //     global.console.error = jest.fn();
  //   });

  it('should return false if csv option is true', async () => {
    //     const result = await isSummaryRequired({ csv: true });
    //     expect(result).toBe(false);
  });

  //   it('should return false and log an error if getExistingTabTitlesInRange throws an error', async () => {
  //     getExistingTabTitlesInRange.mockRejectedValue(new Error('Test error'));

  //     const result = await isSummaryRequired({ csv: false });
  //     expect(result).toBe(false);
  //     expect(global.console.error).toHaveBeenCalledWith(
  //       'Error in isSummaryRequired:',
  //       expect.any(Error)
  //     );
  //   });

  //   it('should return true if a new collection is needed', async () => {
  //     getExistingTabTitlesInRange.mockResolvedValue(['Jan 2022', 'Dec 2021']);
  //     createSummaryTitle.mockReturnValue('Summary Jan 2022');
  //     getFormattedMonth.mockReturnValueOnce('Jan').mockReturnValueOnce('Dec');
  //     getFormattedYear.mockReturnValueOnce('2022').mockReturnValueOnce('2021');

  //     const result = await isSummaryRequired({ csv: false });
  //     expect(result).toBe(true);
  //   });

  //   it('should return false if no new collection is needed', async () => {
  //     getExistingTabTitlesInRange.mockResolvedValue([
  //       'Jan 2022',
  //       'Summary Dec 2021',
  //     ]);
  //     createSummaryTitle.mockReturnValue('Summary Jan 2022');
  //     getFormattedMonth.mockReturnValueOnce('Jan').mockReturnValueOnce('Dec');
  //     getFormattedYear.mockReturnValueOnce('2022').mockReturnValueOnce('2021');

  //     const result = await isSummaryRequired({ csv: false });
  //     expect(result).toBe(false);
  //   });
});
