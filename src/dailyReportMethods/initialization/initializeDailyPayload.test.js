import { initializeDailyPayload } from './initializeDailyPayload.js';
import { testResultData } from '../buildReportTestData.js';

describe('initializeDailyPayload', () => {
  it('should return an object with empty arrays for payload segments', () => {
    const payload = initializeDailyPayload();
    expect(payload).toEqual(testResultData.emptyDailyPayload);
  });
});
