import * as reportGeneration from './reportGenerationHelpers.js';

/**
 * Retrieves the formulas for a given type and subject.
 * @param {string} type - The type for which formulas are built.
 * @param {number} headerRowIndex - The index of the header row.
 * @param {number} totalNumberOfRows - The total number of rows.
 * @param {number} bodyRowCount - The number of body rows.
 * @param {string} subjectColumn - The subject column letter.
 * @param {string} stateColumn - The state column letter.
 * @returns {Object} The formulas object.
 * @throws {Error} Throws error if input validation fails or formula generation fails.
 */
export const getFormulas = (
  type,
  headerRowIndex,
  totalNumberOfRows,
  bodyRowCount,
  subjectColumn,
  stateColumn
) => {
  if (
    typeof type !== 'string' ||
    typeof headerRowIndex !== 'number' ||
    typeof totalNumberOfRows !== 'number' ||
    typeof bodyRowCount !== 'number' ||
    typeof subjectColumn !== 'string' ||
    typeof stateColumn !== 'string'
  ) {
    throw new Error(
      'Invalid input: Ensure all parameters are of the correct type.'
    );
  }

  try {
    return reportGeneration.buildFormulas(
      type,
      headerRowIndex,
      totalNumberOfRows,
      bodyRowCount,
      subjectColumn,
      stateColumn
    );
  } catch (error) {
    console.error('Error generating formulas:', error);
    throw new Error('Failed to generate formulas');
  }
};
