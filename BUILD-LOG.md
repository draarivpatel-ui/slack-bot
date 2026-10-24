# Slack bot build log (2026-10-24)

Built in one session by an AI agent under Aariv's direction, for the Stardance
mission "Make a Slack Bot". Local files only. No npm install, no Slack
dashboard contact, no git commit or push in this session.

1. Pulled the mission guide. `jams.hackclub.com/batch/slack-bot/` 404s from
   this machine, so the markdown came from the GitHub API instead
   (`hackclub/stardance`, `db/sample_data/slack_bot_guide_js.md`, 526 lines).
   Stack per the guide is Node.js, Slack Bolt, Socket Mode, dotenv, axios.
2. Scaffolded the folder `work/stardance-missions/slack-bot/` with
   `package.json` (dependency versions checked against the live npm registry,
   Bolt 5, dotenv 18, axios 1), `.env.example` with placeholder tokens only,
   and `.gitignore`.
3. Wrote `index.js` with five slash commands on the `/aariv-` prefix. The
   guide warns that generic names like `/ping` get stolen by whichever bot
   installed last in the Hack Club workspace, so every command carries the
   prefix.
   - `/aariv-ping`, the guide's first command, replies Pong with latency.
   - `/aariv-hello` greets the runner by display name, falling back to the
     handle when the optional `users:read` scope is not granted.
   - `/aariv-roll` parses NdM dice syntax (`2d20`), defaults to 1d6, and
     totals multi-dice rolls.
   - `/aariv-fact` is the "fun facts bot" idea from the guide's "Ideas to
     extend your bot" list. It tries uselessfacts.jsph.pl first and
     catfact.ninja as backup, both wrapped in try/catch like the guide's API
     commands.
   - `/aariv-help` lists everything, following the guide's help pattern.
4. Added two guide-aligned extras. An `app_mention` handler that replies in a
   thread (this is what the guide's `app_mentions:read` scope is for), and an
   `app.error` logger so Bolt failures show in the terminal.
5. Verified `index.js` with `node --check`. Passed. `npm install` was not
   needed for the check and was deliberately skipped per the mission brief.
6. Wrote `README.md` as Billy's click-by-click Slack setup checklist. It
   follows the guide's Slack app flow (create app, Socket Mode token, scopes,
   five commands, install, paste tokens, run, test) with a troubleshooting
   section and the Nest hosting path summarized at the end.

Left for Billy, all of it in the Slack dashboard and terminal. Create the app
in the Hack Club workspace, register the five commands, install, paste the
three tokens into `.env`, `npm install`, `npm start`, test. Then GitHub and
Nest if the mission wants it hosted.

Devlog moments. Steps 3 and 4 are each a devlog-sized chunk. The money shot
for the project page is a screenshot of the first `Pong!` reply, and a second
one of `/aariv-roll 2d20`.
