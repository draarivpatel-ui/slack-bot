# Aariv Bot - My Hack Club Slack Bot + Live Browser Sandbox

**Try the Live Interactive Slack Sandbox in Your Browser:** [https://aariv.me/slack-bot/](https://aariv.me/slack-bot/)

![Aariv Bot Interactive Slack Simulator](screenshot.png)

I built **Aariv Bot** for the Hack Club Stardance **"Make a Slack Bot"** mission. It is a Node.js + **Slack Bolt (`@slack/bolt`)** bot running over **Socket Mode** (`index.js`) configured for the Hack Club Slack workspace (App ID `A0CBXFS7BKL`), paired with an interactive browser-based `#stardance-bot-testing` Slack simulator (`index.html`) so anyone can test all five `/aariv-*` slash commands and `@Aariv Bot` mentions immediately in the browser.

---

## Why I Built This

When you build a Slack bot inside a huge shared workspace like the Hack Club Slack, two things become annoying right away:
1. **Slash command collisions**: If fifty people register `/ping` or `/roll` in the same workspace, only the most recently installed bot receives the payload. That is why I namespaced all five of my slash commands under `/aariv-*` (`PREFIX = "/aariv-"` at the top of `index.js`).
2. **Testing when your local laptop is asleep**: Since Socket Mode bots run as a local Node.js process over WebSockets (`xapp-` token), a reviewer looking at your GitHub repo when your terminal isn't running can't easily see the bot respond. To solve that, I also built an interactive `#stardance-bot-testing` web sandbox at [https://aariv.me/slack-bot/](https://aariv.me/slack-bot/) that runs the exact command handlers alongside a live Socket Mode WebSocket frame inspector!

---

## All 5 Slash Commands & Event Handlers

| Command / Trigger | Example Input | What I Built It to Do |
|-------------------|---------------|-----------------------|
| **`/aariv-ping`** | `/aariv-ping` | Immediately calls `await ack()`, calculates the round-trip dispatch latency in milliseconds, and replies with `Pong! (Latency: Nms)`. |
| **`/aariv-hello`** | `/aariv-hello` or `/aariv-hello tacos` | Looks up the caller's Slack profile via `client.users.info` (falling back gracefully to `command.user_name` if `users:read` is absent) and greets you by display name—with an extra message if you pass a topic like `tacos`. |
| **`/aariv-roll`** | `/aariv-roll` or `/aariv-roll 3d20` | Full tabletop dice parser (`/^\s*(\d+)?d(\d+)\s*$/i`). Bare `/aariv-roll` rolls `1d6`; passing `NdM` (up to 20 dice of up to 1000 sides) rolls each die individually, prints the breakdown (`[14, 7, 19]`), and sums the total. |
| **`/aariv-fact`** | `/aariv-fact` | Fetches a random verified fact using `axios` from `uselessfacts.jsph.pl/api/v2/facts/random`, with automatic failover to `catfact.ninja/fact` if the primary API times out or errors. |
| **`/aariv-help`** | `/aariv-help` | Prints a formatted Block Kit / Markdown reference sheet of all `/aariv-*` slash commands and mention triggers. |
| **`@Aariv Bot`** | `@Aariv Bot hey there!` | Listens to the `app_mention` event (`app_mentions:read` scope) and replies inside the message thread (`thread_ts: event.thread_ts || event.ts`). |

---

## How It Works Under the Hood

- **Slack Bolt + Socket Mode (`index.js`)**:
  Instead of exposing an HTTP webhook port through ngrok, `index.js` initializes `@slack/bolt` with `socketMode: true` and `appToken: process.env.SLACK_APP_TOKEN`. That opens an outbound WebSocket connection to Slack's event router so slash commands and `app_mention` events stream straight to the local Node process.
- **Fail-Fast Environment Validation**:
  Before calling `app.start()`, I wrote a startup check that verifies `SLACK_BOT_TOKEN` (`xoxb-...`), `SLACK_SIGNING_SECRET`, and `SLACK_APP_TOKEN` (`xapp-...`) are all present in `.env`, printing a clear human-readable checklist if any token is missing.
- **Interactive `#stardance-bot-testing` Web Simulator (`index.html`)**:
  The browser sandbox lets you click quick-run chips or type any `/aariv-*` command into a Slack-style composer. Every command logs the simulated Socket Mode `slash_commands` or `events_api` JSON envelope (`envelope_id`, `payload`, `ack()` timing) in the right-hand inspector panel so you can see how Bolt processes requests under the hood.

---

## What Was Tricky to Build

1. **The 3-Second Slack `ack()` Deadline on External API Calls**:
   Slack requires every slash command to acknowledge (`await ack()`) within 3000ms, or the user sees `operation_timed_out`. In `/aariv-fact`, waiting for an external HTTP request before calling `ack()` risked timing out on slow connections. Calling `await ack()` on the very first line of every command handler before firing the `axios.get()` request with a `4000ms` timeout and secondary API fallback made `/aariv-fact` completely reliable.
2. **Thread-Safe `@Aariv Bot` Replies**:
   When someone mentions `@Aariv Bot` inside an existing Slack thread, passing only `event.ts` as `thread_ts` starts a *nested* reply on the child message instead of staying in the parent thread. Using `thread_ts: event.thread_ts || event.ts` keeps every mention response cleanly attached to the root conversation.

---

## Repository Files

| File | Purpose |
| --- | --- |
| `index.js` | Complete Node.js + `@slack/bolt` Socket Mode bot implementing all 5 `/aariv-*` slash commands and `app_mention` threaded replies. |
| `index.html` | Interactive `#stardance-bot-testing` Slack workspace simulator and Socket Mode payload inspector at [https://aariv.me/slack-bot/](https://aariv.me/slack-bot/). |
| `package.json` | Node dependencies (`@slack/bolt`, `dotenv`, `axios`) and `npm start` script. |
| `.env.example` | Template for `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, and `SLACK_APP_TOKEN`. |
| `screenshot.png` | Screenshot of Aariv Bot running inside the interactive simulator. |
| `BUILD-LOG.md` | Step-by-step engineering log. |

---

## How to Run the Bot Locally

### Option 1: Try the Browser Sandbox Instantly
Open **[https://aariv.me/slack-bot/](https://aariv.me/slack-bot/)** to run `/aariv-ping`, `/aariv-hello`, `/aariv-roll 2d20`, `/aariv-fact`, `/aariv-help`, and `@Aariv Bot` mentions right in your browser.

### Option 2: Run the Live Socket Mode Bot in Slack
1. Clone this repo and install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your Slack App credentials from [api.slack.com/apps](https://api.slack.com/apps) (Socket Mode enabled with `connections:write` for `SLACK_APP_TOKEN`, and Bot Token Scopes `chat:write`, `commands`, `app_mentions:read`, `channels:history`, `users:read` for `SLACK_BOT_TOKEN`):
   ```bash
   cp .env.example .env
   ```
3. Start the bot:
   ```bash
   npm start
   ```
4. Once the terminal prints `⚡ Aariv Bot is running in Socket Mode!`, run `/aariv-ping`, `/aariv-roll 2d20`, or `/aariv-fact` in your Slack channel!
