const { Client, Intents } = require("discord.js");

const token = process.env.SERVER_TOKEN;
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.once("ready", async () => {
  console.log("Ready!");
});

module.exports = function logToDiscord(msg) {
  try {
    client.channels.cache.get(process.env.BOT_CHANNEL_ID).send(msg);
  } catch (e) {
    console.error(e)
  }
}

client.login(token);
