import { Context } from 'probot';
import { getTravisBuildData, getTravisErrorLogs } from './travis';

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

  // Get the CI build data
  const buildData = await getTravisBuildData(context);

  if (!buildData) {
    log.error('No build data found');
    return;
  }

  const jobId = buildData!.jobs[0].id;

  // Get the CI error logs formatted
  const errorLogs = await getTravisErrorLogs(jobId);

  // Build body of issue with logs, commit id and travis
  // build url
  const body = makeIssueBody({
    errorLogs,
    sha,
    travisUrl: payload.target_url,
  });

  log.info(body);

  // Create comment on pull request
  await github.issues.createComment({
    owner,
    repo,
    body,
    number: buildData!.pull_request_number,
  });
};

/**
 * Creates the issue body for sending
 *
 * @param errorLogs Formatted error logs
 * @param sha       Commit id
 * @param travisUrl Travis build url the user can go to
 */
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
