import { Client, Intents } from "discord.js";
import e from "express";

const token = process.env.SERVER_TOKEN;
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.once("ready", async () => {
  console.log("Ready!");
});

export default async function logToDiscord(msg) {
  try {
    client.channels.cache.get(process.env.BOT_CHANNEL_ID).send(msg);
  } catch (e) {
    
  }
}

client.login(token);
