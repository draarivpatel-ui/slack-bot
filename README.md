# Stardance Slack Bot

The Hack Club Stardance mission "Make a Slack Bot", built to the jam guide
(Make your own Slack bot by using JS). The mission page at
https://jams.hackclub.com/batch/slack-bot/ was 404 from this machine, so the
guide markdown was pulled from the GitHub repo
(`hackclub/stardance`, `db/sample_data/slack_bot_guide_js.md`).

Stack is exactly the guide's. Node.js, Slack Bolt, Socket Mode, dotenv, axios.
The bot connects to Slack over a WebSocket, so no public URL or hosting is
needed while testing.

## The commands

All five use the `/aariv-` prefix because the guide warns that generic command
names like `/ping` collide with other bots in the Hack Club workspace (the
most recently installed bot steals the command).

| Command | What it does |
| --- | --- |
| `/aariv-ping` | The guide's first command. Replies Pong with the latency. |
| `/aariv-hello` | Greets you by display name. `/aariv-hello tacos` greets you about tacos. |
| `/aariv-roll` | Dice roller. Bare `/aariv-roll` rolls 1d6, `/aariv-roll 2d20` rolls two twenties and totals them. |
| `/aariv-fact` | The guide's "fun facts bot" extension idea. Pulls a random fact, with a second API as backup. |
| `/aariv-help` | Lists every command. |

It also replies in a thread when you @-mention it (that is what the
`app_mentions:read` scope is for).

## Files

| File | Purpose |
| --- | --- |
| `index.js` | The whole bot. Change `PREFIX` here if you ever rename the commands. |
| `package.json` | Declares `@slack/bolt`, `dotenv`, `axios`. `npm start` runs the bot. |
| `.env.example` | Template for the three secrets. Copy it to `.env` and fill it in. |
| `.gitignore` | Keeps `.env` and `node_modules` out of any repo. |
| `BUILD-LOG.md` | Dated devlog of the build session. |

The build session only wrote these local files. No `npm install`, no Slack
dashboard changes, no git commits. Everything below is for Billy.

## Billy's setup checklist

Do these in order. Budget about 15 minutes. You need to be signed in to Slack
with the Hack Club workspace open (not another workspace).

### Step 1. Create the Slack app

1. Open https://api.slack.com/apps and click **Create New App**.
2. Choose **From scratch**.
3. Name it (for example `Aariv Mission Bot`) and pick the **Hack Club**
   workspace in the dropdown. The name is what people see when the bot
   responds.
4. Click **Create App**.

### Step 2. Turn on Socket Mode and create the app-level token

1. In the left sidebar click **Socket Mode** and toggle it on.
2. Slack asks for an app-level token. Go to **Basic Information** in the
   sidebar, scroll to **App-Level Tokens**, click **Generate Token and
   Scopes**.
3. Name it `mission-bot-socket` and add the **`connections:write`** scope.
4. Click **Generate** and copy the token right away. It starts with
   `xapp-`. This is the `SLACK_APP_TOKEN` for Step 6.

### Step 3. Add the bot token scopes

1. Click **OAuth & Permissions** in the sidebar.
2. Scroll to **Bot Token Scopes** and click **Add an OAuth Scope** for each
   of these.

   ```txt
   chat:write
   commands
   app_mentions:read
   channels:history
   ```

3. Optional but nice, add **`users:read`** too so `/aariv-hello` can greet
   people by display name instead of handle. The bot works without it.

### Step 4. Register the five slash commands

For each command below, click **Slash Commands** in the sidebar, then
**Create New Command**, fill in the three fields, and **Save**. Names are
case-sensitive and must match the code exactly.

| Command | Short description | Usage hint |
| --- | --- | --- |
| `/aariv-ping` | Check the bot is alive and its latency | (leave empty) |
| `/aariv-hello` | The bot greets you by name | anything, e.g. tacos |
| `/aariv-roll` | Roll dice in NdM form | e.g. 2d20 or empty for 1d6 |
| `/aariv-fact` | Get a random fun fact | (leave empty) |
| `/aariv-help` | List everything the bot can do | (leave empty) |

