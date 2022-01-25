// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const logToDiscord = require( "./_discord");
var express = require('express');
var router = express.Router();
const { Connection } = require("@solana/web3.js");
const connection = new Connection("https://alice.genesysgo.net");
const sleep = (time = 1000) =>
  new Promise((resolve, reject) => setTimeout(() => resolve(undefined), time));


/* GET home page. */
router.get('/', async function(req, res, next) {
  const { txid } = req.query;
  if (!txid) {
    res.send({});
    return
  }
  let confirmed;
  while (!confirmed) {
    const tx = await connection.getConfirmedTransaction(txid);
    if (tx) {
      const msg1 = tx.meta.logMessages.find((m) => m.includes("log: Signed by"));
      const msg2 = tx.meta.logMessages.find((m) => m.includes("log: Memo"));
      logToDiscord(`${msg1} ${msg2}`);
      console.log(tx);
      confirmed = true;
    }
    await sleep(1000);
  }
});
module.exports = router;
