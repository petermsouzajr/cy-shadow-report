import {
  extractAreaFromFullFile,
  extractCategoryFromTest,
  extractSpecFromFullFile,
  extractTeamNameFromTest,
  extractTestNameFromFullTitle,
  extractManualTestCaseIdFromTest,
  extractTypeFromFullFile,
} from './dataExtractionUtilities';

describe('Extraction Functions', () => {
  describe('extractAreaFromFullFile', () => {
    it('should correctly extract the area from a full file path', async () => {
      const typesAvailable = ['unit', 'integration', 'e2e'];
      const fullFilePath = 'src/tests/unit/cart/shopping.spec.ts';
      const expectedArea = 'cart';
      const result = await extractAreaFromFullFile(
        fullFilePath,
        typesAvailable
      );
      expect(result).toEqual(expectedArea);
    });

    it('should throw an error if fullFile is not a string', async () => {
      const typesAvailable = ['unit', 'integration', 'e2e'];
      const invalidFullFile = 12345; // Not a string
      await expect(
        // @ts-ignore
        extractAreaFromFullFile(invalidFullFile, typesAvailable)
      ).rejects.toThrow('The "fullFile" argument must be a string.');
    });

    it('should throw an error if testTypesAvailable is not an array', async () => {
      const fullFilePath = 'src/tests/unit/cart/shopping.spec.ts';
      const invalidTypesAvailable = 'invalidType'; // Not an array
      await expect(
        // @ts-ignore
        extractAreaFromFullFile(fullFilePath, invalidTypesAvailable)
      ).rejects.toThrow(
        'The "testTypesAvailable" argument must be an array of strings.'
      );
    });

    it('should return an empty string if the area does not match any available types', async () => {
      const typesAvailable = ['validArea'];
      const fullFilePath = 'path/area';
      const result = await extractAreaFromFullFile(
        fullFilePath,
        typesAvailable
      );
      expect(result).toEqual('');
    });

    it('should handle paths with multiple valid areas correctly', async () => {
      const typesAvailable = ['unit', 'integration', 'e2e'];
      const fullFilePath = 'path/to/valid/area/with/multiple/segments';
      const expectedArea = 'valid/area/with/multiple';
      const result = await extractAreaFromFullFile(
        fullFilePath,
        typesAvailable
      );
      expect(result).toEqual(expectedArea);
    });

    it('should ignore the last segment of the path', async () => {
      const typesAvailable = ['unit', 'integration', 'e2e'];
      const fullFilePath = 'root/level1/level2/area/file.spec.js';
      const expectedArea = 'level2/area';
      const result = await extractAreaFromFullFile(
        fullFilePath,
        typesAvailable
      );
      expect(result).toEqual(expectedArea);
    });

    it('should handle paths with no areas to extract', async () => {
      const typesAvailable = ['unit', 'integration', 'e2e'];
      const fullFilePath = 'root/onlyRootLevel.spec.js';
      const result = await extractAreaFromFullFile(
        fullFilePath,
        typesAvailable
      );
      expect(result).toEqual('');
    });

    it('should correctly filter out segments matching test types', async () => {
      const typesAvailable = ['typeToExclude', 'anotherType'];
      const fullFilePath = 'root/typeToExclude/anotherType/area/file.spec.js';
      const expectedArea = 'area';
      const result = await extractAreaFromFullFile(
        fullFilePath,
        typesAvailable
      );
      expect(result).toEqual(expectedArea);
    });

    it('should correctly handle a valid path but an empty testTypesAvailable array', async () => {
      const fullFilePath = 'root/level1/level2/area/file.spec.js';
      const expectedArea = 'level2/area';
      const result = await extractAreaFromFullFile(fullFilePath, []);
      expect(result).toEqual(expectedArea);
    });
  });

  describe('extractCategoryFromTest', () => {
    it('should correctly extract the category from a test title', () => {
      const categoriesAvailable = ['functional', 'performance', 'regression'];
      const test = { fullTitle: '[functional] Add items to cart - [C12345]' };
      const result = extractCategoryFromTest(test, categoriesAvailable);
      expect(result).toEqual('functional');
    });

    it('should return an empty string if no matching category is found', () => {
      const categoriesAvailable = ['functional', 'performance', 'regression'];
      const test = {
        fullTitle: '[invalidCategory] Add items to cart - [C12345]',
      };
      const result = extractCategoryFromTest(test, categoriesAvailable);
      expect(result).toEqual('');
    });

    it('should throw a TypeError if the test argument is not an object', () => {
      const categoriesAvailable = ['functional', 'performance', 'regression'];
      const invalidTest = 'This is not an object';
      expect(() =>
        extractCategoryFromTest(invalidTest, categoriesAvailable)
      ).toThrow(
        'The "test" argument must be an object with a "fullTitle" property.'
      );
    });

    it('should throw a TypeError if the test argument is null', () => {
      const categoriesAvailable = ['functional', 'performance', 'regression'];
      const invalidTest = null;
      expect(() =>
        extractCategoryFromTest(invalidTest, categoriesAvailable)
      ).toThrow(
        'The "test" argument must be an object with a "fullTitle" property.'
      );
    });

    it('should throw a TypeError if the test object does not have a fullTitle property', () => {
      const categoriesAvailable = ['functional', 'performance', 'regression'];
      const invalidTest = { title: 'Add items to cart' };
      expect(() =>
        extractCategoryFromTest(invalidTest, categoriesAvailable)
      ).toThrow(
        'The "test" argument must be an object with a "fullTitle" property.'
      );
    });

    it('should throw a TypeError if the testCategoriesAvailable argument is not an array', () => {
      const test = { fullTitle: '[functional] Add items to cart - [C12345]' };
      const invalidCategoriesAvailable = 'This is not an array';
      expect(() =>
        // @ts-ignore
        extractCategoryFromTest(test, invalidCategoriesAvailable)
      ).toThrow(
        'The "testCategoriesAvailable" argument must be an array of strings.'
      );
    });

    it('should throw a TypeError if the testCategoriesAvailable argument is an array of non-strings', () => {
      const test = { fullTitle: '[functional] Add items to cart - [C12345]' };
      const invalidCategoriesAvailable = [123, 456];
      expect(() =>
        // @ts-ignore
        extractCategoryFromTest(test, invalidCategoriesAvailable)
      ).toThrow(
        'The "testCategoriesAvailable" argument must be an array of strings.'
      );
    });

    it('should handle multiple category matches and extract all valid matches', () => {
      const categoriesAvailable = ['performance', 'functional', 'regression'];
      const test = {
        fullTitle: '[performance] [functional] Add items to cart - [C12345]',
      };
      const result = extractCategoryFromTest(test, categoriesAvailable);
      expect(result).toEqual('performance,functional');
    });

    it('should return an empty string if there are no category matches in the test title', () => {
      const categoriesAvailable = ['functional', 'performance', 'regression'];
      const test = { fullTitle: 'Add items to cart - [C12345]' };
      const result = extractCategoryFromTest(test, categoriesAvailable);
      expect(result).toEqual('');
    });
  });

  describe('extractSpecFromFullFile', () => {
    it('should correctly extract the spec name from a full file path', () => {
      const fullFilePath = 'cypress/e2e/cart/shopping.spec.ts';
      const result = extractSpecFromFullFile(fullFilePath);
      expect(result).toEqual('shopping');
    });

    it('should extract the spec name without the .cy extension', () => {
      const fullFilePath = 'tests/unit/someTest.cy.js';
      const result = extractSpecFromFullFile(fullFilePath);
      expect(result).toEqual('someTest');
    });

    it('should extract the spec name without the .test extension', () => {
      const fullFilePath = 'integration/tests/anotherTest.test.jsx';
      const result = extractSpecFromFullFile(fullFilePath);
      expect(result).toEqual('anotherTest');
    });

    it('should throw a TypeError if fullFilePath is not a string', () => {
      const invalidFullFilePath = 12345; // Not a string
      // @ts-ignore
      expect(() => extractSpecFromFullFile(invalidFullFilePath)).toThrow(
        'The "fullFilePath" must be a string.'
      );
    });

    it('should throw a TypeError if the file name does not match the expected format', () => {
      const invalidFullFilePath = 'integration/tests/anotherTest.invalidExt';
      expect(() => extractSpecFromFullFile(invalidFullFilePath)).toThrow(
        'The file name format is unexpected. It should end with .spec.ts, .cy.js, .test.jsx, etc.'
      );
    });

    it('should handle paths with nested directories correctly', () => {
      const fullFilePath = 'src/tests/deeply/nested/directory/testFile.spec.ts';
      const result = extractSpecFromFullFile(fullFilePath);
      expect(result).toEqual('testFile');
    });

    it('should return an empty string if the file name has no base name', () => {
      const fullFilePath = 'src/tests/.spec.ts';
      const result = extractSpecFromFullFile(fullFilePath);
      expect(result).toEqual('');
    });

    it('should handle file names with multiple dots correctly', () => {
      const fullFilePath = 'src/tests/complex.name.spec.ts';
      const result = extractSpecFromFullFile(fullFilePath);
      expect(result).toEqual('complex.name');
    });

    it('should throw a TypeError if the file name has no extension', () => {
      const fullFilePath = 'src/tests/noExtension';
      expect(() => extractSpecFromFullFile(fullFilePath)).toThrow(
        'The file name format is unexpected. It should end with .spec.ts, .cy.js, .test.jsx, etc.'
      );
    });
  });

  describe('extractTeamNameFromTest', () => {
    it('should correctly extract the team name from a test title', () => {
      const allTeamNames = ['TeamAlpha', 'TeamBeta', 'TeamGamma'];
      const test = { fullTitle: '[TeamAlpha] Test description' };
      const result = extractTeamNameFromTest(test, allTeamNames);
      expect(result).toEqual('TeamAlpha');
    });

    it('should return an empty string if no team name is found', () => {
      const allTeamNames = ['TeamAlpha', 'TeamBeta', 'TeamGamma'];
      const test = { fullTitle: 'No team name in this title' };
      const result = extractTeamNameFromTest(test, allTeamNames);
      expect(result).toEqual('');
    });

    it('should return an empty string if the team name is not in the list', () => {
      const allTeamNames = ['TeamAlpha', 'TeamBeta', 'TeamGamma'];
      const test = { fullTitle: '[TeamDelta] Test description' };
      const result = extractTeamNameFromTest(test, allTeamNames);
      expect(result).toEqual('');
    });

    it('should handle team names case insensitively', () => {
      const allTeamNames = ['TeamAlpha', 'TeamBeta', 'TeamGamma'];
      const test = { fullTitle: '[teamalpha] Test description' };
      const result = extractTeamNameFromTest(test, allTeamNames);
      expect(result).toEqual('teamalpha');
    });

    it('should throw a TypeError if the test object does not have a fullTitle property', () => {
      const allTeamNames = ['TeamAlpha', 'TeamBeta', 'TeamGamma'];
      const test = { title: '[TeamAlpha] Test description' };
      expect(() => extractTeamNameFromTest(test, allTeamNames)).toThrow(
        'The "test" object must have a "fullTitle" property of type string.'
      );
    });

    it('should throw a TypeError if the fullTitle property is not a string', () => {
      const allTeamNames = ['TeamAlpha', 'TeamBeta', 'TeamGamma'];
      const test = { fullTitle: 12345 };
      expect(() => extractTeamNameFromTest(test, allTeamNames)).toThrow(
        'The "test" object must have a "fullTitle" property of type string.'
      );
    });

    it('should throw a TypeError if allTeamNames is not an array', () => {
      const test = { fullTitle: '[TeamAlpha] Test description' };
      // @ts-ignore
      expect(() => extractTeamNameFromTest(test, 'TeamAlpha')).toThrow(
        'The "allTeamNames" must be an array of strings.'
      );
    });

    it('should throw a TypeError if allTeamNames is not an array of strings', () => {
      const test = { fullTitle: '[TeamAlpha] Test description' };
      const allTeamNames = ['TeamAlpha', 123, 'TeamGamma'];
      // @ts-ignore
      expect(() => extractTeamNameFromTest(test, allTeamNames)).toThrow(
        'The "allTeamNames" must be an array of strings.'
      );
    });

    it('should handle multiple team names in the title and return the first match', () => {
      const allTeamNames = ['TeamAlpha', 'TeamBeta', 'TeamGamma'];
      const test = { fullTitle: '[TeamAlpha] [TeamBeta] Test description' };
      const result = extractTeamNameFromTest(test, allTeamNames);
      expect(result).toEqual('TeamAlpha');
    });

    it('should handle special characters in team names', () => {
      const allTeamNames = ['Team-Alpha', 'Team_Beta', 'Team.Gamma'];
      const test = { fullTitle: '[Team-Alpha] Test description' };
      const result = extractTeamNameFromTest(test, allTeamNames);
      expect(result).toEqual('Team-Alpha');
    });
  });

  describe('extractTestNameFromFullTitle', () => {
    it('should correctly extract the test name from a full title', () => {
      const fullTitle = 'Test description, [functional]';
      const result = extractTestNameFromFullTitle(fullTitle);
      expect(result).toEqual('Test description');
    });

    it('should remove multiple bracketed segments', () => {
      const fullTitle = 'Test description, [functional], [regression]';
      const result = extractTestNameFromFullTitle(fullTitle);
      expect(result).toEqual('Test description');
    });

    it('should remove trailing commas and spaces', () => {
      const fullTitle = 'Test description, [functional], ';
      const result = extractTestNameFromFullTitle(fullTitle);
      expect(result).toEqual('Test description');
    });

    it('should handle titles with no bracketed segments', () => {
      const fullTitle = 'Test description without brackets';
      const result = extractTestNameFromFullTitle(fullTitle);
      expect(result).toEqual('Test description without brackets');
    });

    it('should handle empty strings', () => {
      const fullTitle = '';
      expect(() => extractTestNameFromFullTitle(fullTitle)).toThrow(Error);
    });

    it('should handle strings with only bracketed segments and commas', () => {
      const fullTitle = '[functional], [regression], ';
      expect(() => extractTestNameFromFullTitle(fullTitle)).toThrow(Error);
    });

    it('should throw a TypeError if the fullTitle is not a string', () => {
      const fullTitle = 12345;
      // @ts-ignore
      expect(() => extractTestNameFromFullTitle(fullTitle)).toThrow(TypeError);
    });

    it('should handle titles with special characters inside brackets', () => {
      const fullTitle = 'Test description [func-tional], [regression]';
      const result = extractTestNameFromFullTitle(fullTitle);
      expect(result).toEqual('Test description');
    });

    it('should handle titles with special characters outside brackets', () => {
      const fullTitle = 'Test description! [functional], [regression]';
      const result = extractTestNameFromFullTitle(fullTitle);
      expect(result).toEqual('Test description!');
    });

    it('should trim whitespace from the extracted test name', () => {
      const fullTitle = '   Test description, [functional]   ';
      const result = extractTestNameFromFullTitle(fullTitle);
      expect(result).toEqual('Test description');
    });
  });

  describe('extractManualTestCaseIdFromTest', () => {
    it('should extract the Test Case ID from the title', () => {
      const test = { title: '[TC-1234] Test description' };
      const result = extractManualTestCaseIdFromTest(test);
      expect(result).toEqual('TC-1234');
    });

    it('should return null if no Test Case ID is present', () => {
      const test = { title: 'Test description without ID' };
      const result = extractManualTestCaseIdFromTest(test);
      expect(result).toBeNull();
    });

    it('should handle multiple bracketed segments and return the first match', () => {
      const test = { title: '[TC-1234] [Regression] Test description' };
      const result = extractManualTestCaseIdFromTest(test);
      expect(result).toEqual('TC-1234');
    });

    it('should handle special characters inside the Test Case ID', () => {
      const test = { title: '[TC#1234-ABC] Test description' };
      const result = extractManualTestCaseIdFromTest(test);
      expect(result).toEqual('TC#1234-ABC');
    });

    it('should return null if the title does not contain a valid Test Case ID', () => {
      const test = { title: 'Test description [invalidID]' };
      const result = extractManualTestCaseIdFromTest(test);
      expect(result).toBeNull();
    });

    it('should throw a TypeError if the test object is not provided', () => {
      expect(() => extractManualTestCaseIdFromTest()).toThrow(
        'The "test" argument must be a non-null object with a "title" property of type string.'
      );
    });

    it('should throw a TypeError if the test object is null', () => {
      expect(() => extractManualTestCaseIdFromTest(null)).toThrow(
        'The "test" argument must be a non-null object with a "title" property of type string.'
      );
    });

    it('should throw a TypeError if the test object does not have a title property', () => {
      const test = { name: '[TC-1234] Test description' };
      expect(() => extractManualTestCaseIdFromTest(test)).toThrow(
        'The "title" property must be a non-empty string.'
      );
    });

    it('should throw a TypeError if the title property is not a string', () => {
      const test = { title: 12345 };
      expect(() => extractManualTestCaseIdFromTest(test)).toThrow(
        'The "title" property must be a non-empty string.'
      );
    });

    it('should throw a TypeError if the title property is an empty string', () => {
      const test = { title: '' };
      expect(() => extractManualTestCaseIdFromTest(test)).toThrow(
        'The "title" property must be a non-empty string.'
      );
    });

    it('should throw a TypeError if the title property is a string with only spaces', () => {
      const test = { title: '   ' };
      expect(() => extractManualTestCaseIdFromTest(test)).toThrow(
        'The "title" property must be a non-empty string.'
      );
    });
  });

  describe('extractTypeFromFullFile', () => {
    it('should extract the type from the full file path', () => {
      const fullFile = '/path/to/type1/file.js';
      const testTypesAvailable = ['type1', 'type2', 'type3'];
      const result = extractTypeFromFullFile(fullFile, testTypesAvailable);
      expect(result).toEqual('type1');
    });

    it('should return an empty string if the type is not found', () => {
      const fullFile = '/path/to/unknown/file.js';
      const testTypesAvailable = ['type1', 'type2', 'type3'];
      const result = extractTypeFromFullFile(fullFile, testTypesAvailable);
      expect(result).toEqual('');
    });

    it('should return all matching types if multiple are found', () => {
      const fullFile = '/path/to/type2/type1/file.js';
      const testTypesAvailable = ['type1', 'type2', 'type3'];
      const result = extractTypeFromFullFile(fullFile, testTypesAvailable);
      expect(result).toEqual('type1, type2');
    });

    it('should throw a TypeError if fullFile is not a string', () => {
      const fullFile = 12345;
      const testTypesAvailable = ['type1', 'type2', 'type3'];
      expect(() =>
        // @ts-ignore
        extractTypeFromFullFile(fullFile, testTypesAvailable)
      ).toThrow(TypeError);
    });

    it('should throw a TypeError if testTypesAvailable is not an array', () => {
      const fullFile = '/path/to/type1/file.js';
      const testTypesAvailable = 'type1';
      expect(() =>
        // @ts-ignore
        extractTypeFromFullFile(fullFile, testTypesAvailable)
      ).toThrow(TypeError);
    });

    it('should throw a TypeError if testTypesAvailable is not an array of strings', () => {
      const fullFile = '/path/to/type1/file.js';
      const testTypesAvailable = ['type1', 123, 'type3'];
      expect(() =>
        // @ts-ignore
        extractTypeFromFullFile(fullFile, testTypesAvailable)
      ).toThrow(TypeError);
    });

    it('should handle an empty array of testTypesAvailable', () => {
      const fullFile = '/path/to/type1/file.js';
      const testTypesAvailable = [];
      const result = extractTypeFromFullFile(fullFile, testTypesAvailable);
      expect(result).toEqual('');
    });

    it('should handle special characters in the type names', () => {
      const fullFile = '/path/to/type-1/file.js';
      const testTypesAvailable = ['type-1', 'type_2', 'type.3'];
      const result = extractTypeFromFullFile(fullFile, testTypesAvailable);
      expect(result).toEqual('type-1');
    });
  });
});
