// Stardance mission bot ("Make a Slack Bot" jam).
// Stack from the guide. Node.js, Slack Bolt, Socket Mode, dotenv, axios.
//
// Every slash command uses the /aariv- prefix. The guide warns that generic
// names like /ping collide with other bots in the Hack Club workspace, and the
// most recently installed bot takes the command over. Change the PREFIX below
// AND the command names in the Slack dashboard together if you ever rename it.

require("dotenv").config();

const { App } = require("@slack/bolt");
const axios = require("axios");

const PREFIX = "aariv";

if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_APP_TOKEN) {
  console.error(
    "Missing tokens. Copy .env.example to .env, then paste SLACK_BOT_TOKEN (xoxb-...) " +
      "and SLACK_APP_TOKEN (xapp-...). See README.md for where each one comes from."
  );
  process.exit(1);
}

const app = new App({
  token: process.env.SLACK_BOT_TOKEN, // xoxb- token, used to act in the workspace
  signingSecret: process.env.SLACK_SIGNING_SECRET, // unused in Socket Mode, kept for a future HTTP switch
  appToken: process.env.SLACK_APP_TOKEN, // xapp- token, used by Socket Mode
  socketMode: true
});

// /aariv-ping - the guide's first command, replies with local latency.
app.command(`/${PREFIX}-ping`, async ({ ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong! Latency ${latency}ms` });
});

// /aariv-hello - greets the runner by name. /aariv-hello tacos greets them
// about tacos too. command.user_name is only the handle, so try users.info
// for the display name first and fall back quietly if users:read is not granted.
app.command(`/${PREFIX}-hello`, async ({ command, ack, respond, client }) => {
  await ack();

  let name = command.user_name;
  try {
    const info = await client.users.info({ user: command.user_id });
    const user = (info && info.user) || {};
    const profile = user.profile || {};
    name = profile.display_name || profile.real_name || user.name || command.user_name;
  } catch (err) {
    // users:read scope missing or lookup failed, the handle still works
  }

  const extra = (command.text || "").trim();
  const message = extra
    ? `Hello, ${name}! You said "${extra}".`
    : `Hello, ${name}! Type /${PREFIX}-help to see what else I can do.`;
  await respond({ text: message });
});

// /aariv-roll - dice roller with NdM syntax. Bare /aariv-roll rolls 1d6,
// /aariv-roll 2d20 rolls two twenty-sided dice and totals them.
function parseDice(text) {
  const match = (text || "").trim().toLowerCase().match(/^(\d{1,2})?d(\d{1,4})$/);
  if (!match) return null;
  const count = match[1] ? parseInt(match[1], 10) : 1;
  const sides = parseInt(match[2], 10);
  if (count < 1 || count > 10 || sides < 2 || sides > 1000) return null;
  return { count, sides };
}

app.command(`/${PREFIX}-roll`, async ({ command, ack, respond }) => {
  await ack();

  const text = (command.text || "").trim();
  const dice = text ? parseDice(text) : parseDice("1d6");
  if (!dice) {
    await respond({
      text: `I did not understand "${text}". Try /${PREFIX}-roll or /${PREFIX}-roll 2d20.`
    });
    return;
  }

  const rolls = [];
  for (let i = 0; i < dice.count; i += 1) {
    rolls.push(Math.floor(Math.random() * dice.sides) + 1);
  }
  const total = rolls.reduce((sum, n) => sum + n, 0);
  const label = `${dice.count}d${dice.sides}`;
  const breakdown = dice.count > 1 ? ` (${rolls.join(", ")})` : "";
  await respond({ text: `Rolled ${label}${breakdown} for a total of ${total}` });
});

// /aariv-fact - the "fun facts bot" idea from the guide's extension list.
// Two free fact APIs in priority order so one outage does not break the command.
const FACT_SOURCES = [
  {
    url: "https://uselessfacts.jsph.pl/api/v2/facts/random",
    pick: (data) => data.text
  },
  {
    url: "https://catfact.ninja/fact",
    pick: (data) => data.fact
  }
];

async function fetchFact() {
  for (const source of FACT_SOURCES) {
    try {
      const response = await axios.get(source.url, { timeout: 5000 });
      const fact = source.pick(response.data);
      if (fact) return fact;
    } catch (err) {
      // fall through to the next source
    }
  }
  return null;
}

app.command(`/${PREFIX}-fact`, async ({ ack, respond }) => {
  await ack();
  const fact = await fetchFact();
  if (fact) {
    await respond({ text: `Fun fact\n${fact}` });
  } else {
    await respond({ text: "Could not reach a fact API right now. Try again in a moment." });
  }
});

// /aariv-help - the guide's help command pattern.
app.command(`/${PREFIX}-help`, async ({ ack, respond }) => {
  await ack();
  await respond({
    text: [
      "Available commands",
      `/${PREFIX}-ping - check bot latency`,
      `/${PREFIX}-hello - say hello (add a word and the bot greets you back about it)`,
      `/${PREFIX}-roll - roll a dice, bare for 1d6 or like /${PREFIX}-roll 2d20`,
      `/${PREFIX}-fact - a random fun fact`,
      `/${PREFIX}-help - this list`
    ].join("\n")
  });
});

// Reply in a thread when someone @-mentions the bot. This is what the
// app_mentions:read scope from the guide is for.
app.event("app_mention", async ({ event, say }) => {
  await say({
    text: `Hi <@${event.user}>! Type /${PREFIX}-help to see what I can do.`,
    thread_ts: event.ts
  });
});

app.error(async (error) => {
  console.error("Bolt error", error);
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();
