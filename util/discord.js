import { Client, Intents } from "discord.js";

const token = process.env.SERVER_TOKEN;
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.once("ready", async () => {
  console.log("Ready!");
});

export default async function logToDiscord(msg) {
  client.channels.cache.get(process.env.BOT_CHANNEL_ID).send(msg);
}

client.login(token);
