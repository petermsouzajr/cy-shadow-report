/**
 * Sorts the body payload of the data object by area, then spec, and finally testName.
 * @param {Object} payload - The data object containing the payload to be sorted.
 * @throws {Error} If the payload is invalid or sorting fails.
 */
export const sortPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload: Expected an object.');
  }

  if (!Array.isArray(payload.bodyPayload)) {
    throw new Error(
      'Invalid payload: Expected an object with a bodyPayload array.'
    );
  }

  // Check if bodyPayload array elements have the required properties
  for (const item of payload.bodyPayload) {
    if (
      typeof item.area !== 'string' ||
      typeof item.spec !== 'string' ||
      typeof item.testName !== 'string'
    ) {
      throw new Error(
        'Invalid payload item: Each item in bodyPayload should have area, spec, and testName as strings.'
      );
    }
  }

  try {
    payload.bodyPayload.sort(
      (a, b) =>
        a.area.localeCompare(b.area) ||
        a.spec.localeCompare(b.spec) ||
        a.testName.localeCompare(b.testName)
    );
  } catch (error) {
    console.error('Error sorting payload:', error);
    throw error; // Propagate the error
  }
};
