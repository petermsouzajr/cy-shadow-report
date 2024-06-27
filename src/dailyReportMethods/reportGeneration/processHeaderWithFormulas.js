import { COLUMNS_AVAILABLE } from '../../../constants.js';
import { numberToLetter } from '../../sharedMethods/dataHandler.js';
import { getFormulas } from './getFormulas.js';
import {
  constructHeaderRegex,
  getKeysPattern,
  determineSubjectColumn,
} from './reportGenerationHelpers.js';

/**
 * Applies formulas to the header payload based on the provided patterns.
 * @param {Array<Array<string>>} headerPayload - The header payload to apply formulas to.
 * @param {number} headerRowIndex - The index of the header row.
 * @param {number} totalNumberOfRows - The total number of rows including headers and body.
 * @param {number} bodyRowCount - The count of body rows.
 * @param {Boolean} playwright - A boolean indicating if the test is in playwright format.
 * @throws {Error} Throws an error if any input validation fails or if formulas cannot be generated.
 */
export const processHeaderWithFormulas = (
  headerPayload,
  headerRowIndex,
  totalNumberOfRows,
  bodyRowCount,
  playwright
) => {
  if (!Array.isArray(headerPayload)) {
    throw new Error('Invalid headerPayload: Expected an array of arrays.');
  }
  if (
    typeof headerRowIndex !== 'number' ||
    typeof totalNumberOfRows !== 'number' ||
    typeof bodyRowCount !== 'number'
  ) {
    throw new Error('Invalid row or count values: Expected numbers.');
  }
  if (typeof playwright !== 'boolean') {
    throw new Error('Invalid playwright value: Expected a boolean.');
  }

  try {
    const columnsAvailable = COLUMNS_AVAILABLE(playwright);
    const stateColumn = numberToLetter(columnsAvailable.indexOf('state'));
    const regexPattern = constructHeaderRegex(getKeysPattern);

    headerPayload.forEach((subArray, rowIndex) => {
      if (!Array.isArray(subArray)) {
        throw new Error(
          `Invalid subArray at index ${rowIndex}: Expected an array.`
        );
      }
      subArray.forEach((str, colIndex) => {
        const match = str.match(regexPattern);
        if (match) {
          const subjectColumn = determineSubjectColumn(
            match[1],
            columnsAvailable,
            numberToLetter
          );
          const formulas = getFormulas(
            match[1],
            headerRowIndex,
            totalNumberOfRows,
            bodyRowCount,
            subjectColumn,
            stateColumn
          );

          const formulaKey = match[2];
          if (formulas && formulaKey in formulas) {
            headerPayload[rowIndex][colIndex] = formulas[formulaKey];
          } else {
            throw new Error(`No formula found for key: ${formulaKey}`);
          }
        }
      });
    });
  } catch (error) {
    console.error('Error processing header with formulas:', error);
    throw new Error('Failed to process header with formulas:');
  }
};
