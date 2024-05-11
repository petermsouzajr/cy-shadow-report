#!/usr/bin/env node
import chalk from 'chalk';
import { isProjectConfigured } from './scripts/configuredStatus.js';
import { main } from './src/index.js';
import { handleDailyReport } from './src/sharedMethods/dailyReportHandler.js';
import { handleSummary } from './src/sharedMethods/summaryHandler.js';
import { spawn } from 'child_process';
import { GOOGLE_KEYFILE_PATH, GOOGLE_SHEET_ID } from './constants.js';
import path from 'path';

/**
 * Main execution function for the command-line interface.
 * Processes command line arguments to determine the desired operation and configuration.
 * Supports generating daily and monthly reports with optional CSV output and duplication.
 */
async function run() {
  const args = process.argv.slice(2);
  const commands = args.filter((arg) =>
    ['todays-report', 'monthly-summary'].includes(arg)
  );

  const command = commands[0] || ''; // Select the first command if multiple, though typically there should only be one
  const isCSV = args.includes('--csv'); // Checks if the CSV output is requested
  const isDuplicate = args.includes('--duplicate'); // Checks if duplication is requested
  const frameworkArg = args.find((arg) =>
    ['cypress', 'playwright', 'cy', 'pw'].includes(arg)
  );
  const isConfigured = isProjectConfigured();
  const framework = frameworkArg || ''; // Ensure the framework is correctly specified
  const isCypress = framework === 'cypress' || framework === 'cy';
  const isPlaywright = framework === 'playwright' || framework === 'pw';
  const unsupportedCsvForMonthly = isCSV && command.includes('monthly-summary');
  const unsupportedDuplicateCsvForMonthly =
    isCSV && isDuplicate && command.includes('monthly-summary');
  const optionsPayload = {
    csv: isCSV,
    duplicate: isDuplicate,
    cypress: isCypress,
    playwright: isPlaywright,
  };

  if (args.includes('--help')) {
    console.log(`
    Usage:
      qa-shadow-report <framework> [command] [options]

    Mandatory:
      <framework>     Specify the testing framework: cypress, playwright.

    Commands (Optional):
      todays-report               Only generate today's report.
      monthly-summary             Only generate previous months summary.

    Options (Optional):
      --csv                       Output the report in CSV format.
      --duplicate                 Create a duplicate report.

    Setup:
      qasr-setup                  Initiate the configuration.

    Examples:
      Generate today's report for Playwright in CSV format:
        qa-shadow-report playwright todays-report --csv

      Generate a daily report and monthly summary when necessary, in google sheets, for cypress:
        qa-shadow-report cypress

    Shortcuts:
      qasr cy                    Equivalent to qa-shadow-report cypress
      qasr pw                    Equivalent to qa-shadow-report playwright

    For more details, visit our documentation: https://github.com/petermsouzajr/qa-shadow-report

    `);
    process.exit(0);
  }

  if (GOOGLE_KEYFILE_PATH() === false || GOOGLE_SHEET_ID() === false) {
    // If the Google Sheets configuration is missing, default to CSV
    console.info(
      chalk.yellow(
        "You haven't set up a Google Sheets config yet. Use the command"
      ),
      chalk.green('qasr-setup'),
      chalk.yellow(
        'to create a config file. We can create a CSV report instead.'
      )
    );
    optionsPayload.csv = true;
  }

  if (!isConfigured) {
    const moduleRoot = path.dirname(
      import.meta.resolve('qa-shadow-report/package.json')
    );
    const postInstallPath = path.join(moduleRoot, 'scripts', 'postinstall.js');
    const postInstallScriptPath = postInstallPath;

    // Execute the postInstall.js script
    const child = spawn('node', [postInstallScriptPath], {
      stdio: 'inherit', // inherit stdio to allow interactive input/output
    });

    child.on('close', (code) => {
      process.exit(code);
    });

    // Ensure the parent script does not continue
    child.on('error', (err) => {
      console.error('Failed to start postInstall.js:', err);
      process.exit(1);
    });
  } else if (!framework) {
    console.error(
      chalk.yellow('Sheet not created. Please specify a framework:'),
      chalk.green('cypress'),
      chalk.yellow('or'),
      chalk.green('playwright')
    );
    process.exit(1);
  } else if (unsupportedCsvForMonthly || unsupportedDuplicateCsvForMonthly) {
    console.error(
      chalk.yellow(
        'Error: CSV output for "monthly-summary" with or without duplication is not supported.'
      )
    );
    process.exit(1);
  } else {
    try {
      switch (command) {
        case 'todays-report':
          await handleDailyReport({ ...optionsPayload });
          break;
        case 'monthly-summary':
          await handleSummary({ ...optionsPayload });
          break;
        default:
          await main({ ...optionsPayload });
          break;
      }
    } catch (error) {
      console.error('Error executing command:', error);
    }
  }
}

run();
