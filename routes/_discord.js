const { Client, Intents } = require("discord.js");


const token = process.env.SERVER_TOKEN;
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
client.once("ready", async (_client) => {
  console.log("Ready!");
});


client.on("messageCreate", async (message) => {
  console.log("message");
  console.log(message.channelId);
  if (message.author.bot) return;

  const { content } = message;

  if (content.toLowerCase().startsWith("!whitelist")) {
    try {
      console.log( message.guild.roles)
      let whitelistRole = message.guild.roles.cache.find(role => role.name === 'DELTA FORCE')
      const hasRole = message.member.roles.cache.has(whitelistRole);
      // TODO: save address/handle for signature.
      client.channels.cache
        .get(message.channelId)
        .send(
          `<@${message.author.id}>: Registered! Please visit https://wl.cryptostraps.io to register for WL.`
        );
    } catch (e) {
      client.channels.cache
        .get(message.channelId)
        .send(
          `<@${message.author.id}>: Error: ${e}`
        );
    }
    //  client.channels.cache.get('')
  }
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