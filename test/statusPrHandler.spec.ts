import { statusPrHandler } from '../src/lib/statusPrHandler';
// import {createRobot} from 'probot';
// import probotPlugin from '../index';
// import payloadMockFailureCi from './fixtures/payload_failure_ci.json';
import buildMockData from './fixtures/build_data.json';
import jobLogMockData from './fixtures/job_log_data.json';
// import { getTravisBuildData, getTravisErrorLogs} from '../src/lib/travis';

jest.mock('../src/lib/travis');

describe('will mock github webhook with failure status and travis', () => {
  // let robot: any, github: any;
  // const event = { event: 'status', payload: payloadMockFailureCi};

  // beforeEach(() => {
  //     robot = createRobot({
  //         app: jest.fn(),
  //         cache: jest.fn() as any,
  //         catchErrors: true
  //     });

  //     github = {
  //         issues: {
  //             createComment: jest.fn()
  //         }
  //     }

  //     robot.auth = () => Promise.resolve(github);
  //     probotPlugin(robot);
  // });

  // it('should call createComment and match the snapshot', async () => {
  //     // @ts-ignore
  // 	fetch.mockImplementation(
  // 		() => Promise.resolve({json: () => 'dataMock'}));

  //     const getTravisBuildData = jest.fn();
  //     await robot.receive(event);

  //     getTravisBuildData.mockReturnValueOnce('')
  //     expect(github.issues.createComment).toHaveBeenCalledTimes(1);
  //     expect(github.issues.createComment.mock.call[0]).toMatchSnapshot();
  //     return;
  // });

  it('succeed to call statusPrHandler', async () => {
    const getTravisBuildData = jest.fn();
    const getTravisErrorLogs = jest.fn();
    const github = {
      issues: {
        createComment: jest.fn(),
      },
    };
    getTravisBuildData.mockReturnValue({ json: () => buildMockData });
    getTravisErrorLogs.mockReturnValue({ json: () => jobLogMockData });

    await statusPrHandler({
      context: {
        log: {
          info: jest.fn(),
        },
        payload: {
          target_url:
            'https://travis-ci.org/1fsdsa/ci-announcer-tester/builds/394661277?utm_source=github_status&utm_medium=notification',
        },
      } as any,
      owner: 'tester',
      repo: 'testRepo',
    });

    expect(github.issues.createComment.mock.calls.length).toBe(1);
  });
});
