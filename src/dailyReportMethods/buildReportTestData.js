import { faker } from '@faker-js/faker';
import { formatDuration } from '../sharedMethods/dateFormatting';
import {
  ALL_TEAM_NAMES,
  TEST_CATEGORIES_AVAILABLE,
  TEST_TYPES_AVAILABLE,
} from '../../constants';
import { constructHeaderReport } from './reportGeneration/constructHeaderReport';

const getRandomTestData = () => {
  const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };
  const generateRandomFolderStructure = () => {
    const numFolders = Math.floor(Math.random() * 6) + 1;
    const folders = Array.from({ length: numFolders }, () =>
      faker.lorem.word()
    );
    return folders.join('/');
  };
  const speedMillis = faker.number.int({ min: 0, max: 9999999 });
  const currentState = getRandomElement([
    'passed',
    'failed',
    'skipped',
    'pending',
  ]);
  const typesAvailable = TEST_TYPES_AVAILABLE();
  const categoriesAvailable = TEST_CATEGORIES_AVAILABLE();
  const teamNamesAvailable = ALL_TEAM_NAMES();
  return {
    area: generateRandomFolderStructure(),
    spec: `${faker.lorem.word()}`,
    testName: `${faker.lorem.words({ min: 1, max: 3 })} - ${faker.lorem.sentence(
      { min: 1, max: 6 }
    )} - ${faker.lorem.words({ min: 1, max: 3 })}`,
    type: getRandomElement(typesAvailable),
    category: getRandomElement(categoriesAvailable),
    teamName: getRandomElement(teamNamesAvailable),
    manualTestId: `C${faker.number.int({ min: 10, max: 99999 })}`,
    error:
      currentState === 'failed' ? faker.lorem.words({ min: 5, max: 20 }) : '',
    speedMillis: speedMillis,
    speed: formatDuration(speedMillis),
    state: currentState,
    projectName: faker.lorem.word(),
  };
};

const testData1 = getRandomTestData();
const testData2 = getRandomTestData();

