import { getLastMonthTabTitles } from './getLastMonthTabTitles';
import {
  getFormattedMonth,
  getPreviousMonthsYear,
} from '../../sharedMethods/dateFormatting.js';

describe('getLastMonthTabTitles', () => {
  it('should return an array of titles matching last month and year', () => {});

  it('should return an empty array if no titles match the criteria', () => {
    // @ts-ignore
    const mockLastMonth = 'Apr';
    const mockLastMonthsYear = '2023';
    getFormattedMonth('May');
    getPreviousMonthsYear(mockLastMonthsYear);

    const existingTabTitles = ['Mar 31, 2023', 'Feb 28, 2023'];

    const result = getLastMonthTabTitles(existingTabTitles);
    expect(result).toEqual([]);
  });

  it('should throw an error if input is not an array', () => {
    // @ts-ignore
    expect(() => getLastMonthTabTitles('invalid input')).toThrow(
      'Invalid input: Expected an array of strings.'
    );
  });

  it('should throw an error if array contains non-string elements', () => {
    const existingTabTitles = ['Apr 1, 2023', 12345, 'Apr 15, 2023'];
    // @ts-ignore
    expect(() => getLastMonthTabTitles(existingTabTitles)).toThrow(
      'Invalid element at index 1: Expected a string.'
    );
  });

  it('should return an empty array if array is empty', () => {
    // @ts-ignore
    const mockLastMonth = 'Apr';
    const mockLastMonthsYear = '2023';
    getFormattedMonth('May');
    getPreviousMonthsYear(mockLastMonthsYear);

    const existingTabTitles = [];
    const result = getLastMonthTabTitles(existingTabTitles);
    expect(result).toEqual([]);
  });
});
