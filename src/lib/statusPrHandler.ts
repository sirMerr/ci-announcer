import { Context } from 'probot';
import { getTravisBuildData, getTravisJobLog } from './travis';

/**
 * Handler which will get the associated
 * Travis build info and prep a message
 * for the associated PR trigger
 *
 * @param context
 * @param owner
 * @param repo
 */
export const statusPrHandler = async ({
  context,
}: //   owner,
//   repo,
{
  context: Context;
  owner: string;
  repo: string;
}) => {
  const { log, payload } = context;
  const { sha } = payload;
  //   const { github } = context;
  //   log.info(sha,github,repo,owner);

  // Get the CI build data
  const buildData = await getTravisBuildData(context);
  const jobId = buildData.jobs[0].id;

  // Get the CI build logs
  const errorLogs = await getTravisJobLog(context, jobId);

  const body = makeIssueBody({
    errorLogs,
    sha,
    travisUrl: payload.target_url,
  });

  log.info(body);

  // await github.issues.createComment({
  //     owner,
  //     repo,
  //     body,
  //     number: buildData.pull_request_number,
  // });
  return;
};

// interface LogPart {
//     content: string, // Content of this log part
//     final: boolean, // No next page
//     number: number // Number in the parts array (from 0)
// }
// /**
//  * Get the specific error logs that we want
//  * to display to the user, using [$0k as our
//  * identifier
//  * @param content The entire log
//  */
// const getErrorLogs = (logParts:Array<LogPart>): string => {
//     const logsSize = logParts.length;
//     const lastIndex = logsSize - 1;
//     let error = '';
//     let indexFailStart = -1,
//         indexFailEnd = -1,
//         startIndex = 0,
//         stopIndex = 0;

//     for (let i = lastIndex; i > logsSize; i--) {
//         const logPart = logParts[i];

//         if (indexFailEnd === -1) {
//             // https://www.npmjs.com/package/ansi-escape-sequences#ansistyle--enum
//             indexFailEnd = logPart.content.lastIndexOf('\u001b[999D\u001b[K\u001b[1mTest Suites:');
//             // Could also use i if we are sure the number corresponds to the index
//             if (indexFailEnd !== -1) {
//                 stopIndex = logPart.number;
//             }
//         }

//         if (indexFailStart === -1) {
//             indexFailStart = logPart.content.lastIndexOf('[0m[7m[1m[31m FAIL');
//             // Could also use i if we are sure the number corresponds to the index
//             if (indexFailStart !== -1) {
//                 startIndex = logPart.number;
//             }
//         }

//         if (indexFailStart  !== -1 && indexFailEnd !== -1) {
//             if (startIndex === stopIndex) return logPart.content.slice(indexFailStart, indexFailEnd);
//             for (let j = startIndex; j < stopIndex; j++) {
//                 console.log('sdsd');
//             }
//         }
//     }
//     // // Red altcode
//     // const indexFailStart = content.lastIndexOf('[0m[7m[1m[31m FAIL');
//     // const indexFailEnd = content.lastIndexOf('[999D[K[1mTest Suites:');

//     // const errorLog = content.slice(indexFailStart, indexFailEnd);

//     return error;
// };

const makeIssueBody = ({
  errorLogs,
  sha,
  travisUrl,
}: {
  errorLogs: string;
  sha: string;
  travisUrl: string;
}): string => {
  return `The [TravisCI build](${travisUrl}) failed as of ${sha}\n` + errorLogs;
};
