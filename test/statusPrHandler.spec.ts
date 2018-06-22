import { statusPrHandler } from '../src/lib/statusPrHandler';
import buildMockData from './fixtures/build_data.json';
import { getTravisBuildData, getTravisErrorLogs } from '../src/lib/travis';
import { mockErrorLog } from './fixtures/errorLogs';

jest.mock('../src/lib/travis');

describe('will mock github webhook with failure status and travis', () => {
  it('succeed to call statusPrHandler', async () => {
    const github = {
      issues: {
        createComment: jest.fn(),
      },
    };

    //@ts-ignore
    getTravisBuildData.mockImplementation(() => Promise.resolve(buildMockData));
    //@ts-ignore
    getTravisErrorLogs.mockImplementation(() => Promise.resolve(mockErrorLog));

    //@ts-ignore
    await statusPrHandler(
      {
        context: {
          github,
          log: {
            info: jest.fn(),
            error: jest.fn(),
          },
          payload: {
            target_url:
              'https://travis-ci.org/1fsdsa/ci-announcer-tester/builds/394661277?utm_source=github_status&utm_medium=notification',
          },
        } as any,
        owner: 'tester',
        repo: 'testRepo',
      },
      getTravisBuildData,
      getTravisErrorLogs
    );

    expect(github.issues.createComment.mock.calls.length).toBe(1);
  });
});
