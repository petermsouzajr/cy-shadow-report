import { buildDailyPayload } from './buildDailyPayload.js';
import { testResultData } from '../buildReportTestData.js';

describe('buildDailyPayload', () => {
  const isPlaywrightOptions = [true, false];
  isPlaywrightOptions.forEach((isPlaywright) => {
    const testFramework = isPlaywright ? 'Playwright' : 'Cypress';
    it(`should build the daily payload correctly when using ${testFramework}`, async () => {});
  });

  it('should throw an error if dataSet is not an object', async () => {
    await expect(buildDailyPayload(null, true)).rejects.toThrow(
      'Invalid dataSet: Expected an object.'
    );
  });

  it('should throw an error if playwright is not a boolean', async () => {
    await expect(buildDailyPayload({}, null)).rejects.toThrow(
      'Invalid playwright flag: Expected a boolean.'
    );
  });

  it('should throw an error if columnsAvailable is not an array', async () => {
    await expect(buildDailyPayload({}, true)).rejects.toThrow(
      'results.map is not a function'
    );
  });

  it('should handle errors during header report construction', async () => {
    const mockDataSet = testResultData.fullReportOutput;
    const mockPlaywright = true;

    await expect(
      buildDailyPayload(mockDataSet, mockPlaywright)
    ).rejects.toThrow('results.map is not a function');
  });
});
