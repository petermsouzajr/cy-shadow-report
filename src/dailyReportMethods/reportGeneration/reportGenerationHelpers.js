import {
  FORMULA_KEYS,
  FORMULA_TEMPLATES,
  TEST_CATEGORIES_AVAILABLE,
  TEST_TYPES_AVAILABLE,
} from '../../../constants.js';

/**
 * Generates placeholder entries for report construction.
 *
 * @param {number} count - Number of placeholders needed. Must be a non-negative integer.
 * @returns {string[][]} - A 2D array containing placeholders.
 * @throws {TypeError} If the count is not a number or a negative number.
 */
export const generatePlaceholders = (count) => {
  if (typeof count !== 'number') {
    throw new TypeError('The count must be a number.');
  }

  if (!Number.isInteger(count)) {
    throw new TypeError('The count must be an integer.');
  }

  if (count < 0) {
    throw new TypeError('The count must be a non-negative integer.');
  }

  return new Array(count).fill(['', '']);
};

/**
 * Creates and returns a report entry consisting of a title and a formula.
 *
 * @param {string} title - The title for the report entry.
 * @param {string} formula - The formula for the report entry.
 * @returns {Array<string>} - An array consisting of the title and formula.
 * @throws {TypeError} If either title or formula is not a string.
 * @throws {Error} If either title or formula is an empty string.
 */
export const generateReportEntry = (title, formula) => {
  if (typeof title !== 'string') {
    throw new TypeError('Title must be a string.');
  }
  if (title.trim() === '') {
    throw new Error('Title cannot be an empty string.');
  }
  if (typeof formula !== 'string') {
    throw new TypeError('Formula must be a string.');
  }
  if (formula.trim() === '') {
    throw new Error('Formula cannot be an empty string.');
  }

  return [title, formula];
};

/**
 * Iterates through metrics headers and generates a report entry for each.
 * Adjustments might be required for compatibility with Excel/Google Sheets formulas.
 *
 * @param {Array<string>} defaultHeaderMetrics - The array of header metric strings.
 * @param {number} index - The index of the type within the defaultHeaderMetrics array.
 * @returns {Array<Array<string>>} - An array of report entry arrays.
 * @throws {TypeError} If defaultHeaderMetrics is not an array of strings or index is not a number.
 * @throws {RangeError} If index is out of bounds for defaultHeaderMetrics or type is not found within defaultHeaderMetrics.
 */
export const generateStateReports = (defaultHeaderMetrics, index) => {
  if (!Array.isArray(defaultHeaderMetrics)) {
    throw new TypeError('defaultHeaderMetrics must be an array of strings.');
  }
  if (!defaultHeaderMetrics.every((metric) => typeof metric === 'string')) {
    throw new TypeError('Each item in defaultHeaderMetrics must be a string.');
  }
  if (typeof index !== 'number' || !Number.isInteger(index)) {
    throw new TypeError('index must be an integer.');
  }
  if (index < 0 || index >= defaultHeaderMetrics.length) {
    throw new RangeError('index is out of bounds for defaultHeaderMetrics.');
  }

  const type = defaultHeaderMetrics[index]
    .slice(2)
    .replace(' tests', '')
    .trim();
  if (typeof type !== 'string' || type === '') {
    throw new TypeError('The extracted type must be a non-empty string.');
  }

  const reports = defaultHeaderMetrics.map((metric) => {
    const adjustedMetric = metric.replace('# ', '');
    let formula;

    switch (type) {
      case 'skipped/pending':
        formula = `${adjustedMetric} formula skipped/pending`;
        break;
      case 'total':
        formula = `${adjustedMetric} formula total`;
        break;
      default:
        formula = `${type} formula base`;
    }

    return [`# ${adjustedMetric}`, formula];
  });

  return reports;
};

/**
 * Generates a report entry that contains metrics about passed tests for a team.
 *
 * @param {string} type - The type of test or team name.
 * @returns {Array<string>} - A report entry array.
 * @throws {TypeError} If the type is not a string or is empty.
 */
