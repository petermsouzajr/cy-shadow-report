import { jest } from '@jest/globals';
import { createSummaryTitle } from './createTabNames.js';
import * as dateFormatting from '../../sharedMethods/dateFormatting.js';

// Spy on the original functions
jest.mock('../../sharedMethods/dateFormatting.js', () => {
  return {
    getFormattedMonth: jest.fn(),
    getPreviousMonthsYear: jest.fn(),
  };
});

describe('createSummaryTitle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a summary title based on the previous month and year', () => {
    // Mock implementations
    dateFormatting.getFormattedMonth.mockImplementation((when) => {
      const date = new Date('2023-03-01T00:00:00Z'); // Fixed date for test consistency
      if (when === 'lastMonth') {
        date.setMonth(date.getMonth() - 1);
      }
      return date.toLocaleString('default', { month: 'short' });
    });

    dateFormatting.getPreviousMonthsYear.mockImplementation(() => {
      const date = new Date('2023-03-01T00:00:00Z'); // Fixed date for test consistency
      const month = date.toLocaleString('default', { month: 'short' });
      return month === 'Jan' ? date.getFullYear() - 1 : date.getFullYear();
    });

    // Using mocks in the function call
    const expectedMonth = dateFormatting.getFormattedMonth('lastMonth');
    const expectedYear = dateFormatting.getPreviousMonthsYear();
    const title = createSummaryTitle(
      // @ts-ignore
      dateFormatting.getFormattedMonth,
      dateFormatting.getPreviousMonthsYear
    );
    expect(title).toBe(`Summary ${expectedMonth} ${expectedYear}`);
  });

  it('should throw an error if date formatting fails', () => {
    dateFormatting.getFormattedMonth.mockReturnValue(null);
    dateFormatting.getPreviousMonthsYear.mockReturnValue(null);

    // Wrap the function call in a try-catch block
    try {
      // @ts-ignore
      createSummaryTitle(
        dateFormatting.getFormattedMonth,
        dateFormatting.getPreviousMonthsYear
      );
      // Fail the test if no error is thrown
      expect(true).toBe(true);
    } catch (error) {
      expect(error.message).toBe(
        'Could not generate summary title due to date formatting error.'
      );
    }
  });
  // Additional tests can be added here for other scenarios or edge cases.
});
