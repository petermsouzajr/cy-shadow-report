import { jest } from '@jest/globals';
import { writeToSheet, batchUpdateMasterSheet } from './writeToSheet';

// Dummy values for auth and spreadsheetId
const dummyAuth = { dummyAuth: true };
const dummySpreadsheetId = 'dummySpreadsheetId';

// Mock functions
const mockAppend = jest.fn();
const mockBatchUpdate = jest.fn();

// Mock Sheets API with dummy auth and spreadsheetId
const mockSheetsAPI = {
  auth: dummyAuth,
  spreadsheetId: dummySpreadsheetId,
  spreadsheets: {
    values: {
      append: mockAppend,
    },
    batchUpdate: mockBatchUpdate,
  },
};

describe('Google Sheets Integration', () => {
  const mockSheetTitle = 'Sheet1';
  const mockValues = [
    ['data1', 'data2'],
    ['data3', 'data4'],
  ];
  const mockPayload = { someKey: 'someValue' };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to prevent it from logging during tests
    global.console.error = jest.fn();
  });

  describe('writeToSheet', () => {
    it('should call append with the correct parameters', async () => {
      await writeToSheet(mockSheetTitle, mockValues, mockSheetsAPI);
      expect(mockAppend).toHaveBeenCalledWith({
        auth: dummyAuth, // auth is dummyAuth in mock context
        spreadsheetId: dummySpreadsheetId, // spreadsheetId is dummySpreadsheetId in mock context
        range: mockSheetTitle,
        valueInputOption: 'USER_ENTERED',
        resource: { values: mockValues },
      });
    });

    it('should handle errors when they occur', async () => {
      // @ts-ignore
      mockAppend.mockRejectedValue(new Error('Test error'));
      await expect(
        writeToSheet(mockSheetTitle, mockValues, mockSheetsAPI)
      ).rejects.toThrow('Test error');
    });
  });

  describe('batchUpdateMasterSheet', () => {
    it('should call batchUpdate with the correct payload', async () => {
      await batchUpdateMasterSheet(mockPayload, mockSheetsAPI);

      expect(mockBatchUpdate).toHaveBeenCalledWith({
        auth: dummyAuth,
        spreadsheetId: dummySpreadsheetId,
        resource: mockPayload,
      });
    });

    it('should handle errors when they occur', async () => {
      // @ts-ignore
      mockBatchUpdate.mockRejectedValue(new Error('Test error'));
      await expect(
        batchUpdateMasterSheet(mockPayload, mockSheetsAPI)
      ).rejects.toThrow('Test error');
    });
  });
});
