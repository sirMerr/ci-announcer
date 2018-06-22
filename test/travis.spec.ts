import fetch from 'node-fetch';
import { getTravisErrorLogs, getTravisBuildData } from '../src/lib/travis';
import {
  mockLogWithFailNotFinal,
  mockLogWithMultipleFails,
} from './fixtures/logs';

jest.mock('node-fetch');

describe('will run travis fetches and manipulation', () => {
  let context = {
    log: jest.fn(),
    payload: {
      target_url:
        'https://travis-ci.org/1fsdsa/ci-announcer-tester/builds/394661277?utm_source=github_status&utm_medium=notification',
    },
  } as any;

  context.log.info = jest.fn();
  context.log.error = jest.fn();

  it('should fetch travis build logs', async () => {
    // @ts-ignore
    fetch.mockImplementation(() => Promise.resolve({ json: () => 'dataMock' }));

    const buildData = await getTravisBuildData(context);

    expect(buildData).toMatchSnapshot();
  });

  it('should fetch logs with failure that has logs between it and return proper travis error logs', async () => {
    // @ts-ignore
    fetch.mockImplementation(() => Promise.resolve(mockLogWithFailNotFinal));

    const errorLogs = await getTravisErrorLogs({ context, jobId: 1 });

    expect(errorLogs).toMatchSnapshot();
  });

  it('should fetch logs with multiple fails and return proper travis error logs', async () => {
    // @ts-ignore
    fetch.mockImplementation(() => Promise.resolve(mockLogWithMultipleFails));

    const errorLogs = await getTravisErrorLogs({ context, jobId: 1 });

    expect(errorLogs).toMatchSnapshot();
  });

  // it('should fetch logs with no failing test and return proper error message', async () => {
  // 	// @ts-ignore
  // 	fetch.mockImplementation(() => Promise.resolve(mockLogWithNoFail));

  // 	console.log('dsdads');
  // 	const errorLogs = await getTravisErrorLogs({ context, jobId: 1 });

  // 	console.log(errorLogs);
  // 	expect(errorLogs).toBe('No logs found, please check your build above');
  // });
});
