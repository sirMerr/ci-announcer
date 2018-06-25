import { Context } from 'probot';
import { WebhookPayloadWithRepository } from 'probot/lib/context';
import fetch from 'node-fetch';
import * as util from 'util';

// strip_ansi not proper module so needs to be required
const stripAnsi = require('strip-ansi');

// Options for fetch
const travisAPI = {
  url: String(process.env.TRAVIS_API_URL),
  headers: {
    'Travis-API-Version': '3',
    'User-Agent': 'API Explorer',
    Authorization: `token ${process.env.TRAVIS_ACCESS_TOKEN}`,
  },
};

/**
 * Make a request to /build
 * @param context Helpers for the GitHub webhook
 */
export const getTravisBuildData = async (
  context: Context
): Promise<null | { [key: string]: any }> => {
  const { log, payload } = context;
  const buildId = getTravisBuildId(payload);
  log.info('BuildId', buildId);

  if (!buildId) return null;

  const { url, headers } = travisAPI;
  log.info('GET: ', `${url}/build/${buildId}`);

  const res = await fetch(`${url}/build/${buildId}`, { headers });
  const json = await res.json();

  return json;
};

/**
 * Get Build ID from context for API call to Travis.
 *
 * @param payload Context payload
 */
const getTravisBuildId = (payload: WebhookPayloadWithRepository): number => {
  const travisUrl: string = payload.target_url;
  const indexBuild = travisUrl.indexOf('builds/') + 7;
  const indexEnd = travisUrl.indexOf('?', indexBuild);

  const buildNum = travisUrl.substring(indexBuild, indexEnd);

  return Number(buildNum);
};

interface LogPart {
  content: string;
  final: boolean;
  number: number;
}

/**
 * Make request to /job/log which has the logs.
 * Takes all logs from FAIL until Test Suites. Note that
 * for larger scale projects, it would be necessary to limit
 * the number of lines for each failed test
 *
 * @param jobId Travis Build Job ID
 */
export const getTravisErrorLogs = async (jobId: number) => {
  const { url, headers } = travisAPI;
  let logParts: Array<LogPart> = [];
  let indexFailStart = -1;
  let indexFailStop = -1;
  let partNumberFailStart;
  let lastIndex = 0;
  let final = false;

  const sleep = util.promisify(setTimeout);

  // Continue while FAIL start and end delimiter are not found
  // or until there is no more data to read
  while (!final) {
    const res = await fetch(`${url}/job/${jobId}/log`, { headers });
    const json = await res.json();
    const parts: Array<LogPart> = json.log_parts;
    const length = parts.length - 1;

    // No new data fetched
    if (lastIndex === length) {
      continue;
    }

    // Go through each part from end to front to find
    // the delimiters. When a part contains one, push it
    for (let i = length; i >= lastIndex; i--) {
      const log = parts[i];
      if (!final) final = log.final;

      if (indexFailStart === -1) {
        indexFailStart = log.content.lastIndexOf('\u001b[31m FAIL');
        // Find the first FAIL starting backwards from the initially
        // found FAIL index
        if (indexFailStart !== -1) {
          logParts.push(log);
          partNumberFailStart = log.number;

          const lastIndexOfFail = () =>
            log.content.lastIndexOf('\u001b[31m FAIL', indexFailStart - 1);

          // Keep updating indexFailStart until the first
          // failed test is reached
          while (lastIndexOfFail() !== -1) {
            indexFailStart = lastIndexOfFail();
          }
        }
      }

      // Find end marker
      if (indexFailStop === -1) {
        indexFailStop = log.content.lastIndexOf(
          '\r\n\r\n\u001b[999D\u001b[K\u001b[1mTest Suites:'
        );

        // Only push if the log is a different one than the found start
        // and the stop delimiter is found
        if (partNumberFailStart !== log.number && indexFailStop !== -1) {
          logParts.push(log);
        }
      }

      // Exit for loop early if the beginning and end markers were found
      if (indexFailStart !== -1 && indexFailStop !== -1) break;
    }

    // Exit while loop if markers are found or there are no more logs to poll
    if (final || (indexFailStart !== -1 && indexFailStop !== -1)) break;

    // Update lastIndex for the foor loop
    lastIndex = parts[length].number;

    // Wait until polling the api again
    sleep(3000);
  }

  const errorLogs = makeErrorLog(logParts, indexFailStart, indexFailStop);

  return errorLogs;
};

/**
 * Make the error log for display.
 *
 * First log of the array of logs contains the starting
 * delimiter and the last log the array contains the end one.
 *
 * It is possible to have only one log containing both.
 *
 * @param logs list of logs
 * @param stringStart inclusive index of a log part
 * @param stringEnd exclusive index of a log part
 *
 */
const makeErrorLog = (
  logs: Array<LogPart>,
  stringStart: number,
  stringEnd: number
): string => {
  const size = logs.length;

  if (size <= 0) return 'No logs found, please check your build above';

  let errorLog = '';

  // The error is contained in a single log
  if (size === 1) {
    errorLog = logs[0].content.slice(stringStart, stringEnd);
  } else {
    // The error is contained in multiple logs.
    // Here we build the error log from the indexes given
    for (let i = 0; i < size; i++) {
      const log = logs[i];
      if (i === 0) {
        errorLog += log.content.slice(stringStart);
      } else if (i === size) {
        errorLog += log.content.slice(0, stringEnd);
      } else {
        errorLog += log.content;
      }
    }
  }

  // Strip the built log of any ansi characters
  errorLog = stripAnsi(errorLog);

  // Slice if the log is too big. It is possible to
  // do this step in the while loop of getTravisErrorLogs
  if (errorLog.length > 400) {
    errorLog.slice(0, 400);
    errorLog += '\n...';
  }

  return errorLog;
};