export const generateTeamReport = (type) => {
  if (typeof type !== 'string' || type.trim() === '') {
    throw new TypeError('Type must be a non-empty string.');
  }

  const title = `# ${type} tests passed`;
  const formula = `${type} formula tests passed`;

  return generateReportEntry(title, formula);
};

/**
 * Generates two report entries that contain metrics about total and passed tests.
 *
 * @param {string} type - The type of test.
 * @returns {Array<Array<string>>} - An array of report entry arrays.
 * @throws {TypeError} If the type is not a string or is empty.
 */
export const generateTypeReport = (type) => {
  if (typeof type !== 'string' || type.trim() === '') {
    throw new TypeError('Type must be a non-empty string.');
  }

  const passedTestsTitle = `# ${type} tests passed`;
  const passedTestsFormula = `${type} formula tests passed`;
  const passedTests = generateReportEntry(passedTestsTitle, passedTestsFormula);

  return [passedTests];
};

/**
 * Asynchronously generates and returns a report from the payload based on types.
 *
 * @param {string[]} types - An array of type strings to generate the report.
 * @param {any[]} payload - The data payload to generate the report from.
 * @param {number} searchIndex - Index at which to search for types in the payload.
 * @param {boolean} [isTeam=false] - Flag to indicate if the current report is for a team.
 * @returns {string[][]} - A report in the form of a 2D string array.
 * @throws {Error} If inputs do not meet required conditions.
 */
export const generateReport = (types, payload, searchIndex, isTeam = false) => {
  if (!Array.isArray(types)) {
    throw new TypeError('Types must be an array.');
  }
  if (!types.every((type) => typeof type === 'string')) {
    throw new TypeError('All types must be strings.');
  }
  if (!Array.isArray(payload)) {
    throw new TypeError('Payload must be an array.');
  }
  if (
    typeof searchIndex !== 'number' ||
    !Number.isInteger(searchIndex) ||
    searchIndex < 0
  ) {
    throw new TypeError('SearchIndex must be a non-negative integer.');
  }
  if (typeof isTeam !== 'boolean') {
    throw new TypeError('isTeam must be a boolean.');
  }

  const report = [];

  for (const type of types) {
    const typeOccurrences = payload.filter(
      (item) =>
        item[searchIndex] &&
        typeof item[searchIndex] === 'string' &&
        item[searchIndex].includes(type)
    ).length;

    if (typeOccurrences > 0) {
      const reportEntries = isTeam
        ? [generateTeamReport(type)]
        : generateTypeReport(type);

      report.push(...reportEntries);
    }
  }

  return report;
};

/**
 * A function that builds specific formulas based on the input type,
 * header row index, total number of rows, the number of body rows, and column references.
 *
 * @function buildFormulas
 * @param {string} type - Type used in formula placeholders.
 * @param {number} headerRowIndex - Index of the header row.
 * @param {number} totalNumberOfRows - Total number of rows including header.
 * @param {number} bodyRowCount - Count of the body rows, excluding header.
 * @param {string} subjectColumn - Column letter(s) of the subject data.
 * @param {string} stateColumn - Column letter(s) of the state data.
 * @returns {Object} An object containing formulas as key-value pairs.
 * @throws {Error} If arguments do not meet the required conditions.
 */
