import { Robot } from 'probot';

const robot = (robot:Robot) => {
	// https://developer.github.com/v3/activity/events/types/#statusevent
	robot.on('status', async context => {
		const { log } = context;

		log.info('PR event triggered');
		log.info(context.payload.status);

		return;
	});
}

export default robot;
