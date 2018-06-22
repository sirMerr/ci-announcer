import { Context } from 'probot';
import { WebhookPayloadWithRepository } from 'probot/lib/context';
import { OctokitWithPagination } from 'probot/lib/github';
import fetch from 'node-fetch';

// strip_ansi not proper module
const stripAnsi = require('strip-ansi');

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
export const getTravisBuildData = async (context: Context) => {
  const { log, payload } = context;
  const buildId = getTravisBuildId(payload);

  log.info('BuildId', buildId);

  if (!buildId) return;

  const { url, headers } = travisAPI;
  log.info('GET: ', `${url}/build/${buildId}`);

  const res = await fetch(`${url}/build/${buildId}`, { headers });
  const json = await res.json();

  return json;
};

/**
 * Get Build ID from context for API call to
 * Travis
 * @param context Helpers for the GitHub webhook
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
 * @param context
 * @param jobId Travis Build Job ID
 */
export const sendMessage = ({
  owner,
  repo,
  context,
  jobId,
  sha,
  travisUrl,
  github,
  prNumber,
}: {
  owner: string;
  repo: string;
  context: Context;
  jobId: number;
  sha: string;
  travisUrl: string;
  github: OctokitWithPagination;
  prNumber: number;
}) => {
  const { url, headers } = travisAPI;
  let logParts: Array<LogPart> = [];
  let indexFailStart = -1;
  let indexFailStop = -1;
  let partNumberStart = -1;
  let partNumberStop = -1;
  let lastIndex = 0;

  const pollData = async () => {
    const res = await fetch(`${url}/job/${jobId}/log`, { headers });
    const json = await res.json();

    const parts: Array<LogPart> = json.log_parts;
    const length = parts.length - 1;

    context.log('length: ', length);
    context.log('lastIndex: ', lastIndex);

    // No new data fetched
    if (lastIndex === length) {
      return;
    }

    // i = 9
    for (let i = length; i > lastIndex; i--) {
      const log = parts[i];
      context.log('i: ', i);
      if (log.final) {
        clearInterval(interval);
      }

      context.log.info('log');
      context.log.info(log);
      context.log.info('indexFailStart for: ', indexFailStart);
      context.log.info('indexFailStop for: ', indexFailStop);

      if (indexFailStart === -1) {
        indexFailStart = log.content.lastIndexOf('[31m FAIL');
        context.log.info('indexFailStat', indexFailStart);
        // Find the first FAIL starting backwards from the initially
        // found FAIL index
        if (indexFailStart !== -1) {
          partNumberStart = log.number;
          logParts.push(log);

          const lastIndexOfFail = () =>
            log.content.lastIndexOf('\u001b[31m FAIL', indexFailStart - 1);

          while (lastIndexOfFail() !== -1) {
            context.log('lastIndexOfFail');
            indexFailStart = lastIndexOfFail();
            partNumberStart = log.number;
            context.log('while indexFailStart', indexFailStart);
          }
        }
      }

      if (indexFailStop === -1) {
        indexFailStop = log.content.lastIndexOf(
          '\r\n\r\n\u001b[999D\u001b[K\u001b[1mTest Suites:'
        );
        context.log.info('indexFailStop: ', indexFailStop);
        if (indexFailStop !== -1) partNumberStop = log.number;
      }

      if (indexFailStart !== -1 && indexFailStop !== -1) {
        context.log.info('here');
        clearInterval(interval);

        context.log.info('partNumberStart', partNumberStart);
        context.log.info('partNumberStop', partNumberStop);
        context.log.info('indexFailStart', indexFailStart);
        context.log.info('indexFailStop', indexFailStop);
        context.log.info('logParts');
        context.log.info(logParts);

        // await new Promise(resolve => {
        // 	const id = setInterval(() => {
        // 		console.log();
        // 		clearInterval(id)
        // 	}, 500);
        // 	resolve();
        // })

        // At this point, we have the element positions and indexes of our error logs
        sendErrorLog(
          logParts,
          indexFailStart,
          indexFailStop,
          context,
          sha,
          travisUrl,
          github,
          owner,
          repo,
          prNumber
        );
        break;
      }

      lastIndex = parts[length].number;
    }
  };

  const interval = setInterval(pollData, 5000);
};

const sendErrorLog = async (
  logParts: Array<LogPart>,
  indexFailStart: number,
  indexFailStop: number,
  context: Context,
  sha: string,
  travisUrl: string,
  github: OctokitWithPagination,
  owner: string,
  repo: string,
  prNumber: number
) => {
  const errorLogs = makeErrorLog(logParts, indexFailStart, indexFailStop);
  context.log.info('makeErrorLogs:');
  context.log.info(errorLogs);

  const body = makeIssueBody({
    errorLogs,
    sha,
    travisUrl,
  });
  context.log.info(body);

  await github.issues.createComment({
    owner,
    repo,
    body,
    number: prNumber,
  });
};

/**
 * Make the error log for display
 *
 * @param logs list of logs
 * @param start inclusive index of the logs
 * @param end inclusive index of the logs
 * @param stringStart inclusive index of a log part
 * @param stringEnd exclusive index of a log part
 *
 */
const makeErrorLog = (
  logs: Array<LogPart>,
  stringStart: number,
  stringEnd: number
): string => {
  let errorLog = '';
  const size = logs.length;

  if (size === 1) {
    errorLog = logs[0].content.slice(stringStart, stringEnd);
  } else {
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

  errorLog = stripAnsi(errorLog);

  if (errorLog.length > 400) {
    errorLog.slice(0, 400);
    errorLog += '\n...';
  }

  return errorLog;
};

const makeIssueBody = ({
  errorLogs,
  sha,
  travisUrl,
}: {
  errorLogs: string;
  sha: string;
  travisUrl: string;
}): string => {
  return (
    `The [TravisCI build](${travisUrl}) failed as of ${sha}\n` +
    '<pre><code>' +
    errorLogs +
    '</code></pre>'
  );
};
