import { Robot, Context } from 'probot';
// import { WebhookPayloadWithRepository } from "probot/lib/context"
import fetch from 'node-fetch';

// Robot will listen for failing statuses
// and comment on the PR
const robot = (robot: Robot) => {
  robot.on('pull_request', async context => {
    context.log.info(context);
    return;
  });

  // https://developer.github.com/v3/activity/events/types/#statusevent
  robot.on('status', async context => {
    const { log, payload } = context;
    const { state } = payload;

    log.info('Status event triggered');
    log.info(context);

    // Should only trigger if it's a PR AND the status is failing
    if (
      payload.context === 'continuous-integration/travis-ci/pr' &&
      state === 'failure'
    ) {
      const { state, sha, target_url } = payload;
      const { github } = context;

      const data = await getTravisData(context);

      // Owner and Repo details
      const { owner, repo } = await context.repo({ logger: robot.log });

      await github.issues.createComment({
        owner,
        repo,
        body: `The TravisCI build failed as of #${sha.slice(7)}`,
        number: data.pull_request_number,
      });
    }
    return;
  });
};

/**
 * Make a request to /build
 * @param context Helpers for the GitHub webhook
 */
const getTravisData = async (context: Context) => {
  const { log } = context;
  const buildId = getTravisBuildId(context);

  log.info('BuildId', buildId);

  if (!buildId) return;

  const travisUrl = String(process.env.TRAVIS_API_URL);
  const headers = {
    'Travis-API-Version': '3',
    'User-Agent': 'API Explorer',
    Authorization: `token ${process.env.TRAVIS_ACCESS_TOKEN}`,
  };

  const res = await fetch(`${travisUrl}/build/${buildId}`, { headers });
  log.info('URL: ', `${travisUrl}/build/${buildId}`);
  const json = await res.json();
  log.info('json');
  log.info(json);

  return json;
};

/**
 * Get Build ID from context for API call to
 * Travis
 * @param context Helpers for the GitHub webhook
 */
const getTravisBuildId = (context: Context): null | number => {
  const regex = /(?<=builds\/)[^?]*/;
  context.log('Target:', context.payload.target_url);

  const build = context.payload.target_url.match(regex);
  //const build = regex.exec(context.payload.targetUrl);
  context.log(build);

  return build === null ? null : build[0];
};

export default robot;
