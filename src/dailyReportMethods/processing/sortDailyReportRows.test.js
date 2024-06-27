import { sortPayload } from './sortDailyReportRows';

describe('sortPayload', () => {
  it('should sort the bodyPayload by area, spec, and testName', () => {
    const payload = {
      bodyPayload: [
        { area: 'B', spec: 'Y', testName: 'Z' },
        { area: 'A', spec: 'X', testName: 'Y' },
        { area: 'A', spec: 'X', testName: 'Z' },
        { area: 'A', spec: 'Y', testName: 'X' },
        { area: 'B', spec: 'X', testName: 'Y' },
      ],
    };

    const expected = {
      bodyPayload: [
        { area: 'A', spec: 'X', testName: 'Y' },
        { area: 'A', spec: 'X', testName: 'Z' },
        { area: 'A', spec: 'Y', testName: 'X' },
        { area: 'B', spec: 'X', testName: 'Y' },
        { area: 'B', spec: 'Y', testName: 'Z' },
      ],
    };

    sortPayload(payload);
    expect(payload).toEqual(expected);
  });

  it('should throw an error if payload is not an object', () => {
    expect(() => sortPayload(null)).toThrow(
      'Invalid payload: Expected an object.'
    );
    expect(() => sortPayload('invalid')).toThrow(
      'Invalid payload: Expected an object.'
    );
  });

  it('should throw an error if bodyPayload is not an array', () => {
    const invalidPayload1 = {};
    const invalidPayload2 = { bodyPayload: 'not an array' };

    expect(() => sortPayload(invalidPayload1)).toThrow(
      'Invalid payload: Expected an object with a bodyPayload array.'
    );
    expect(() => sortPayload(invalidPayload2)).toThrow(
      'Invalid payload: Expected an object with a bodyPayload array.'
    );
  });

  it('should throw an error if bodyPayload items do not have the required properties', () => {
    const invalidPayload1 = { bodyPayload: [{ area: 'A', spec: 'X' }] };
    const invalidPayload2 = {
      bodyPayload: [{ area: 'A', spec: 123, testName: 'Y' }],
    }; // spec is not a string

    expect(() => sortPayload(invalidPayload1)).toThrow(
      'Invalid payload item: Each item in bodyPayload should have area, spec, and testName as strings.'
    );
    expect(() => sortPayload(invalidPayload2)).toThrow(
      'Invalid payload item: Each item in bodyPayload should have area, spec, and testName as strings.'
    );
  });

  it('should throw an error if sorting fails', () => {
    const payload = {
      bodyPayload: [
        { area: 'A', spec: 'X', testName: 'Y' },
        { area: 'A', spec: 'X', testName: 'Z' },
        { area: 'A', spec: 'Y', testName: 'X' },
      ],
    };

    // Mock localeCompare to throw an error
    const originalLocaleCompare = String.prototype.localeCompare;
    String.prototype.localeCompare = () => {
      throw new Error('Test error');
    };

    expect(() => sortPayload(payload)).toThrow('Test error');

    // Restore original localeCompare
    String.prototype.localeCompare = originalLocaleCompare;
  });
});
