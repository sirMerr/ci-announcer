import fetch from 'node-fetch';
import { getTravisErrorLogs } from '../src/lib/travis';
import { mockErrorLog } from './fixtures/errorLogs';
import { mockLogWithFail } from './fixtures/logs';

jest.mock('node-fetch');

test('should fetch and return proper travis error logs', async () => {
  const context = {
    log: jest.fn(),
  } as any;

  context.log.info = jest.fn();

  // @ts-ignore
  fetch.mockImplementation(() => Promise.resolve(mockLogWithFail));

  const errorLogs = await getTravisErrorLogs({ context, jobId: 1 });

  expect(errorLogs.replace(/\s/g, '')).toBe(mockErrorLog.replace(/\s/g, ''));
});
