import { Context } from 'probot';
// import {LoggerWithTarget} from 'probot/lib/wrap-logger';
import { getTravisBuildData, sendMessage } from './travis';

// interface EventInfo {
// 	repo: string,
// 	owner: string,
// 	log: LoggerWithTarget | null,
// 	sha: string
// }

// export let eventInfo: EventInfo = {
// 	repo: '',
// 	owner: '',
// 	log: null,
// 	sha: ''

// }

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
  owner,
  repo,
}: {
  context: Context;
  owner: string;
  repo: string;
}) => {
  const { log, payload, github } = context;
  const { sha } = payload;
  log.info('statusPrHandler');
  // eventInfo = {log, owner, repo, sha};

  //   const { github } = context;
  //   log.info(sha,github,repo,owner);

  // Get the CI build data
  const buildData = await getTravisBuildData(context);
  const jobId = buildData.jobs[0].id;

  // Get the CI build logs
  await sendMessage({
    owner,
    repo,
    context,
    jobId,
    github,
    sha,
    travisUrl: payload.target_url,
    prNumber: buildData.pull_request_number,
  });
  // const errorLogs = await getTravisJobLog(context, jobId);

  // const body = makeIssueBody({
  //   errorLogs,
  //   sha,
  //   travisUrl: payload.target_url,
  // });

  // log.info(body);

  // await github.issues.createComment({
  //     owner,
  //     repo,
  //     body,
  //     number: buildData.pull_request_number,
  // });
  return;
};