const fullReportOutput = {
  stats: {
    suites: 59,
    tests: 90,
    passes: 11,
    pending: 0,
    failures: 64,
    testsRegistered: 90,
    passPercent: 12.222222222222221,
    pendingPercent: 0,
    other: 0,
    hasOther: false,
    skipped: 15,
    hasSkipped: true,
    start: '2023-10-01T00:10:27.925Z',
    end: '2023-10-01T00:25:07.330Z',
    duration: 879405,
  },
  results: [
    {
      uuid: 'fkejghh8-a2ed-477d-g45jh-gdf5465',
      title: '',
      fullFile: `cypress/e2e/${testData1.area}/${testData1.spec}.spec.ts`,
      file: 'cypress/e2e/cart/groceries.spec.ts',
      beforeHooks: [],
      afterHooks: [],
      tests: [],
      suites: [
        {
          uuid: '4f53g4g-53d2-4af7-933e-gh456fghf',
          title: 'Cart',
          fullFile: '',
          file: '',
          beforeHooks: [],
          afterHooks: [],
          tests: [
            {
              title: 'should display link for adding to a cart',
              fullTitle: testData1.testName,
              timedOut: null,
              duration: testData1.speedMillis,
              state: testData1.state,
              speed: null,
              pass: false,
              fail: true,
              pending: false,
              context: null,
              code: "cart_1.CartsPage.elements.addToCartBtn().should('be.visible');",
              err: {
                message: testData1.error,
                estack:
                  "CypressError: `cy.task('ctrLogFiles')` failed with the following error:\n\nThe task 'ctrLogFiles' was not handled in the setupNodeEvents method. The following tasks are registered: getLocalConfig, dispatchSignIn, fileExists, safeReadJson, deleteFile\n\nFix this in your setupNodeEvents method here:",
                diff: null,
              },
              uuid: '8f2f42fd-e603-4b7b-8c66-dfhjd456456',
              parentUUID: '4f53g4g-53d2-4af7-933e-gh456fghf',
              isHook: false,
              skipped: false,
              projectName: testData1.projectName,
            },
          ],
          suites: [],
          passes: [],
          failures: ['8f2f42fd-e603-4b7b-8c66-dfhjd456456'],
          pending: [],
          skipped: [
            '969a4015-008c-49d5-8afc-h4h6h6rydy',
            '4e6g6gfy-155f-4203-a06f-gh546gfd',
          ],
          duration: 199,
          root: false,
          rootEmpty: false,
          _timeout: 2000,
        },
      ],
      passes: [],
      failures: [],
      pending: [],
      skipped: [],
      duration: 0,
      root: true,
      rootEmpty: true,
      _timeout: 2000,
    },
    {
      uuid: 'df56-d2c5-4cd9-a1d3-gdh56456',
      title: '',
      fullFile: `cypress/e2e/${testData2.type}/${testData2.area}/${testData2.spec}.spec.ts`,
      file: 'cypress/e2e/shopper/getCart.spec.ts',
      beforeHooks: [],
      afterHooks: [],
      tests: [],
      suites: [
        {
          uuid: 'c9b6d209-24aa-472c-8f64-a15cae284337',
          title: 'Shopper - resend Coupon',
          fullFile: '',
          file: '',
          beforeHooks: [],
          afterHooks: [],
          tests: [],
          suites: [
            {
              uuid: 'hfg76-6521-4b60-9583-3562ffadd9a6',
              title: 'shopOwner',
              fullFile: '',
              file: '',
              beforeHooks: [],
              afterHooks: [],
              tests: [
                {
                  title: `can resend invite to a user, [${testData2.manualTestId}]`,
                  fullTitle: `[${testData2.teamName}] ${testData2.testName}, [${testData2.category}]`,
                  timedOut: null,
                  duration: testData2.speedMillis,
                  state: testData2.state,
                  speed: null,
                  pass: false,
                  fail: true,
                  pending: false,
                  context: null,
                  code: 'cy.createShopper().then(function (response) {;',
                  err: {
                    message: testData2.error,
                    estack:
                      "CypressError: `cy.task('ctrLogFiles')` failed with the  error:\n\nThe task 'ctrLogFiles' was not handled in the setupNodeEvents method. The following tasks are registered: getLocalConfig, dispatchSignIn, fileExists, safeReadJson, deleteFile\n\nFix this in your setupNodeEvents method here:",
                    diff: null,
                  },
                  uuid: 'dgh6545-4555-45a0-a3cc-1068c2155ed6',
                  parentUUID: 'hfg76-6521-4b60-9583-3562ffadd9a6',
                  isHook: false,
                  skipped: false,
                  projectName: testData2.projectName,
                },
              ],
              suites: [],
              passes: [],
              failures: ['dgh6545-4555-45a0-a3cc-1068c2155ed6'],
              pending: [],
              skipped: [],
              duration: 218,
              root: false,
              rootEmpty: false,
              _timeout: 2000,
            },
          ],
          passes: [],
          failures: [],
          pending: [],
          skipped: [],
          duration: 0,
          root: false,
          rootEmpty: false,
          _timeout: 2000,
        },
      ],
      passes: [],
      failures: [],
      pending: [],
      skipped: [],
      duration: 0,
      root: true,
      rootEmpty: true,
      _timeout: 2000,
    },
  ],
  meta: {
    mocha: {
      version: '7.0.1',
    },
    mochawesome: {
      options: {
        quiet: false,
        reportFilename: 'mochawesome',
        saveHtml: false,
        saveJson: true,
        consoleReporter: 'spec',
        useInlineDiffs: false,
        code: true,
      },
      version: '7.1.3',
    },
    marge: {
      options: {
        reportDir: 'cypress/reports',
        overwrite: false,
        html: false,
        json: true,
      },
      version: '6.2.0',
    },
  },
};

const updateErrorMessage = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => updateErrorMessage(item));
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === 'err') {
          newObj[key] = obj[key].message;
        } else {
          newObj[key] = updateErrorMessage(obj[key]);
        }
      }
    }
    return newObj;
  } else {
    return obj;
  }
};

const playwrightFullReportOutput = updateErrorMessage(fullReportOutput);

