import { getFormulas } from './getFormulas';
import * as reportGeneration from './reportGenerationHelpers';
import { testResultData } from '../buildReportTestData';

describe('getFormulas', () => {
  it('should return the formulas object correctly', () => {
    const type = testResultData.testData1.type;
    const headerRowIndex = 1;
    const totalNumberOfRows = 10;
    const bodyRowCount = 8;
    const subjectColumn = 'A';
    const stateColumn = 'B';

    const result = getFormulas(
      type,
      headerRowIndex,
      totalNumberOfRows,
      bodyRowCount,
      subjectColumn,
      stateColumn
    );
    const mockFormulas = reportGeneration.buildFormulas(
      type,
      headerRowIndex,
      totalNumberOfRows,
      bodyRowCount,
      subjectColumn,
      stateColumn
    );

    expect(result).toEqual(mockFormulas);
  });

  it('should throw an error if type is not a string', () => {
    // @ts-ignore
    expect(() => getFormulas(123, 1, 10, 8, 'A', 'B')).toThrow(
      'Invalid input: Ensure all parameters are of the correct type.'
    );
  });

  it('should throw an error if headerRowIndex is not a number', () => {
    expect(() =>
      // @ts-ignore
      getFormulas(testResultData.testData1.type, '1', 10, 8, 'A', 'B')
    ).toThrow('Invalid input: Ensure all parameters are of the correct type.');
  });

  it('should throw an error if totalNumberOfRows is not a number', () => {
    expect(() =>
      // @ts-ignore
      getFormulas(testResultData.testData1.type, 1, '10', 8, 'A', 'B')
    ).toThrow('Invalid input: Ensure all parameters are of the correct type.');
  });

  it('should throw an error if bodyRowCount is not a number', () => {
    expect(() =>
      // @ts-ignore
      getFormulas(testResultData.testData1.type, 1, 10, '8', 'A', 'B')
    ).toThrow('Invalid input: Ensure all parameters are of the correct type.');
  });

  it('should throw an error if subjectColumn is not a string', () => {
    expect(() =>
      // @ts-ignore
      getFormulas(testResultData.testData1.type, 1, 10, 8, 123, 'B')
    ).toThrow('Invalid input: Ensure all parameters are of the correct type.');
  });

  it('should throw an error if stateColumn is not a string', () => {
    expect(() =>
      // @ts-ignore
      getFormulas(testResultData.testData1.type, 1, 10, 8, 'A', 123)
    ).toThrow('Invalid input: Ensure all parameters are of the correct type.');
  });
});