export const buildFormulas = (
  type,
  headerRowIndex,
  totalNumberOfRows,
  bodyRowCount,
  subjectColumn,
  stateColumn,
  constants = { FORMULA_TEMPLATES, FORMULA_KEYS }
) => {
  if (typeof type !== 'string') {
    throw new Error('Type must be a string.');
  }
  if (!Number.isInteger(headerRowIndex) || headerRowIndex <= 0) {
    throw new Error('Header row index must be a positive integer.');
  }
  if (
    !Number.isInteger(totalNumberOfRows) ||
    totalNumberOfRows <= headerRowIndex
  ) {
    throw new Error(
      'Total number of rows must be an integer greater than header row index.'
    );
  }
  if (!Number.isInteger(bodyRowCount) || bodyRowCount <= 0) {
    throw new Error('Body row count must be a positive integer.');
  }
  if (typeof subjectColumn !== 'string' || !subjectColumn.trim()) {
    throw new Error('Subject column must be a non-empty string.');
  }
  if (typeof stateColumn !== 'string' || !stateColumn.trim()) {
    throw new Error('State column must be a non-empty string.');
  }

  if (
    !Array.isArray(constants.FORMULA_TEMPLATES) ||
    constants.FORMULA_TEMPLATES.length === 0
  ) {
    throw new Error('FORMULA_TEMPLATES must be a non-empty array.');
  }
  if (
    !Array.isArray(constants.FORMULA_KEYS) ||
    constants.FORMULA_KEYS.length === 0
  ) {
    throw new Error('FORMULA_KEYS must be a non-empty array.');
  }
  if (constants.FORMULA_TEMPLATES.length !== constants.FORMULA_KEYS.length) {
    throw new Error(
      'FORMULA_TEMPLATES and FORMULA_KEYS arrays must have the same length.'
    );
  }

  // Function to replace placeholders with actual values
  const fillTemplate = (template) =>
    template
      .replace(/{type}/g, type)
      .replace(/{headerRowIndex}/g, headerRowIndex)
      .replace(/{totalNumberOfRows}/g, totalNumberOfRows)
      .replace(/{bodyRowCount}/g, bodyRowCount)
      .replace(/{subjectColumn}/g, subjectColumn)
      .replace(/{stateColumn}/g, stateColumn);

  const templates = constants.FORMULA_TEMPLATES;
  const keys = constants.FORMULA_KEYS;

  // Generate actual formula strings by filling in the templates
  const filledFormulas = templates.map(fillTemplate);

  const combinedObject = keys.reduce((obj, key, index) => {
    obj[key] = filledFormulas[index];
    return obj;
  }, {});

  return combinedObject;
};

/**
 * Helper function to create a regex pattern from an array of formula keys.
 * @param {Function} getKeysPattern - Function to retrieve the keys pattern.
 * @returns {RegExp} A RegExp to match formula keys in a string.
 * @throws {Error} If the keys pattern is not a valid non-empty string.
 */
export const constructHeaderRegex = (getKeysPattern) => {
  const keysPattern = getKeysPattern();
  if (typeof keysPattern !== 'string' || !keysPattern.trim()) {
    throw new Error('The keys pattern must be a non-empty string.');
  }
  return new RegExp(`(.+) (${keysPattern})$`);
};

/**
 * Determines the column letter based on a descriptive type.
 * @param {string} type - The type of the column to determine.
 * @param {Array<string>} columnsAvailable - Array of available columns.
 * @param {Function} numberToLetter - Function to convert a number to a letter.
 * @param {Object} constants - An object containing the functions to get available categories and types.
 * @param {Function} constants.TEST_CATEGORIES_AVAILABLE - Function to get available categories.
 * @param {Function} constants.TEST_TYPES_AVAILABLE - Function to get available types.
 * @returns {string} The letter representing the column in a spreadsheet.
 * @throws {Error} If the type is not a string or columnsAvailable is not an array.
 */
export const determineSubjectColumn = (
  type,
  columnsAvailable,
  numberToLetter,
  constants = { TEST_CATEGORIES_AVAILABLE, TEST_TYPES_AVAILABLE }
) => {
  if (typeof type !== 'string') {
    throw new Error('Type must be a string.');
  }
  if (!Array.isArray(columnsAvailable)) {
    throw new Error('columnsAvailable must be an array.');
  }
  if (typeof numberToLetter !== 'function') {
    throw new Error('numberToLetter must be a function.');
  }
  if (
    typeof constants.TEST_CATEGORIES_AVAILABLE !== 'function' ||
    typeof constants.TEST_TYPES_AVAILABLE !== 'function'
  ) {
    throw new Error(
      'Constants must include TEST_CATEGORIES_AVAILABLE and TEST_TYPES_AVAILABLE functions.'
    );
  }

  const typesAvailable = constants.TEST_TYPES_AVAILABLE();
  const categoriesAvailable = constants.TEST_CATEGORIES_AVAILABLE();

  if (
    !Array.isArray(typesAvailable) ||
    !typesAvailable.every((t) => typeof t === 'string')
  ) {
    throw new Error('TEST_TYPES_AVAILABLE must return an array of strings.');
  }
  if (
    !Array.isArray(categoriesAvailable) ||
    !categoriesAvailable.every((c) => typeof c === 'string')
  ) {
    throw new Error(
      'TEST_CATEGORIES_AVAILABLE must return an array of strings.'
    );
  }

  if (categoriesAvailable.includes(type)) {
    return numberToLetter(columnsAvailable.indexOf('category'));
  } else if (typesAvailable.includes(type)) {
    return numberToLetter(columnsAvailable.indexOf('type'));
  }
  return numberToLetter(columnsAvailable.indexOf('team'));
};