const expectedPayloadEntries = [
  {
    area: testData1.area,
    spec: testData1.spec,
    testName: testData1.testName,
    type: '',
    category: '',
    team: '',
    priority: '',
    status: '',
    state: testData1.state,
    manualTestId: '',
    error: testData1.error,
    speed: testData1.speed,
  },
  {
    area: testData2.area,
    spec: testData2.spec,
    testName: testData2.testName,
    type: testData2.type,
    category: testData2.category,
    team: testData2.teamName,
    priority: '',
    status: '',
    state: testData2.state,
    manualTestId: testData2.manualTestId,
    error: testData2.error,
    speed: testData2.speed,
  },
];

const expectedPayloadEntryValues = [
  [
    testData1.area,
    testData1.spec,
    testData1.testName,
    '',
    '',
    '',
    '',
    '',
    testData1.state,
    '',
    testData1.error,
    testData1.speed,
  ],
  [
    testData2.area,
    testData2.spec,
    testData2.testName,
    testData2.type,
    testData2.category,
    '',
    '',
    '',
    testData2.state,
    testData2.manualTestId,
    testData2.error,
    testData2.speed,
  ],
];

const expectedPayloadEntry = expectedPayloadEntries[0];

const emptyDailyPayload = {
  bodyPayload: [],
  headerPayload: [],
  summaryHeaderStylePayload: [],
  summaryGridStyles: [],
  footerPayload: [],
};
const formattedPayloadEntries = expectedPayloadEntries.map(Object.values);
const headerPayload = await constructHeaderReport(formattedPayloadEntries);
const emptyHeaderPayload = [[''], [''], ['']];
const unappendedHeaderPayload = [
  [
    `${testData2.type} formula tests`,
    `${testData2.category} formula tests`,
    '',
    '',
  ],
  [
    `${testData2.type} formula tests passed`,
    `${testData2.category} formula tests passed`,
    '',
    '',
  ],
  ['', '', `${testData2.category} formula tests`, '', ''],
  ['', '', `${testData2.category} formula tests passed`, '', ''],
];
const appendedHeaderPayload = [
  [
    `${testData2.type} formula tests`,
    `${testData2.category} formula tests`,
    '',
    '',
    '',
    '',
    '',
    '# passed tests',
    'passed formula base',
  ],
  [
    `${testData2.type} formula tests passed`,
    `${testData2.category} formula tests passed`,
    '',
    '',
    '',
    '',
    '',
    '# failed tests',
    'failed formula base',
  ],
  [
    '',
    '',
    `${testData2.category} formula tests`,
    '',
    '',
    '',
    '',
    '# skipped/pending tests',
    'skipped/pending tests formula skipped/pending',
  ],
  [
    '',
    '',
    `${testData2.category} formula tests passed`,
    '',
    '',
    '',
    '',
    '# total tests',
    'total tests formula total',
  ],
];

const appendedEmptyHeaderPayload = [
  ['', '', '', '', '', '', '', '# passed tests', 'passed formula base'],
  ['', '', '', '', '', '', '', '# failed tests', 'failed formula base'],
  [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '# skipped/pending tests',
    'skipped/pending tests formula skipped/pending',
  ],
  ['', '', '', '', '', '', '', '# total tests', 'total tests formula total'],
];

const expectedBodyPayload = [
  [
    `# ${testData2.type} tests passed`,
    `${testData2.type} formula tests passed`,
    `# ${testData2.category} tests passed`,
    `${testData2.category} formula tests passed`,
    '',
    '',
    '',
    '# passed tests',
    'passed formula base',
  ],
  ['', '', '', '', '', '', '', '# failed tests', 'failed formula base'],
  [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '# skipped/pending tests',
    'skipped/pending tests formula skipped/pending',
  ],
  ['', '', '', '', '', '', '', '# total tests', 'total tests formula total'],
  [
    'browser',
    'spec',
    'test name',
    'type',
    'category',
    'team',
    'priority',
    'status',
    'state',
    'manual case',
    'error',
    'speed',
  ],
];
export const testResultData = {
  fullReportOutput,
  expectedPayloadEntries,
  expectedPayloadEntry,
  headerPayload,
  unappendedHeaderPayload,
  emptyHeaderPayload,
  appendedEmptyHeaderPayload,
  appendedHeaderPayload,
  emptyDailyPayload,
  testData1,
  testData2,
  expectedBodyPayload,
  expectedPayloadEntryValues,
  playwrightFullReportOutput,
};
