import { processHeaderWithFormulas } from './processHeaderWithFormulas';
import { testResultData } from '../buildReportTestData';

describe('processHeaderWithFormulas', () => {
  it('should apply formulas to the header payload correctly', () => {
    const headerPayload = testResultData.unappendedHeaderPayload;
    const headerRowIndex = 1;
    const totalNumberOfRows = 10;
    const bodyRowCount = 8;
    const playwright = true;

    processHeaderWithFormulas(
      headerPayload,
      headerRowIndex,
      totalNumberOfRows,
      bodyRowCount,
      playwright
    );

    expect(headerPayload).toEqual(testResultData.unappendedHeaderPayload);
  });

  it('should throw an error if headerPayload is not an array', () => {
    expect(() => processHeaderWithFormulas(null, 1, 10, 8, true)).toThrow(
      'Invalid headerPayload: Expected an array of arrays.'
    );
  });

  it('should throw an error if headerRowIndex is not a number', () => {
    // @ts-ignore
    expect(() => processHeaderWithFormulas([[]], '1', 10, 8, true)).toThrow(
      'Invalid row or count values: Expected numbers.'
    );
  });

  it('should throw an error if totalNumberOfRows is not a number', () => {
    // @ts-ignore
    expect(() => processHeaderWithFormulas([[]], 1, '10', 8, true)).toThrow(
      'Invalid row or count values: Expected numbers.'
    );
  });

  it('should throw an error if bodyRowCount is not a number', () => {
    // @ts-ignore
    expect(() => processHeaderWithFormulas([[]], 1, 10, '8', true)).toThrow(
      'Invalid row or count values: Expected numbers.'
    );
  });

  it('should throw an error if playwright is not a boolean', () => {
    expect(() => processHeaderWithFormulas([[]], 1, 10, 8, null)).toThrow(
      'Invalid playwright value: Expected a boolean.'
    );
  });

  it('should handle errors during formula generation', () => {
    const headerPayload = [
      ['Header1', 'Header2 {key}'],
      ['Header3', { Header4: 'key' }],
    ];
    const headerRowIndex = 1;
    const totalNumberOfRows = 10;
    const bodyRowCount = 8;
    const playwright = true;

    expect(() =>
      processHeaderWithFormulas(
        // @ts-ignore
        headerPayload,
        headerRowIndex,
        totalNumberOfRows,
        bodyRowCount,
        playwright
      )
    ).toThrow('Failed to process header with formulas:');
  });

  it('should throw an error if no formula is found for a key', () => {
    const headerPayload = [
      ['# passed tests', '# passed tests'],
      ['Header3', { 'Header4 passed': 'key' }],
    ];
    const headerRowIndex = 1;
    const totalNumberOfRows = 10;
    const bodyRowCount = 8;
    const playwright = true;

    expect(() =>
      processHeaderWithFormulas(
        // @ts-ignore
        headerPayload,
        headerRowIndex,
        totalNumberOfRows,
        bodyRowCount,
        playwright
      )
    ).toThrow('Failed to process header with formulas:');
  });

  const headerPayloads = [
    ['Header1', '{invalidKey}'],
    ['Header3', '{anotherInvalidKey}'],
  ];

  headerPayloads.forEach((headerPayload, index) => {
    it(`should throw an error if no formula is found for a key - Case ${index + 1}`, () => {
      const headerRowIndex = 1;
      const totalNumberOfRows = 10;
      const bodyRowCount = 8;
      const playwright = true;

      expect(() =>
        processHeaderWithFormulas(
          // @ts-ignore
          headerPayload,
          headerRowIndex,
          totalNumberOfRows,
          bodyRowCount,
          playwright
        )
      ).toThrow('Failed to process header with formulas:');
    });
  });
});
