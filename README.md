# ci-announcer

> A GitHub App built with [Probot](https://github.com/probot/probot) that announces when CI fails

## Setup

Create a `.env` file, following the [official Probot instructions](https://probot.github.io/docs/development/#configuring-a-github-app)

```sh
# Install dependencies
yarn
npm install

# Run the bot
yarn start
npm start

# Run the bot with watcher
yarn start:watch
npm start:watch
```

## Approach

Firstly I decided I would be using Probot + TravisCI + Jest as my use case. I read through TravisCI and Probot docs, and set up a small probot app and testing that it worked with a Travis.

I checked what enpoints gets triggered when a TravisCI build starts, what returns the logs and found what could be a delimiter for the error logs I wanted displayed. I looked through my travis build's job logs and other public repos with:

1.  The TravisCI build URL
2.  The enpoints: TravisCI `/build/[buildId]` -> `/job/[jobId]` Enpoint -> `job/[jobId]/log`

I ended finding that every repo using Jest would have: `\u001b[31m FAIL` as a starting delimiter, `\u001b[31m` representing bold and red ANSI, (could have a few fails) and `'\r\n\r\n\u001b[999D\u001b[K\u001b[1mTest Suites:'` to indicate when it would end.

At this point I knew I needed to have

- A trigger ONLY for failing TravisCI builds
- An error log for 1 or more failing tests
- An error log if the delimiters were not found in case of a fallthrough (no jest test)
- A way to make sure the length was not too long as to not overwhelm users.

I pseudo-coded how the app would run:
**It should listen for failing travis builds on PRs, get the build from `/build/[buildId]`, from then on, the job log from `/job/[jobId]/log`. It would take the log parts array, look from bottom to top until it found the parts with the delimiters, remove ANSI and unicode characters, build the error message and send a new issue comment.**

So on I went to look at GitHub webhooks, specifically what triggers a [status event](https://developer.github.com/v3/activity/events/types/#statusevent). I found that I could listen for only status events that had `failure` payload state and `continuous-integration/travis-ci/pr` as a payload context.

I had my condition. I started building the rest while writing my tests and determining how I wanted my logs to show.

## Challenges

- I found that Travis logs has to be polled, as the job logs received from the endpoint is updated as it gets more, instead of receiving the entirety of the logs at once.

- I found that I had different ways to get the logs:

  1.  Poll `log_parts` until `final: true` was found or the delimiters were found and use `log_parts` to make the message
  2.  Poll `log_parts` until `final: true` was found and use `content` (full logs) to find the delimiters and make the message
  3.  Poll `log_parts` until `final: true` was found and use `log.txt` to find the delimiters and make the message.

  I decided not to use the `log.txt` option because I wanted to be able to use the Unicode and ANSI in my delimiters in case a test had the key words by themselves or in case I'd want to add emphasis to them later. I didn't use the second one because I wanted to be able to stop polling if I had already found the delimiters, as to not make unecessary calls.

- I used typescript with Probot, which was still somewhat in beta so there were a few definitions missing and no default generator for typescript with probot (although that wasn't too much of an issue). I do feel like I could have not used typescript, and would have saved some time.
- Going through the array backwards was interesting as I had to make sure not to end my loops early.

## Next steps

- I attempted to use `http.on('data')` and `http.on('end')`, but ended up polling the data using a `while` and `sleep` instead. It might be worth to revisit it to optimize this.
- 🎨 Add bold/etc
- Add failing command for each failing test
- Add option to print x amount of lines for each failing test
- Allow use of other test frameworks
- Optimize building of error logs, by removing ANSI and unicode while the logs are being pushed when found.
- Add more error handlers
- Allow user to put TRAVIS URL for private and public and link the proper API key to it
