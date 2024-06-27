import { testResultData } from '../buildReportTestData';
import { combineReports } from './combineReports';

describe('combineReports', () => {
  it('should combine multiple reports correctly', () => {
    const allReportEntries = [
      [
        ['A1', 'A2'],
        ['B1', 'B2'],
      ],
      [
        ['C1', 'C2'],
        ['D1', 'D2'],
      ],
    ];
    const placeholders = [
      ['P1', 'P2'],
      ['P3', 'P4'],
    ];

    const result = combineReports(allReportEntries, placeholders);

    expect(result).toEqual([
      ['A1', 'A2', 'C1', 'C2'],
      ['B1', 'B2', 'D1', 'D2'],
    ]);
  });

  it('should use placeholders for missing report entries', () => {
    const allReportEntries = [
      [
        ['A1', 'A2'],
        ['B1', 'B2'],
      ],
      [['C1', 'C2']],
    ];
    const placeholders = [
      ['P1', 'P2'],
      ['P3', 'P4'],
    ];

    const result = combineReports(allReportEntries, placeholders);

    expect(result).toEqual([
      ['A1', 'A2', 'C1', 'C2'],
      ['B1', 'B2', 'P3', 'P4'],
    ]);
  });

  it('should throw an error if allReportEntries is not an array', () => {
    expect(() =>
      combineReports(null, [
        ['P1', 'P2'],
        ['P3', 'P4'],
      ])
    ).toThrow(
      'Invalid input: Expected both allReportEntries and placeholders to be arrays.'
    );
  });

  it('should throw an error if placeholders is not an array', () => {
    expect(() =>
      combineReports(
        [
          [
            ['A1', 'A2'],
            ['B1', 'B2'],
          ],
        ],
        null
      )
    ).toThrow(
      'Invalid input: Expected both allReportEntries and placeholders to be arrays.'
    );
  });

  it('should throw an error if placeholders array has less than two elements', () => {});

  it('should throw an error if any report entry is not an array', () => {
    const invalidReportEntries = [
      [
        ['A1', 'A2'],
        ['B1', 'B2'],
      ],
      'InvalidEntry',
    ];
    const placeholders = [
      ['P1', 'P2'],
      ['P3', 'P4'],
    ];

    // @ts-ignore
    expect(() => combineReports(invalidReportEntries, placeholders)).toThrow(
      'Invalid report entry: Expected an array.'
    );
  });

  it('should handle errors during report combination', async () => {
    const invalidReportEntries = [
      [
        [testResultData.testData1.area, testResultData.testData1.spec],
        [testResultData.testData1.testName, testResultData.testData1.error],
      ],
      [null],
      [''],
    ];
    const placeholders = [
      [testResultData.testData2.area, testResultData.testData2.spec],
      [testResultData.testData2.testName, testResultData.testData2.error],
    ];

    // @ts-ignore
    const result = await combineReports(invalidReportEntries, placeholders);

    expect(result).toEqual([
      [
        testResultData.testData1.area,
        testResultData.testData1.spec,
        testResultData.testData2.area,
        testResultData.testData2.spec,
        testResultData.testData2.area,
        testResultData.testData2.spec,
      ],
      [
        testResultData.testData1.testName,
        testResultData.testData1.error,
        testResultData.testData2.testName,
        testResultData.testData2.error,
        testResultData.testData2.testName,
        testResultData.testData2.error,
      ],
    ]);
  });
});
