import { copyPasteNormal } from './copyPaste.js';

describe('copyPasteNormal', () => {
  it('should return a valid copy-paste configuration', () => {
    const sourceParams = {
      sourcePageId: 1,
      startRow: 0,
      endRow: 10,
      startCol: 0,
      endCol: 5,
    };
    const destinationParams = {
      destinationTabId: 2,
      startRow: 5,
      endRow: 15,
      startCol: 3,
      endCol: 8,
    };

    const result = copyPasteNormal(sourceParams, destinationParams);
    expect(result).toEqual({
      copyPaste: {
        source: {
          sheetId: 1,
          startRowIndex: 0,
          endRowIndex: 10,
          startColumnIndex: 0,
          endColumnIndex: 5,
        },
        destination: {
          sheetId: 2,
          startRowIndex: 5,
          endRowIndex: 15,
          startColumnIndex: 3,
          endColumnIndex: 8,
        },
        pasteType: 'PASTE_NORMAL',
      },
    });
  });

  it('should throw an error if sourcePageId is missing', () => {
    const sourceParams = {
      startRow: 0,
      endRow: 10,
      startCol: 0,
      endCol: 5,
    };
    const destinationParams = {
      destinationTabId: 2,
      startRow: 5,
      endRow: 15,
      startCol: 3,
      endCol: 8,
    };

    expect(() => copyPasteNormal(sourceParams, destinationParams)).toThrow(
      'Invalid source parameters: sourcePageId, startRow, endRow, startCol, and endCol must all be numbers.'
    );
  });

  it('should throw an error if destinationTabId is missing', () => {
    const sourceParams = {
      sourcePageId: 1,
      startRow: 0,
      endRow: 10,
      startCol: 0,
      endCol: 5,
    };
    const destinationParams = {
      startRow: 5,
      endRow: 15,
      startCol: 3,
      endCol: 8,
    };

    expect(() => copyPasteNormal(sourceParams, destinationParams)).toThrow(
      'Invalid destination parameters: destinationTabId, startRow, endRow, startCol, and endCol must all be numbers.'
    );
  });

  it('should throw an error if any source parameter is not a number', () => {
    const sourceParams = {
      sourcePageId: '1',
      startRow: 0,
      endRow: 10,
      startCol: 0,
      endCol: 5,
    };
    const destinationParams = {
      destinationTabId: 2,
      startRow: 5,
      endRow: 15,
      startCol: 3,
      endCol: 8,
    };

    expect(() => copyPasteNormal(sourceParams, destinationParams)).toThrow(
      'Invalid source parameters: sourcePageId, startRow, endRow, startCol, and endCol must all be numbers.'
    );
  });

  it('should throw an error if any destination parameter is not a number', () => {
    const sourceParams = {
      sourcePageId: 1,
      startRow: 0,
      endRow: 10,
      startCol: 0,
      endCol: 5,
    };
    const destinationParams = {
      destinationTabId: 2,
      startRow: 5,
      endRow: 15,
      startCol: '3',
      endCol: 8,
    };

    expect(() => copyPasteNormal(sourceParams, destinationParams)).toThrow(
      'Invalid destination parameters: destinationTabId, startRow, endRow, startCol, and endCol must all be numbers.'
    );
  });

  it('should throw an error if no parameters are provided', () => {
    expect(() => copyPasteNormal()).toThrow(
      'Invalid source parameters: sourcePageId, startRow, endRow, startCol, and endCol must all be numbers.'
    );
  });
});
