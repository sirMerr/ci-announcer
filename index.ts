import * as dotenv from 'dotenv';
import { Robot } from 'probot';
import { statusPrHandler } from './src/lib/statusPrHandler';

// Allow use of .env
dotenv.config();

// Robot will listen for failing statuses
// and comment on the PR
const probotPlugin = (robot: Robot) => {
  // https://developer.github.com/v3/activity/events/types/#statusevent
  robot.on('status', async context => {
    const { log, payload } = context;
    const { state } = payload;

    log.info('Status event triggered');
    context.log.info(context);

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
  });
};

export = probotPlugin;
