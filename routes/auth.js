const { logToDiscord, client } = require("./_discord");
var express = require("express");
var router = express.Router();
const fetch = require("../util/fetch");
const {
  Keypair,
  Transaction,
  TransactionInstruction,
  PublicKey,
} = require("@solana/web3.js");
const { Wallet, web3 } = require("@project-serum/anchor");
const { GuildMember, GuildMemberManager } = require("discord.js");
const API_ENDPOINT = process.env.DISCORD_API_ENDPOINT;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const connection = new web3.Connection("https://alice.genesysgo.net");
const walletKeypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(process.env.SOL_KEY))
);
const wallet = new Wallet(walletKeypair);

const map = new Map();

/* GET home page. */
router.get("/", async function (req, res, next) {
  const { code } = req.query;
  if (!code) {
    res.status(200).send({});
    return;
  }
  const data = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URI,
    scope: "identify",
  };
  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    params.append(key, value);
  });
  const resp = await fetch(`${API_ENDPOINT}/oauth2/token`, {
    method: "POST",
    body: new URLSearchParams(data),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then((res) => res.json());
  const me = await fetch(`${API_ENDPOINT}/users/@me`, {
    headers: { Authorization: `Bearer ${resp.access_token}` },
  }).then((res) => res.json());
  const guild_id = process.env.GUILD_ID;
  const discordUser = await (
    await client.guilds.fetch(guild_id)
  ).members.fetch({ user: me.id, force: true });
  console.log(discordUser)
  if (!discordUser) {
    res.status(400).send({ error: "Not part of the server!" });
    return;
  }

  discordUser.roles.resolve();

  const hasRole = discordUser.roles.cache.some(
    (role) => role.name === "DELTA FORCE"
  );
  if (!hasRole) {
    res.status(400).send({ error: "`Error: Role not found`" });
    return;
  }

  if (me && me.username) {
    const tx = new Transaction();
    let blockhash;
    const setBlockhash = async () => {
      blockhash = await (await connection.getRecentBlockhash()).blockhash;
    };

    while (!blockhash) {
      try {
        await setBlockhash();
      } catch {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1000);
        });
      }
    }

    tx.recentBlockhash = blockhash;
    tx.feePayer = wallet.publicKey;
    tx.add(
      new TransactionInstruction({
        keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: true }],
        data: Buffer.from(
          `${me.username}#${me.discriminator} (${me.id})`,
          "utf-8"
        ),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      })
    );
    wallet.signTransaction(tx);
    try {
      const id = await connection.sendRawTransaction(tx.serialize());
      logToDiscord(`
New Submission!
User: ${me.username}#${me.discriminator}
User-ID: <${me.id}>: 
Transaction: https://solscan.io/tx/${id}`);

      res.status(200).send(resp);
      return;
    } catch (e) {
      res.status(500).send(e);
      return;
    }
  }
});

module.exports = router;
