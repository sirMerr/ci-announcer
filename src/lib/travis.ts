import { Context } from 'probot';
import { WebhookPayloadWithRepository } from 'probot/lib/context';
import fetch from 'node-fetch';

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

  log.info('json');
  log.info(json);

  return json;
};

/**
 * Get Build ID from context for API call to
 * Travis
 * @param context Helpers for the GitHub webhook
 */
const getTravisBuildId = (
  payload: WebhookPayloadWithRepository
): null | number => {
  const regex = /(?<=builds\/)[^?]*/;
  const build = payload.target_url.match(regex);

  return build === null ? null : build[0];
};

/**
 * Make request to /job/log which has the logs
 * @param jobId Travis Build Job ID
 */
export const getTravisJobLog = async (jobId: number) => {
  const { url, headers } = travisAPI;

  const res = await fetch(`${url}/job/${jobId}/log`, { headers });
  const json = await res.json();

  return json;
};