/**
 * Joins formula keys into a regex pattern for matching in strings.
 * @param {Object} constants - An object containing the FORMULA_KEYS array.
 * @param {Array<string>} constants.FORMULA_KEYS - An array of formula keys.
 * @returns {string} A string pattern to use in regex matching.
 * @throws {Error} If FORMULA_KEYS is not a valid array of strings.
 */
export const getKeysPattern = (constants = { FORMULA_KEYS }) => {
  if (!Array.isArray(constants.FORMULA_KEYS)) {
    throw new Error('FORMULA_KEYS must be an array.');
  }
  if (!constants.FORMULA_KEYS.every((key) => typeof key === 'string')) {
    throw new Error('FORMULA_KEYS must be an array of strings.');
  }

  return constants.FORMULA_KEYS.map((key) => `(${key})`).join('|');
};

/**
 * Creates a payload for batch updating merges in Google Sheets.
 * Assumes that the array is the data of a Google Sheet starting from the first row and first column.
 * @param {Array<Array<string>>} data - The 2D array representing the sheet data.
 * @param {number} headerRowIndex - The index of the header row in the sheet.
 * @param {number} sheetId - The ID of the sheet where merges are to be applied.
 * @returns {Object} An object representing the payload for a batch update request to the Google Sheets API.
 * @throws {Error} If the inputs are not valid.
 */
export const createMergeQueries = (data, headerRowIndex, sheetId) => {
  if (
    !Array.isArray(data) ||
    !data.every(
      (row) =>
        Array.isArray(row) && row.every((cell) => typeof cell === 'string')
    )
  ) {
    throw new Error('Data must be a 2D array of strings.');
  }
  if (!Number.isInteger(headerRowIndex) || headerRowIndex < 0) {
    throw new Error('Header row index must be a non-negative integer.');
  }
  if (!Number.isInteger(sheetId) || sheetId < 0) {
    throw new Error('Sheet ID must be a non-negative integer.');
  }

  // Helper function to create a single merge query object
  const createMergeQuery = (start, end, startColumn, endColumn) => ({
    sheetId,
    startRowIndex: start,
    endRowIndex: end,
    startColumnIndex: startColumn,
    endColumnIndex: endColumn,
  });

  // Processes merges for a single column
  const processColumn = (columnIndex) => {
    const merges = [];
    let startMergeIndex = headerRowIndex;
    for (let i = 0; i < data.length; i++) {
      const isLastRow = i === data.length - 1;
      const isDifferent =
        !isLastRow && data[i][columnIndex] !== data[i + 1][columnIndex];
      if (isLastRow || isDifferent) {
        if (startMergeIndex < headerRowIndex + i) {
          merges.push(
            createMergeQuery(
              startMergeIndex,
              headerRowIndex + i + 1,
              columnIndex,
              columnIndex + 1
            )
          );
        }
        startMergeIndex = headerRowIndex + i + 1;
      }
    }
    return merges;
  };

  // Combine merge queries for both columns
  const merges = [...processColumn(0), ...processColumn(1)];

  // Construct the requestBody for the batch update
  const requestBody = {
    requests: merges.map((merge) => ({
      mergeCells: {
        range: merge,
        mergeType: 'MERGE_ALL',
      },
    })),
  };

  return requestBody;
};
