const logToDiscord = require("./_discord");
var express = require('express');
var router = express.Router();
const { Connection } = require("@solana/web3.js");
const connection = new Connection("https://alice.genesysgo.net");
const sleep = (time = 1000) =>
  new Promise((resolve, reject) => setTimeout(() => resolve(undefined), time));

router.get('/', async function (req, res, next) {
  const { txid } = req.query;
  if (!txid) {
    res.send({ error: 'no txid specified' });
    return
  }
  let confirmed;
  while (!confirmed) {
    const tx = await connection.getConfirmedTransaction(txid);
    if (tx) {
      const msg1 = tx.meta.logMessages.find((m) => m.includes("log: Signed by"));
      const msg2 = tx.meta.logMessages.find((m) => m.includes("log: Memo"));
      logToDiscord(`${msg1} ${msg2}`);
      confirmed = true;
      res.send({ success: true })
    }
    await sleep(1000);
  }
});
module.exports = router;
