# Aariv Bot Build Log

My development notes for building **Aariv Bot** for the Hack Club Stardance "Make a Slack Bot" mission.

## 1. Designing the Bot & Avoiding Slash Command Collisions (`index.js`)

1. Followed the Hack Club Stardance JavaScript Slack Bot guide (`@slack/bolt`, Socket Mode, `dotenv`, `axios`).
2. Because generic slash commands like `/ping` or `/roll` collide with other people's bots in the shared Hack Club workspace, I namespaced all five commands with the `/aariv-` prefix:
   - `/aariv-ping`: Replies `Pong!` with millisecond latency.
   - `/aariv-hello`: Looks up the user's Slack profile display name via `users.info` (with graceful fallback to `command.user_name`) and supports optional topic arguments (`/aariv-hello tacos`).
   - `/aariv-roll`: Parses `NdM` tabletop dice notation (`2d20`, `4d6`, etc.), rolls each die, and displays both individual rolls and the sum.
   - `/aariv-fact`: Pulls a random fact via `axios` from `uselessfacts.jsph.pl` with automatic fallback to `catfact.ninja` so an upstream API hiccup never breaks the command.
   - `/aariv-help`: Lists all available commands and syntax examples.
3. Added an `app_mention` event listener that replies in-thread (`thread_ts: event.thread_ts || event.ts`) whenever someone tags `@Aariv Bot`.

## 2. Slack Workspace Configuration & Interactive Web Simulator (`index.html`)

4. Configured **Aariv Bot** in the Hack Club Slack workspace (App ID `A0CBXFS7BKL`) with Socket Mode (`connections:write`), Bot Token Scopes (`chat:write`, `commands`, `app_mentions:read`, `channels:history`, `users:read`), and all five `/aariv-*` slash commands.
5. Built `index.html` as an interactive `#stardance-bot-testing` Slack channel simulator and Socket Mode envelope inspector so anyone visiting `https://aariv.me/slack-bot/` can test all 5 slash commands and `@Aariv Bot` mentions live in the browser even when my local terminal is closed.
