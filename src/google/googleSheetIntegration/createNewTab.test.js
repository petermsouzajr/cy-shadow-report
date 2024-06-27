import { jest } from '@jest/globals';
import { createNewTab } from './createNewTab';

describe('createNewTab', () => {
  const mockCreateSummaryTitle = jest.fn();
  const mockDataObjects = { summaryTabData: null, todaysReportData: null };

  // Dummy values for auth and spreadsheetId
  const dummyAuth = { dummyAuth: true };
  const dummySpreadsheetId = 'dummySpreadsheetId';

  // Initialize mockBatchUpdate as a Jest mock function
  const mockBatchUpdate = jest.fn();

  // Mock Sheets API with dummy auth and spreadsheetId
  const mockSheetsAPI = {
    auth: dummyAuth,
    spreadsheetId: dummySpreadsheetId,
    spreadsheets: {
      batchUpdate: mockBatchUpdate,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to prevent it from logging during tests
    global.console.error = jest.fn();
  });

  it('should create a new summary tab and update summaryTabData', async () => {
    const mockSheetName = 'Summary';
    // @ts-ignore
    mockBatchUpdate.mockResolvedValue({ data: 'mockResponse' });
    mockCreateSummaryTitle.mockReturnValue('Summary');

    const response = await createNewTab(
      mockSheetName,
      // @ts-ignore
      mockCreateSummaryTitle,
      mockDataObjects,
      mockSheetsAPI
    );

    expect(mockBatchUpdate).toHaveBeenCalledWith({
      auth: dummyAuth,
      spreadsheetId: dummySpreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: mockSheetName } } }],
      },
    });
    expect(response).toEqual({ data: 'mockResponse' });
    expect(mockDataObjects.summaryTabData).toEqual(response);
  });

  it('should create a new regular tab and update todaysReportData', async () => {
    const mockSheetName = 'RegularTab';
    // @ts-ignore
    mockBatchUpdate.mockResolvedValue({ data: 'mockRegularResponse' });

    const response = await createNewTab(
      mockSheetName,
      // @ts-ignore
      mockCreateSummaryTitle,
      mockDataObjects,
      mockSheetsAPI
    );

    expect(mockBatchUpdate).toHaveBeenCalledWith({
      auth: { dummyAuth: true },
      requestBody: {
        requests: [{ addSheet: { properties: { title: 'RegularTab' } } }],
      },
      spreadsheetId: 'dummySpreadsheetId',
    });
    expect(response).toEqual({ data: 'mockRegularResponse' });
    expect(mockDataObjects.todaysReportData).toEqual(response);
  });

  it('should throw an error when the API call fails', async () => {
    const mockSheetName = 'ErrorTab';
    const mockError = new Error('API Error');
    // @ts-ignore
    mockBatchUpdate.mockRejectedValue(mockError);

    await expect(
      createNewTab(
        mockSheetName,
        // @ts-ignore
        mockCreateSummaryTitle,
        mockDataObjects,
        mockSheetsAPI
      )
    ).rejects.toThrow('API Error');

    expect(mockBatchUpdate).toHaveBeenCalledWith({
      auth: dummyAuth,
      spreadsheetId: dummySpreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: mockSheetName } } }],
      },
    });
  });

  it('should call createSummaryTitle with specific parameters', async () => {
    const mockSheetName = 'Summary';
    // @ts-ignore
    mockBatchUpdate.mockResolvedValue({ data: 'mockResponse' });
    mockCreateSummaryTitle.mockReturnValue(mockSheetName);

    await createNewTab(
      mockSheetName,
      // @ts-ignore
      mockCreateSummaryTitle,
      mockDataObjects,
      mockSheetsAPI
    );

    expect(mockCreateSummaryTitle).toHaveBeenCalledWith();
  });
});
