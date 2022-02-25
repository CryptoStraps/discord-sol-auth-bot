const {logToDiscord} = require("./_discord");
var express = require('express');
var router = express.Router();
const { Connection } = require("@solana/web3.js");
const connection = new Connection("https://alice.genesysgo.net");
const sleep = (time = 1000) =>
  new Promise((resolve, reject) => setTimeout(() => resolve(undefined), time));

async function getTxRecursively(txid) {
  const tx = await connection.getConfirmedTransaction(txid);
  if (tx) {
    const msg1 = tx.meta.logMessages.find((m) => m.includes("log: Signed by"));
    const msg2 = tx.meta.logMessages.find((m) => m.includes("log: Memo"));
    return `${msg1}
${msg2}`;
  }

  await sleep(1000);
  return await getTxRecursively(txid);
}

router.get('/', async function (req, res, next) {
  const { txid } = req.query;
  if (!txid) {
    res.status(400).send({ error: 'no txid specified' });
    return
  }
  const msg = await getTxRecursively(txid);
  logToDiscord(msg);
  res.status(200).send({ success: true });
});
module.exports = router;
