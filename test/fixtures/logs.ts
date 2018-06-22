export const mockLogWithFailNotFinal = {
  json: () => ({
    content: '',
    log_parts: [
      {
        content: 'Now using node v8.11.3 (npm v5.6.0)\r\n\r\ntravis_t',
        final: false,
        number: 0,
      },
      {
        content:
          'travis_fold:start:install.yarn\r\u001b[0Ktravis_fold:end:install.yarn\r\u001b[0K' +
          '$ node --version\r\nv8.11.3\r\n$ npm --version\r\n5.6.0\r\n$ nvm --version\r\n0.' +
          '33.11\r\n$ yarn --version\r\n',
        final: false,
        number: 1,
      },
      {
        content:
          '\u001b[2K\u001b[1G\u001b[1myarn run v1.3.2\u001b[22m\r\n\u001b[2K\u001b[1G\u001b' +
          '[2m$ jest\u001b[22m\r\n',
        final: false,
        number: 2,
      },
      {
        content:
          '\u001b[0m\u001b[7m\u001b[1m\u001b[31m FAIL \u001b[39m\u001b[22m\u001b[27m\u001b[0m \u001b[2m./\u001b[22m\u001b[1mfail.test.js\u001b[22m\r\n  \u001b[31m✕\u001b[39m \u001b[2mmistakes 1 + 2 to equal 4 (13ms)\u001b[22m\r\n\r\n\u001b[1m\u001b[31m  \u001b[1m● \u001b[1mmistakes 1 + 2 to equal 4\u001b[39m\u001b[22m\r\n\r\n    \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).toBe(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // Object.is equality\u001b[22m\r\n\r\n    Expected: \u001b[32m4\u001b[39m\r\n    Received: \u001b[31m3\u001b[39m\r\n\u001b[2m\u001b[22m\r\n\u001b[2m    \u001b[0m \u001b[90m 1 | \u001b[39mtest(\u001b[32m\'mistakes 1 + 2 to equal 4\'\u001b[39m\u001b[33m,\u001b[39m () \u001b[33m=>\u001b[39m {\u001b[0m\u001b[22m\r\n\u001b[2m    \u001b[0m\u001b[31m\u001b[1m>\u001b[2m\u001b[39m\u001b[90m 2 | \u001b[39m\texpect(\u001b[35m1\u001b[39m \u001b[33m+\u001b[39m \u001b[35m2\u001b[39m)\u001b[33m.\u001b[39mtoBe(\u001b[35m4\u001b[39m)\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\r\n\u001b[2m    \u001b[0m \u001b[90m   | \u001b[39m\t              \u001b[31m\u001b[1m^\u001b[2m\u001b[39m\u001b[0m\u001b[22m\r\n\u001b[2m    \u001b[0m \u001b[90m 3 | \u001b[39m})\u001b[33m;\u001b[39m\u001b[0m\u001b[22m\r\n\u001b[2m    \u001b[0m \u001b[90m 4 | \u001b[39m\u001b[0m\u001b[22m\r\n\u001b[2m\u001b[22m\r\n\u001b[2m      \u001b[2mat Object.<anonymous>.test (\u001b[2m\u001b[0m\u001b[36mfail.test.js\u001b[39m\u001b[0m\u001b[2m:2:16)\u001b[2m\u001b[22m\r\n\r\n\u001b[999D\u001b[K\u001b[1mTest Suites: \u001b[22m\u001b[1m\u001b[31m1 failed\u001b[39m\u001b[22m, 1 total\r\n\u001b[1mTests:       \u001b[22m\u001b[1m\u001b[31m1 failed\u001b[39m\u001b[22m, 1 total\r\n\u001b[1mSnapshots:   \u001b[22m0 total\r\n\u001b[1mTime:\u001b[22m        1.347s\r\n\u001b[2mRan all test suites\u001b[22m\u001b[2m.\u001b[22m\r\n\u001b[2K\u001b[1G\u001b[31merror\u001b[39m Command failed with exit code 1.\r\n\u001b[2K\u001b[1G\u001b[34minfo\u001b[39m Visit \u001b[1mhttps://yarnpkg.com/en/docs/cli/run\u001b[22m for documentation about this command.\r\n\r\ntravis_time:end:112274d0:start=1529624983250771640,finish=1529624986585326794,duration=3334555154\r\u001b[0K\r\n\u001b[31;1mThe command "yarn test" exited with 1.\u001b[0m\r\n\r\nDone. Your build exited with 1.\r\n',
        final: false,
        number: 3,
      },
      {
        content: '',
        final: true,
        number: 4,
      },
    ],
  }),
};

export const mockLogWithMultipleFails = {
  json: () => ({
    content: '',
    log_parts: [
      {
        content:
          '\u001b[2K\u001b[1G\u001b[1myarn run v1.3.2\u001b[22m\r\n\u001b[2K\u001b[1G\u001b' +
          '[2m$ jest\u001b[22m\r\n\u001b[0m\u001b[7m\u001b[1m\u001b[31m FAIL this is a mock fail',
        final: false,
        number: 0,
      },
      {
        content:
          '\u001b[0m\u001b[7m\u001b[1m\u001b[31m FAIL \u001b[1b[2m\u001b[0m\u001b[36mfail.test.js\u001b[39m\u001b[0m\u001b[2m:2:16)\u001b[2m\u001b[22m\r\n\r\n\u001b[999D\u001b[K\u001b[1mTest Suites: \u001b[22m\u001b[1m\u001b[31m1 failed\u001b[39m\u001b[22m, 1 total\r\n\u001b[1mTests:       \u001b[22m\u001b[1m\u001b[31m1 failed\u001b[39m\u001b[22m, 1 total\r\n\u001b[1mSnapshots:   \u001b[22m0 total\r\n\u001b[1mTime:\u001b[22m        1.347s\r\n\u001b[2mRan all test suites\u001b[22m\u001b[2m.\u001b[22m\r\n\u001b[2K\u001b[1G\u001b[31merror\u001b[39m Command failed with exit code 1.\r\n\u001b[2K\u001b[1G\u001b[34minfo\u001b[39m Visit \u001b[1mhttps://yarnpkg.com/en/docs/cli/run\u001b[22m for documentation about this command.\r\n\r\ntravis_time:end:112274d0:start=1529624983250771640,finish=1529624986585326794,duration=3334555154\r\u001b[0K\r\n\u001b[31;1mThe command "yarn test" exited with 1.\u001b[0m\r\n\r\nDone. Your build exited with 1.\r\n',
        final: true,
        number: 1,
      },
    ],
  }),
};

export const mockLogWithNoFails = {
  json: () => ({
    content: '',
    log_parts: [
      {
        content: 'This is not',
        final: false,
        number: 0,
      },
      {
        content: 'The droid you are looking for',
        final: true,
        number: 1,
      },
    ],
  }),
};
