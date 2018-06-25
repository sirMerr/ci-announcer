# ci-announcer

> A GitHub App built with [Probot](https://github.com/probot/probot) that announces when CI fails

<img width="640" alt="screen shot 2018-06-25 at 2 15 43 pm" src="https://user-images.githubusercontent.com/11183523/41867873-580f32fe-7882-11e8-87ff-2d570dd0278f.png">

Demo: https://github.com/sirMerr/ci-announcer-tester/pull/3

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

Firstly I decided I would be using **Probot + TravisCI + Jest** as my use case. I read through TravisCI and Probot docs, and set up a small probot app and testing that it worked with a Travis.

I checked what endpoints gets triggered when a TravisCI build starts, what returns the logs and found what could be markers for the error logs I wanted displayed. I looked through my travis build's job logs and other public repos with:

1.  The TravisCI build URL
2.  The enpoints: TravisCI `/build/[buildId]` -> `/job/[jobId]` Enpoint -> `job/[jobId]/log`

I ended finding that every repo using Jest would have: `\u001b[31m FAIL` as a starting marker, `\u001b[31m` representing bold and red ANSI, (could have a few fails) and `'\r\n\r\n\u001b[999D\u001b[K\u001b[1mTest Suites:'` to indicate when it would end.

<img width="338" alt="screen shot 2018-06-25 at 1 28 58 pm" src="https://user-images.githubusercontent.com/11183523/41867668-c3be261e-7881-11e8-8297-ef64ece42239.png">

<img width="424" alt="screen shot 2018-06-25 at 2 12 38 pm" src="https://user-images.githubusercontent.com/11183523/41867700-d7c87bfa-7881-11e8-8c7c-add2babc3ca6.png">

At this point I knew I needed to have

- A trigger ONLY for failing TravisCI builds
- An error log for 1 or more failing tests
- An error log if the markers were not found in case of a fallthrough (no Jest test)
- A way to make sure the length was not too long as to not overwhelm users.

I pseudo-coded how the app would run:
**It should listen for failing Travis builds on PRs, get the build from `/build/[buildId]`, from that, use the build's `jobId` to get the job log from `/job/[jobId]/log`. It would take the log parts array, look from bottom to top until it found the parts with the markers, remove ANSI and unicode characters, build the error message and send a new issue comment.**

So on I went to look at GitHub webhooks, specifically what triggers a [status event](https://developer.github.com/v3/activity/events/types/#statusevent). I found that I could listen for only status events that had `failure` payload state and `continuous-integration/travis-ci/pr` as a payload context.

I then began building the logger while writing my tests and determining how the logs should be displayed as written above.

## Challenges

- I found that TravisCI logs has to be polled, as the job logs received from the endpoint is updated as it gets more, instead of receiving the entirety of the logs at once.

  I had different ways to get and parse the logs:

  1.  Poll `log_parts` until `final: true` was found or the markers were found and use `log_parts` to make the message
  2.  Poll `log_parts` until `final: true` was found and use `content` (full logs) to find the markers and make the message
  3.  Poll `log_parts` until `final: true` was found and use `log.txt` to find the markers and make the message.

  I decided not to use the `log.txt` option because it did not have the ANSI and Unicode, and I wanted to be able to use them in my markers in case a test had the key words by themselves or in case I'd want to add emphasis to them later. I didn't use the second one because I wanted to be able to stop polling if I had already found the markers, as to not make unecessary calls.

- I used typescript with Probot, which was still somewhat in beta so there were a few definitions missing and no default generator for TypeScript with Probot, but it did not cause a problem. Although I do feel like I could have not used typescript, and would have saved some time.

## Next steps

- I tried consuming a chunked request instead of polling, but the Travis API was causing issues. It might be worth to revisit it to optimize this.
- In parallel to receiving the logs, strip ANSI and Unicode characters.
- Add support for GitHub spoilers to allow more lines without overwhelming the user.
- Add bold/italic/etc 🎨
- Provide the full commands that fail
- Add option to print a variable amount of lines for each failing test
- Add support for other test frameworks
- Add support for private repos