The form also asks for a **Request URL**. Socket Mode apps do not use one, so
type any placeholder such as `https://example.com/slack/events` and move on.
Only the command name, description and hint matter.

If Slack rejects a name because another bot already has it, pick a new prefix
and change `PREFIX` in `index.js` plus these five rows to match.

### Step 5. Install the app to the workspace

1. Click **Install App** in the sidebar, then **Install to Workspace** and
   allow the permissions.
2. Back on **OAuth & Permissions**, find **Bot User OAuth Token** and copy
   it. It starts with `xoxb-`. This is the `SLACK_BOT_TOKEN` for Step 6.

(The guide installs before registering commands. Installing last means Slack
grants scopes and commands in one go with no reinstall prompt.)

### Step 6. Paste the tokens into .env

In this folder, copy the template and open it.

```bash
cp .env.example .env
```

Then fill in each value from the right Slack page.

| `.env` key | Where it comes from | Looks like |
| --- | --- | --- |
| `SLACK_BOT_TOKEN` | OAuth & Permissions, after Step 5 | `xoxb-...` |
| `SLACK_SIGNING_SECRET` | Basic Information, **App Credentials** section | a random string |
| `SLACK_APP_TOKEN` | Basic Information, App-Level Tokens, from Step 2 | `xapp-...` |

`.env` is gitignored. Never paste these tokens into code, screenshots or
chats. If one ever leaks, regenerate it on the same Slack pages (there is a
regenerate button for the signing secret and you can delete and recreate
app-level tokens).

### Step 7. Install dependencies and run

```bash
npm install
npm start
```

Wait for `bot is running!` in the terminal. Leave the terminal open while
testing.

### Step 8. Test every command

In the Hack Club Slack, type these in any channel you can post in (or in a DM
with the bot, which you can open from the app's page under your Apps list).

| Type | Expect |
| --- | --- |
| `/aariv-ping` | `Pong! Latency Nms` |
| `/aariv-hello` | A greeting with your display name |
| `/aariv-roll` | One d6 roll |
| `/aariv-roll 2d20` | Two d20 rolls and a total |
| `/aariv-fact` | A random fun fact |
| `/aariv-help` | The command list |
| `@Aariv Mission Bot hi` in a channel the bot is in | A threaded reply |

## If something does not work

- **Nothing happens when you run a command.** Check the terminal running the
  bot for errors. Confirm the command name in Slack matches the code
  character for character. Confirm `xoxb-` went into `SLACK_BOT_TOKEN` and
  `xapp-` into `SLACK_APP_TOKEN` (swapping them is the most common mistake).
- **Slack shows "dispatch_failed" or a timeout.** The bot must `ack()` within
  about 3 seconds. This code acks first in every command, so this usually
  means the bot process is not actually running.
- **A command runs another bot's action.** A name collision, exactly what the
  guide warns about. Rename to a fresh prefix (code and dashboard together).
- **The mention reply never comes.** The bot must be a member of that
  channel. Invite it with `/invite @Aariv Mission Bot`.
- **Lost a token.** App-level tokens live under Basic Information,
  App-Level Tokens (click the token name). The bot token lives under OAuth &
  Permissions. The signing secret lives under Basic Information,
  App Credentials.
- **Changed scopes or commands after installing.** Open Install App and click
  through again, Slack sometimes needs the reinstall to apply them.

## Later, hosting it 24/7

The guide's deployment path is a free Hack Club Nest server with systemd.
Short version, after the bot works locally.

1. Push the code to a fresh GitHub repo. This folder already sits inside a
   local git repo, so check `git status` first and confirm `.env` does not
   appear before anything is pushed.
2. Clone the repo on Nest, run `npm install`, and recreate `.env` there with
   `nano .env` (same three tokens).
3. Create `~/.config/systemd/user/slackbot.service` following the guide's
   template, then enable it with
   `systemctl --user enable --now slackbot.service`.
4. Read logs with `journalctl --user -u slackbot.service`.

Full details with the exact service file are in the guide's "Run it 24/7 on
Nest" section.
