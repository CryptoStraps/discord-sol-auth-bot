const { Client, Intents } = require("discord.js");


const token = process.env.SERVER_TOKEN;
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
client.once("ready", async (_client) => {
  console.log("Ready!");
});

function logToDiscord(msg) {
  try {
    client.channels.cache.get(process.env.BOT_CHANNEL_ID).send(msg);
  } catch (e) {
    console.error(e);
  }
};

client.login(token);

module.exports = { logToDiscord, client }