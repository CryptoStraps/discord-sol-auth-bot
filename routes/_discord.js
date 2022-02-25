const { Client, Intents, Channel } = require("discord.js");
const token = process.env.SERVER_TOKEN;
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});


function logToDiscord(msg) {
  try {
    client.channels.cache.get(process.env.BOT_CHANNEL_ID).send(msg);
  } catch (e) {
    console.error(e);
  }
}

client.login(token);

module.exports = { logToDiscord, client };
