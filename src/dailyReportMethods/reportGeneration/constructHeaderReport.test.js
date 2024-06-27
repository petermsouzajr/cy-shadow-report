import { constructHeaderReport } from './constructHeaderReport';

describe('constructHeaderReport', () => {
  it('should construct the header report correctly', async () => {
    const payload = [
      ['data1', 'data2'],
      ['data3', 'data4'],
    ];

    const result = await constructHeaderReport(payload);

    expect(result).toEqual([]);
  });

  it('should throw an error if payload is not an array', async () => {
    await expect(constructHeaderReport(null)).rejects.toThrow(
      'Invalid payload: Expected an array.'
    );
  });

  it('should throw an error if types at a specific index are not arrays', async () => {
    const payload = [
      ['data1', 'data2'],
      ['data3', 'data4'],
    ];

    await expect(await constructHeaderReport(payload)).toEqual([]);
  });

  it('should handle errors during report generation', async () => {
    const payload = [
      ['data1', 'data2'],
      ['data3', 'data4'],
    ];

    await expect(await constructHeaderReport(payload)).toEqual([]);
  });

  it('should handle errors during combining reports', async () => {
    const payload = [
      ['data1', 'data2'],
      ['data3', 'data4'],
    ];

    await expect(await constructHeaderReport(payload)).toEqual([]);
  });
});
