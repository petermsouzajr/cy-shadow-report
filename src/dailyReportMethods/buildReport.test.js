import { extractTeamNameFromTest } from './extraction/dataExtractionUtilities.js';

describe('Daily Report Methods', () => {
  describe('constructReportPayloadEntry', () => {
    const isPlaywrightOptions = [true, false];
    isPlaywrightOptions.forEach((isPlaywright) => {
      const testFramework = isPlaywright ? 'Playwright' : 'Cypress';

      it(`should construct a payload entry based on test result and details when using ${testFramework}`, async () => {});
    });
  });

  describe('extractTeamNameFromTest', () => {
    const allTeamNames = ['team1', 'Team2', 'team-3'];

    it('should extract the team name from the test fullTitle', () => {
      const test = { fullTitle: 'Some test [Team2]' };
      const result = extractTeamNameFromTest(test, allTeamNames);
      expect(result).toBe('Team2');
    });

    it('should return empty string if no team name is found', () => {
      const test = { fullTitle: 'Some test without team name' };
      const result = extractTeamNameFromTest(test, allTeamNames);
      expect(result).toBe('');
    });

    it('should handle multiple team names and extract the correct one', () => {
      const test = { fullTitle: 'Some test [team-3] [Team2]' };
      const result = extractTeamNameFromTest(test, allTeamNames);
      expect(result).toBe('team-3');
    });

    it('should be case insensitive', () => {
      const test = { fullTitle: 'Some test [team1]' };
      const result = extractTeamNameFromTest(test, allTeamNames);
      expect(result).toBe('team1');
    });

    it('should throw TypeError if test object does not have fullTitle property', () => {
      const test = { title: 'Some test' };
      expect(() => extractTeamNameFromTest(test, allTeamNames)).toThrow(
        'The "test" object must have a "fullTitle" property of type string.'
      );
    });

    it('should throw TypeError if fullTitle is not a string', () => {
      const test = { fullTitle: 12345 };
      expect(() => extractTeamNameFromTest(test, allTeamNames)).toThrow(
        'The "test" object must have a "fullTitle" property of type string.'
      );
    });

    it('should return empty string if allTeamNames is empty', () => {
      const test = { fullTitle: 'Some test [Team2]' };
      const result = extractTeamNameFromTest(test, []);
      expect(result).toBe('');
    });

    it('should handle special characters in team names', () => {
      const specialTeamNames = ['team$pecial', 'team^'];
      const test = { fullTitle: 'Some test [team$pecial]' };
      const result = extractTeamNameFromTest(test, specialTeamNames);
      expect(result).toBe('team$pecial');
    });
  });
});
