import { processTestSuites } from './processTestSuites.js';
import { testResultData } from '../buildReportTestData.js';

describe('processTestSuites', () => {
  const isPlaywrightOptions = [true, false];

  isPlaywrightOptions.forEach((isPlaywright) => {
    const testFramework = isPlaywright ? 'Playwright' : 'Cypress';

    it(`should process test suites and extract payload entries using ${testFramework}`, async () => {
      const expectedEntries = testResultData.expectedPayloadEntries.map(
        (entry, index) => ({
          ...entry,
          area: isPlaywright
            ? testResultData[`testData${index + 1}`].projectName
            : entry.area,
          error: isPlaywright
            ? testResultData[`testData${index + 1}`].error
            : entry.error,
        })
      );

      const dataSet = isPlaywright
        ? testResultData.playwrightFullReportOutput.results
        : testResultData.fullReportOutput.results;

      const payloadEntries = await processTestSuites(dataSet, isPlaywright);

      expect(payloadEntries).toEqual(expectedEntries);
    });
  });
});
