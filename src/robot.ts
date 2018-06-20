import { Robot } from 'probot';
import { statusPrHandler } from './lib/statusPrHandler';

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
      // Owner and Repo details
      const { owner, repo } = await context.repo({ logger: robot.log });
      // Handler which will post a comment with CI info
      statusPrHandler({ context, owner, repo });
    }
    return;
  });
};

export default robot;
