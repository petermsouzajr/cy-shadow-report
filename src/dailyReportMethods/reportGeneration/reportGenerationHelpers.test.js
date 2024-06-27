import {
  buildFormulas,
  constructHeaderRegex,
  createMergeQueries,
  determineSubjectColumn,
  generatePlaceholders,
  generateReport,
  generateReportEntry,
  generateStateReports,
  generateTeamReport,
  generateTypeReport,
  getKeysPattern,
} from './reportGenerationHelpers.js';
import { numberToLetter } from '../../sharedMethods/dataHandler.js';

describe('report generation helpers', () => {
  describe('generatePlaceholders', () => {
    it('should generate the correct number of placeholders', () => {
      const count = 3;
      const placeholders = generatePlaceholders(count);
      expect(placeholders).toEqual([
        ['', ''],
        ['', ''],
        ['', ''],
      ]);
    });

    it('should throw a TypeError if count is not a number', () => {
      // @ts-ignore
      expect(() => generatePlaceholders('3')).toThrow(
        'The count must be a number.'
      );
    });

    it('should throw a TypeError if count is not an integer', () => {
      expect(() => generatePlaceholders(3.5)).toThrow(
        'The count must be an integer.'
      );
    });

    it('should throw a TypeError if count is a negative number', () => {
      expect(() => generatePlaceholders(-1)).toThrow(
        'The count must be a non-negative integer.'
      );
    });

    it('should return an empty array if count is 0', () => {
      const placeholders = generatePlaceholders(0);
      expect(placeholders).toEqual([]);
    });
  });

  describe('generateReportEntry', () => {
    it('should create a report entry with valid inputs', () => {
      const title = 'Test Title';
      const formula = 'SUM(A1:A10)';
      const reportEntry = generateReportEntry(title, formula);
      expect(reportEntry).toEqual([title, formula]);
    });

    it('should throw a TypeError if title is not a string', () => {
      // @ts-ignore
      expect(() => generateReportEntry(123, 'SUM(A1:A10)')).toThrow(
        'Title must be a string.'
      );
    });

    it('should throw an Error if title is an empty string', () => {
      expect(() => generateReportEntry('', 'SUM(A1:A10)')).toThrow(
        'Title cannot be an empty string.'
      );
    });

    it('should throw a TypeError if formula is not a string', () => {
      // @ts-ignore
      expect(() => generateReportEntry('Test Title', 123)).toThrow(
        'Formula must be a string.'
      );
    });

    it('should throw an Error if formula is an empty string', () => {
      expect(() => generateReportEntry('Test Title', '')).toThrow(
        'Formula cannot be an empty string.'
      );
    });
  });

  describe('generateStateReports', () => {
    it('should generate report entries with valid inputs', () => {
      const defaultHeaderMetrics = [
        '# Total tests',
        '# Passed tests',
        '# Failed tests',
      ];
      const index = 0;
      const reports = generateStateReports(defaultHeaderMetrics, index);
      expect(reports).toEqual([
        ['# Total tests', 'Total formula base'],
        ['# Passed tests', 'Total formula base'],
        ['# Failed tests', 'Total formula base'],
      ]);
    });

    it('should throw a TypeError if defaultHeaderMetrics is not an array', () => {
      // @ts-ignore
      expect(() => generateStateReports('not an array', 0)).toThrow(
        'defaultHeaderMetrics must be an array of strings.'
      );
    });

    it('should throw a TypeError if defaultHeaderMetrics contains non-string elements', () => {
      // @ts-ignore
      expect(() => generateStateReports([1, 2, 3], 0)).toThrow(
        'Each item in defaultHeaderMetrics must be a string.'
      );
    });

    it('should throw a TypeError if index is not a number', () => {
      // @ts-ignore
      expect(() =>
        // @ts-ignore
        generateStateReports(['# Total tests'], 'not a number')
      ).toThrow('index must be an integer.');
    });

    it('should throw a RangeError if index is out of bounds', () => {
      expect(() => generateStateReports(['# Total tests'], 1)).toThrow(
        'index is out of bounds for defaultHeaderMetrics.'
      );
    });

    it('should throw a TypeError if the extracted type is not a string', () => {
      expect(() => generateStateReports(['#  tests'], 0)).toThrow(
        'The extracted type must be a non-empty string.'
      );
    });
  });

  describe('generateTeamReport', () => {
    it('should generate a report entry with a valid type', () => {
      const type = 'Team Alpha';
      const reportEntry = generateTeamReport(type);
      expect(reportEntry).toEqual([
        '# Team Alpha tests passed',
        'Team Alpha formula tests passed',
      ]);
    });

    it('should throw a TypeError if type is not a string', () => {
      // @ts-ignore
      expect(() => generateTeamReport(123)).toThrow(
        'Type must be a non-empty string.'
      );
    });

    it('should throw a TypeError if type is an empty string', () => {
      expect(() => generateTeamReport('')).toThrow(
        'Type must be a non-empty string.'
      );
    });

    it('should throw a TypeError if type is a string with only whitespace', () => {
      expect(() => generateTeamReport('   ')).toThrow(
        'Type must be a non-empty string.'
      );
    });
  });

  describe('generateTypeReport', () => {
    it('should generate report entries with a valid type', () => {
      const type = 'Unit';
      const reportEntries = generateTypeReport(type);
      expect(reportEntries).toEqual([
        ['# Unit tests passed', 'Unit formula tests passed'],
      ]);
    });

    it('should throw a TypeError if type is not a string', () => {
      // @ts-ignore
      expect(() => generateTypeReport(123)).toThrow(
        'Type must be a non-empty string.'
      );
    });

    it('should throw a TypeError if type is an empty string', () => {
      expect(() => generateTypeReport('')).toThrow(
        'Type must be a non-empty string.'
      );
    });

    it('should throw a TypeError if type is a string with only whitespace', () => {
      expect(() => generateTypeReport('   ')).toThrow(
        'Type must be a non-empty string.'
      );
    });
  });

  describe('generateReport', () => {
    it('should generate a report with valid inputs', () => {
      const types = ['Unit', 'Integration'];
      const payload = [
        ['Unit', 'Test 1', 'Passed'],
        ['Integration', 'Test 2', 'Failed'],
        ['Unit', 'Test 3', 'Passed'],
      ];
      const searchIndex = 0;
      const isTeam = false;
      const report = generateReport(types, payload, searchIndex, isTeam);
      expect(report).toEqual([
        ['# Unit tests passed', 'Unit formula tests passed'],
        ['# Integration tests passed', 'Integration formula tests passed'],
      ]);
    });

    it('should throw an error if types is not an array', () => {
      // @ts-ignore
      expect(() => generateReport('not an array', [], 0)).toThrow(
        'Types must be an array.'
      );
    });

    it('should throw an error if types contains non-string elements', () => {
      // @ts-ignore
      expect(() => generateReport([123], [], 0)).toThrow(
        'All types must be strings.'
      );
    });

    it('should throw an error if payload is not an array', () => {
      // @ts-ignore
      expect(() => generateReport([], 'not an array', 0)).toThrow(
        'Payload must be an array.'
      );
    });

    it('should throw an error if searchIndex is not a non-negative integer', () => {
      expect(() => generateReport([], [], -1)).toThrow(
        'SearchIndex must be a non-negative integer.'
      );
    });

    it('should throw an error if isTeam is not a boolean', () => {
      // @ts-ignore
      expect(() => generateReport([], [], 0, 'not a boolean')).toThrow(
        'isTeam must be a boolean.'
      );
    });

    it('should handle empty types array gracefully', () => {
      const report = generateReport([], [['Unit', 'Test 1']], 0);
      expect(report).toEqual([]);
    });

    it('should handle empty payload gracefully', () => {
      const report = generateReport(['Unit'], [], 0);
      expect(report).toEqual([]);
    });

    it('should handle payload items without the type gracefully', () => {
      const types = ['Unit'];
      const payload = [['Integration', 'Test 2', 'Failed']];
      const report = generateReport(types, payload, 0);
      expect(report).toEqual([]);
    });
  });

  describe('buildFormulas', () => {
    const validType = 'testType';
    const validHeaderRowIndex = 1;
    const validTotalNumberOfRows = 10;
    const validBodyRowCount = 9;
    const validSubjectColumn = 'A';
    const validStateColumn = 'B';

    const mockConstants = {
      FORMULA_TEMPLATES: [
        '=COUNTIFS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "*{type}*")&" ("&ROUND(COUNTIFS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "*{type}*")/{bodyRowCount} * 100)&"%)"',
        '=COUNTIFS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "<>*passed*", {stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "<>*failed*")&" ("&ROUND(COUNTIFS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "<>*passed*", {stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "<>*failed*")/{bodyRowCount} * 100)&"%)"',
        '=COUNTIFS({subjectColumn}{headerRowIndex}:{subjectColumn}{totalNumberOfRows}, "*{type}*", {stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "passed")&" of "&COUNTIFS({subjectColumn}{headerRowIndex}:{subjectColumn}{totalNumberOfRows}, "*{type}*")&"  -  "&"("&ROUND(COUNTIFS({subjectColumn}{headerRowIndex}:{subjectColumn}{totalNumberOfRows}, "*{type}*", {stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows}, "passed")/(COUNTIFS({subjectColumn}{headerRowIndex}:{subjectColumn}{totalNumberOfRows}, "*{type}*")) * 100)&"%)"',
        '=ROWS({stateColumn}{headerRowIndex}:{stateColumn}{totalNumberOfRows})',
      ],
      FORMULA_KEYS: [
        'formula base',
        'formula skipped/pending',
        'formula tests passed',
        'formula total',
      ],
    };

    it('should create formulas correctly', () => {
      const formulas = buildFormulas(
        validType,
        validHeaderRowIndex,
        validTotalNumberOfRows,
        validBodyRowCount,
        validSubjectColumn,
        validStateColumn,
        mockConstants
      );
      expect(formulas).toBeInstanceOf(Object);
      expect(formulas).toEqual({
        'formula base':
          '=COUNTIFS(B1:B10, "*testType*")&" ("&ROUND(COUNTIFS(B1:B10, "*testType*")/9 * 100)&"%)"',
        'formula skipped/pending':
          '=COUNTIFS(B1:B10, "<>*passed*", B1:B10, "<>*failed*")&" ("&ROUND(COUNTIFS(B1:B10, "<>*passed*", B1:B10, "<>*failed*")/9 * 100)&"%)"',
        'formula tests passed':
          '=COUNTIFS(A1:A10, "*testType*", B1:B10, "passed")&" of "&COUNTIFS(A1:A10, "*testType*")&"  -  "&"("&ROUND(COUNTIFS(A1:A10, "*testType*", B1:B10, "passed")/(COUNTIFS(A1:A10, "*testType*")) * 100)&"%)"',
        'formula total': '=ROWS(B1:B10)',
      });
    });

    it('throws error for invalid type', () => {
      // @ts-ignore
      expect(() =>
        buildFormulas(
          // @ts-ignore
          123,
          validHeaderRowIndex,
          validTotalNumberOfRows,
          validBodyRowCount,
          validSubjectColumn,
          validStateColumn,
          mockConstants
        )
      ).toThrow('Type must be a string.');
    });

    it('throws error for invalid headerRowIndex', () => {
      expect(() =>
        buildFormulas(
          validType,
          -1,
          validTotalNumberOfRows,
          validBodyRowCount,
          validSubjectColumn,
          validStateColumn,
          mockConstants
        )
      ).toThrow('Header row index must be a positive integer.');
      // @ts-ignore
      expect(() =>
        buildFormulas(
          validType,
          // @ts-ignore
          '1',
          validTotalNumberOfRows,
          validBodyRowCount,
          validSubjectColumn,
          validStateColumn,
          mockConstants
        )
      ).toThrow('Header row index must be a positive integer.');
    });

    it('throws error for invalid totalNumberOfRows', () => {
      expect(() =>
        buildFormulas(
          validType,
          validHeaderRowIndex,
          0,
          validBodyRowCount,
          validSubjectColumn,
          validStateColumn,
          mockConstants
        )
      ).toThrow(
        'Total number of rows must be an integer greater than header row index.'
      );
      // @ts-ignore
      expect(() =>
        buildFormulas(
          validType,
          validHeaderRowIndex,
          // @ts-ignore
          '10',
          validBodyRowCount,
          validSubjectColumn,
          validStateColumn,
          mockConstants
        )
      ).toThrow(
        'Total number of rows must be an integer greater than header row index.'
      );
    });

    it('throws error for invalid bodyRowCount', () => {
      expect(() =>
        buildFormulas(
          validType,
          validHeaderRowIndex,
          validTotalNumberOfRows,
          0,
          validSubjectColumn,
          validStateColumn,
          mockConstants
        )
      ).toThrow('Body row count must be a positive integer.');
      // @ts-ignore
      expect(() =>
        buildFormulas(
          validType,
          validHeaderRowIndex,
          validTotalNumberOfRows,
          // @ts-ignore
          '9',
          validSubjectColumn,
          validStateColumn,
          mockConstants
        )
      ).toThrow('Body row count must be a positive integer.');
    });

    it('throws error for invalid subjectColumn', () => {
      expect(() =>
        buildFormulas(
          validType,
          validHeaderRowIndex,
          validTotalNumberOfRows,
          validBodyRowCount,
          '',
          validStateColumn,
          mockConstants
        )
      ).toThrow('Subject column must be a non-empty string.');
      // @ts-ignore
      expect(() =>
        buildFormulas(
          validType,
          validHeaderRowIndex,
          validTotalNumberOfRows,
          validBodyRowCount,
          // @ts-ignore
          123,
          validStateColumn,
          mockConstants
        )
      ).toThrow('Subject column must be a non-empty string.');
    });

    it('throws error for invalid stateColumn', () => {
      expect(() =>
        buildFormulas(
          validType,
          validHeaderRowIndex,
          validTotalNumberOfRows,
          validBodyRowCount,
          validSubjectColumn,
          '',
          mockConstants
        )
      ).toThrow('State column must be a non-empty string.');
      // @ts-ignore
      expect(() =>
        buildFormulas(
          validType,
          validHeaderRowIndex,
          validTotalNumberOfRows,
          validBodyRowCount,
          validSubjectColumn,
          // @ts-ignore
          123,
          mockConstants
        )
      ).toThrow('State column must be a non-empty string.');
    });

    it('throws error if FORMULA_TEMPLATES is not an array', () => {
      const invalidConstants = {
        ...mockConstants,
        FORMULA_TEMPLATES: 'not an array',
      };
      // @ts-ignore
      expect(() =>
        buildFormulas(
          validType,
          validHeaderRowIndex,
          validTotalNumberOfRows,
          validBodyRowCount,
          validSubjectColumn,
          validStateColumn,
          // @ts-ignore
          invalidConstants
        )
      ).toThrow('FORMULA_TEMPLATES must be a non-empty array.');
    });

    it('throws error if FORMULA_KEYS is not an array', () => {
      const invalidConstants = {
        ...mockConstants,
        FORMULA_KEYS: 'not an array',
      };
      // @ts-ignore
      expect(() =>
        buildFormulas(
          validType,
          validHeaderRowIndex,
          validTotalNumberOfRows,
          validBodyRowCount,
          validSubjectColumn,
          validStateColumn,
          // @ts-ignore
          invalidConstants
        )
      ).toThrow('FORMULA_KEYS must be a non-empty array.');
    });

    it('throws error if FORMULA_TEMPLATES and FORMULA_KEYS have different lengths', () => {
      const invalidConstants = {
        FORMULA_TEMPLATES: ['template1'],
        FORMULA_KEYS: ['key1', 'key2'],
      };
      expect(() =>
        buildFormulas(
          validType,
          validHeaderRowIndex,
          validTotalNumberOfRows,
          validBodyRowCount,
          validSubjectColumn,
          validStateColumn,
          invalidConstants
        )
      ).toThrow(
        'FORMULA_TEMPLATES and FORMULA_KEYS arrays must have the same length.'
      );
    });
  });

  describe('constructHeaderRegex', () => {
    it('should return a RegExp when getKeysPattern returns a valid pattern', () => {
      const getKeysPattern = () => 'key1|key2|key3';
      const regex = constructHeaderRegex(getKeysPattern);
      expect(regex).toBeInstanceOf(RegExp);
      expect(regex.source).toEqual('(.+) (key1|key2|key3)$');
    });

    it('should throw an error if getKeysPattern returns a non-string value', () => {
      const getKeysPattern = () => 123;
      expect(() => constructHeaderRegex(getKeysPattern)).toThrow(
        'The keys pattern must be a non-empty string.'
      );
    });

    it('should throw an error if getKeysPattern returns an empty string', () => {
      const getKeysPattern = () => '';
      expect(() => constructHeaderRegex(getKeysPattern)).toThrow(
        'The keys pattern must be a non-empty string.'
      );
    });

    it('should throw an error if getKeysPattern returns a string with only whitespace', () => {
      const getKeysPattern = () => '   ';
      expect(() => constructHeaderRegex(getKeysPattern)).toThrow(
        'The keys pattern must be a non-empty string.'
      );
    });

    it('should work correctly with a single key pattern', () => {
      const getKeysPattern = () => 'singleKey';
      const regex = constructHeaderRegex(getKeysPattern);
      expect(regex).toBeInstanceOf(RegExp);
      expect(regex.source).toEqual('(.+) (singleKey)$');
    });

    it('should work correctly with multiple keys pattern', () => {
      const getKeysPattern = () => 'key1|key2|key3';
      const regex = constructHeaderRegex(getKeysPattern);
      expect(regex).toBeInstanceOf(RegExp);
      expect(regex.source).toEqual('(.+) (key1|key2|key3)$');
    });

    it('should throw an error if getKeysPattern returns undefined', () => {
      const getKeysPattern = () => undefined;
      expect(() => constructHeaderRegex(getKeysPattern)).toThrow(
        'The keys pattern must be a non-empty string.'
      );
    });

    it('should throw an error if getKeysPattern returns null', () => {
      const getKeysPattern = () => null;
      expect(() => constructHeaderRegex(getKeysPattern)).toThrow(
        'The keys pattern must be a non-empty string.'
      );
    });
  });

  describe('determineSubjectColumn', () => {
    const mockConstants = {
      TEST_CATEGORIES_AVAILABLE: () => ['category1', 'category2'],
      TEST_TYPES_AVAILABLE: () => ['type1', 'type2'],
    };
    const mockNumberToLetter = numberToLetter;
    const columnsAvailable = ['team', 'type', 'category'];

    it('should return the correct column letter for a category type', () => {
      const result = determineSubjectColumn(
        'category1',
        columnsAvailable,
        mockNumberToLetter,
        mockConstants
      );
      expect(result).toBe('C'); // Assuming numberToLetter works as expected
    });

    it('should return the correct column letter for a type', () => {
      const result = determineSubjectColumn(
        'type1',
        columnsAvailable,
        mockNumberToLetter,
        mockConstants
      );
      expect(result).toBe('B'); // Assuming numberToLetter works as expected
    });

    it('should return the correct column letter for a team type', () => {
      const result = determineSubjectColumn(
        'teamType',
        columnsAvailable,
        mockNumberToLetter,
        mockConstants
      );
      expect(result).toBe('A'); // Assuming numberToLetter works as expected
    });

    it('should throw an error if type is not a string', () => {
      // @ts-ignore
      expect(() =>
        determineSubjectColumn(
          // @ts-ignore
          123,
          columnsAvailable,
          mockNumberToLetter,
          mockConstants
        )
      ).toThrow('Type must be a string.');
    });

    it('should throw an error if columnsAvailable is not an array', () => {
      // @ts-ignore
      expect(() =>
        determineSubjectColumn(
          'type1',
          // @ts-ignore
          'not an array',
          mockNumberToLetter,
          mockConstants
        )
      ).toThrow('columnsAvailable must be an array.');
    });

    it('should throw an error if numberToLetter is not a function', () => {
      // @ts-ignore
      expect(() =>
        determineSubjectColumn(
          'type1',
          columnsAvailable,
          // @ts-ignore
          'not a function',
          mockConstants
        )
      ).toThrow('numberToLetter must be a function.');
    });

    it('should throw an error if constants do not include required functions', () => {
      const invalidConstants = {
        TEST_CATEGORIES_AVAILABLE: 'not a function',
        TEST_TYPES_AVAILABLE: () => ['type1', 'type2'],
      };
      // @ts-ignore
      expect(() =>
        determineSubjectColumn(
          'type1',
          columnsAvailable,
          mockNumberToLetter,
          // @ts-ignore
          invalidConstants
        )
      ).toThrow(
        'Constants must include TEST_CATEGORIES_AVAILABLE and TEST_TYPES_AVAILABLE functions.'
      );
    });

    it('should throw an error if TEST_TYPES_AVAILABLE does not return an array of strings', () => {
      const invalidConstants = {
        TEST_CATEGORIES_AVAILABLE: () => ['category1', 'category2'],
        TEST_TYPES_AVAILABLE: () => 'not an array',
      };
      expect(() =>
        determineSubjectColumn(
          'type1',
          columnsAvailable,
          mockNumberToLetter,
          invalidConstants
        )
      ).toThrow('TEST_TYPES_AVAILABLE must return an array of strings.');
    });

    it('should throw an error if TEST_CATEGORIES_AVAILABLE does not return an array of strings', () => {
      const invalidConstants = {
        TEST_CATEGORIES_AVAILABLE: () => 'not an array',
        TEST_TYPES_AVAILABLE: () => ['type1', 'type2'],
      };
      expect(() =>
        determineSubjectColumn(
          'type1',
          columnsAvailable,
          mockNumberToLetter,
          invalidConstants
        )
      ).toThrow('TEST_CATEGORIES_AVAILABLE must return an array of strings.');
    });
  });

  describe('getKeysPattern', () => {
    it('should return a valid regex pattern when FORMULA_KEYS is a valid array of strings', () => {
      const constants = { FORMULA_KEYS: ['key1', 'key2', 'key3'] };
      const pattern = getKeysPattern(constants);
      expect(pattern).toBe('(key1)|(key2)|(key3)');
    });

    it('should throw an error if FORMULA_KEYS is not an array', () => {
      const constants = { FORMULA_KEYS: 'not an array' };
      // @ts-ignore
      expect(() => getKeysPattern(constants)).toThrow(
        'FORMULA_KEYS must be an array.'
      );
    });

    it('should throw an error if FORMULA_KEYS contains non-string elements', () => {
      const constants = { FORMULA_KEYS: ['key1', 123, 'key3'] };
      // @ts-ignore
      expect(() => getKeysPattern(constants)).toThrow(
        'FORMULA_KEYS must be an array of strings.'
      );
    });

    it('should throw an error if FORMULA_KEYS is undefined', () => {
      const constants = {};
      // @ts-ignore
      expect(() => getKeysPattern(constants)).toThrow(
        'FORMULA_KEYS must be an array.'
      );
    });

    it('should return an empty string if FORMULA_KEYS is an empty array', () => {
      const constants = { FORMULA_KEYS: [] };
      const pattern = getKeysPattern(constants);
      expect(pattern).toBe('');
    });

    it('should throw an error if FORMULA_KEYS is not provided', () => {
      // @ts-ignore
      expect(() => getKeysPattern('')).toThrow(
        'FORMULA_KEYS must be an array.'
      );
    });
  });

  describe('createMergeQueries', () => {
    const validData = [
      ['A1', 'B1'],
      ['A1', 'B2'],
      ['A2', 'B2'],
    ];
    const validHeaderRowIndex = 1;
    const validSheetId = 12345;

    it('should create a valid requestBody for batch updating merges', () => {
      const requestBody = createMergeQueries(
        validData,
        validHeaderRowIndex,
        validSheetId
      );
      expect(requestBody).toBeInstanceOf(Object);
      expect(requestBody).toHaveProperty('requests');
      expect(Array.isArray(requestBody.requests)).toBe(true);
    });

    it('should throw an error if data is not a 2D array of strings', () => {
      // @ts-ignore
      expect(() =>
        // @ts-ignore
        createMergeQueries('not an array', validHeaderRowIndex, validSheetId)
      ).toThrow('Data must be a 2D array of strings.');
      // @ts-ignore
      expect(() =>
        // @ts-ignore
        createMergeQueries([['A1', 123]], validHeaderRowIndex, validSheetId)
      ).toThrow('Data must be a 2D array of strings.');
    });

    it('should throw an error if headerRowIndex is not a non-negative integer', () => {
      expect(() => createMergeQueries(validData, -1, validSheetId)).toThrow(
        'Header row index must be a non-negative integer.'
      );
      // @ts-ignore
      expect(() =>
        // @ts-ignore
        createMergeQueries(validData, 'not a number', validSheetId)
      ).toThrow('Header row index must be a non-negative integer.');
    });

    it('should throw an error if sheetId is not a non-negative integer', () => {
      expect(() =>
        createMergeQueries(validData, validHeaderRowIndex, -1)
      ).toThrow('Sheet ID must be a non-negative integer.');
      // @ts-ignore
      expect(() =>
        // @ts-ignore
        createMergeQueries(validData, validHeaderRowIndex, 'not a number')
      ).toThrow('Sheet ID must be a non-negative integer.');
    });

    it('should handle edge cases with no merges required', () => {
      const dataWithNoMerges = [
        ['A1', 'B1'],
        ['A2', 'B2'],
      ];
      const requestBody = createMergeQueries(
        dataWithNoMerges,
        validHeaderRowIndex,
        validSheetId
      );
      expect(requestBody.requests.length).toBe(0);
    });

    it('should handle single column data', () => {
      const singleColumnData = [['A1'], ['A1'], ['A2']];
      const requestBody = createMergeQueries(
        singleColumnData,
        validHeaderRowIndex,
        validSheetId
      );
      expect(requestBody.requests).toBeInstanceOf(Array);
      expect(requestBody.requests.length).toBeGreaterThan(0);
    });

    it('should handle empty data array', () => {
      const emptyData = [];
      const requestBody = createMergeQueries(
        emptyData,
        validHeaderRowIndex,
        validSheetId
      );
      expect(requestBody.requests.length).toBe(0);
    });
  });
});
