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
  owner,
  repo,
}: {
  context: Context;
  owner: string;
  repo: string;
}) => {
  const { log, payload } = context;
  const { sha } = payload;
  const { github } = context;

  // Get the CI build data
  const buildData = await getTravisBuildData(context);
  const jobId = buildData.jobs[0].id;

  // Get the CI build logs
  const logs = await getTravisJobLog(jobId);
  const content = logs.content;

  const errorLogs = getErrorLogs(content);

  const body = makeIssueBody(errorLogs);

  await github.issues.createComment({
    owner,
    repo,
    body: `The TravisCI build failed as of #${sha.slice(0, 7)}`,
    number: buildData.pull_request_number,
  });
};

/**
 * Get the specific error logs that we want
 * to display to the user, using [$0k as our
 * identifier
 * @param content The entire log
 */
const getErrorLogs = (content: string): string => {
  return '';
};

const makeIssueBody = (errorLogs: string): string => {
  return '';
};
