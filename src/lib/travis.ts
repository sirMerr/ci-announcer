import { Context } from 'probot';
import { WebhookPayloadWithRepository } from 'probot/lib/context';
import fetch from 'node-fetch';
import * as http from 'http';

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
export const getTravisJobLog = async (context: Context, jobId: number) => {
  const { headers } = travisAPI;

  const options = {
    host: 'api.travis-ci.org',
    path: `/job/${jobId}/log`,
    headers,
  };
  let errorLog = '';

  http
    .get(options, function(resp) {
      context.log.info(resp);
      context.log.info('hi');
      let respContent = '';
      resp.on('data', function(data) {
        context.log.info('data');
        context.log.info(data.toString());
        respContent += data.toString(); //data is a buffer instance
      });
      resp.on('end', function() {
        context.log.info('END');
        context.log.info(respContent);
        errorLog = respContent;
      });
    })
    .on('error', context.log.error);

  return errorLog;
  //   const res = await fetch(`${url}/job/${jobId}/log.txt`, { headers });
  //   const text = await res.text();
  //   context.log.info(text);
  //     const indexFailStart = text.lastIndexOf('[0m[7m[1m[31m FAIL');
  //     const indexFailEnd = text.lastIndexOf('[999D[K[1mTest Suites:');

  //     const errorLog = text.slice(indexFailStart, indexFailEnd);

  //   return errorLog;
};
