const { Client, Intents, Channel } = require("discord.js");
const token = process.env.SERVER_TOKEN;
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});

/**
 *
 * @param {Channel} channel
 * @param {number} limit
 * @returns
 */
const usermap = new Map();
const sum_messages = [];
let cache;
let last_id;
async function lots_of_messages_getter(channel, limit = 20000) {
  let end;
  while (!end) {
    try {
      const options = { limit: 100 };
      if (last_id) {
        options.before = last_id;
      }

      const messages = await channel.messages.fetch(options);
      messages.forEach((message) => {
        try {
          const discordId = ((message || {}).content || "")
            .split("User-ID: ")[1]
            .split("\n")[0];
          const pubkey = ((message || {}).content || "")
            .split("Pubkey: ")[1]
            .split("\n")[0];

          if (!usermap.has(discordId) && pubkey) {
            usermap.set(discordId, pubkey);
            sum_messages.push({ discordId, pubkey });
          }
        } catch {}
      });
      last_id = messages.last().id;
      cache = Array.from(usermap).filter((m) => !!m);

      console.log(`Current size: ${sum_messages.length}`);

      console.log({ msize: messages.size });
      if (messages.size != 100 || sum_messages.length >= limit) {
        end = true;
        console.log("end");
        console.log(Object.keys(cache).length);
      }
    } catch {}
  }

  return sum_messages;
}
client.once("ready", async (_client) => {
  console.log("Ready!");
  const channel = _client.channels.cache.get("946729044857200640");

  await lots_of_messages_getter(channel);
  setTimeout(async () => {
    await lots_of_messages_getter(channel);
  }, 60000);
});
var express = require("express");
var router = express.Router();
router.get("/all", async function (req, res, next) {
  res.status(200).send(cache);
});
router.get("/one", async function (req, res, next) {
  const { pubkey } = req.query;
  const found = cache.some((c) => c[1] === pubkey);
  res.status(200).send({ found });
});

client.login(token);

module.exports = router;