import { appendStateReportsToHeader } from './appendStateReportsToHeader';

describe('appendStateReportsToHeader', () => {
  it('should append state reports to the header payload correctly', () => {
    const headerPayload = [
      ['Header1', 'Header2'],
      ['Header3', 'Header4'],
    ];
    const defaultHeaderMetrics = ['metric1', 'metric2'];
    const playwright = true;

    appendStateReportsToHeader(headerPayload, defaultHeaderMetrics, playwright);

    expect(headerPayload).toEqual([
      [
        'Header1',
        'Header2',
        '',
        '',
        '',
        '',
        '',
        '# metric1',
        'tric1 formula base',
      ],
      [
        'Header3',
        'Header4',
        '',
        '',
        '',
        '',
        '',
        '# metric2',
        'tric2 formula base',
      ],
    ]);
  });

  it('should throw an error if headerPayload is not an array', () => {
    expect(() => appendStateReportsToHeader(null, ['metric1'], true)).toThrow(
      'Invalid headerPayload: Expected an array.'
    );
  });

  it('should throw an error if defaultHeaderMetrics is not an array', () => {
    expect(() => appendStateReportsToHeader([[]], null, true)).toThrow(
      'Invalid defaultHeaderMetrics: Expected an array.'
    );
  });

  it('should throw an error if playwright is not a boolean', () => {
    expect(() => appendStateReportsToHeader([[]], ['metric1'], null)).toThrow(
      'Invalid playwright value: Expected a boolean.'
    );
  });

  it('should handle new report at index not being defined or not an array', () => {
    const headerPayload = [null];
    const defaultHeaderMetrics = ['metric1', 'metric2'];
    const playwright = true;

    expect(() =>
      appendStateReportsToHeader(
        headerPayload,
        defaultHeaderMetrics,
        playwright
      )
    ).toThrow("Cannot read properties of null (reading 'length')");
  });

  it('should handle header payload at index not being an array', () => {
    const headerPayload = [null];
    const defaultHeaderMetrics = ['metric1', 'metric2'];
    const playwright = true;

    expect(() =>
      appendStateReportsToHeader(
        headerPayload,
        defaultHeaderMetrics,
        playwright
      )
    ).toThrow("Cannot read properties of null (reading 'length')");
  });
});
