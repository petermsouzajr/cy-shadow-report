import { enforceMaxLength } from './cellMaxLength';

describe('enforceMaxLength', () => {
  it('should return an empty string if input is null or undefined', () => {
    expect(enforceMaxLength(null, 5)).toBe('');
    expect(enforceMaxLength(undefined, 5)).toBe('');
  });

  it('should truncate a string to the specified maxLength', () => {
    expect(enforceMaxLength('hello world', 5)).toBe('hello');
    expect(enforceMaxLength('hello', 10)).toBe('hello');
  });

  it('should convert a number to a string and truncate it', () => {
    expect(enforceMaxLength(123456, 3)).toBe('123');
    expect(enforceMaxLength(123, 10)).toBe('123');
  });

  it('should throw an error if maxLength is not a positive integer', () => {
    expect(() => enforceMaxLength('hello', -1)).toThrow(
      'maxLength must be a positive integer'
    );
    // @ts-ignore
    expect(() => enforceMaxLength('hello', 'five')).toThrow(
      'maxLength must be a positive integer'
    );
    expect(() => enforceMaxLength('hello', 1.5)).toThrow(
      'maxLength must be a positive integer'
    );
  });

  it('should handle errors gracefully and return an empty string', () => {
    // Mock String.prototype.substring to throw an error
    const originalSubstring = String.prototype.substring;
    String.prototype.substring = () => {
      throw new Error('Test error');
    };

    expect(enforceMaxLength('test', 2)).toBe('');

    // Restore original substring method
    String.prototype.substring = originalSubstring;
  });
});
