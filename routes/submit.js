const {logToDiscord} = require("./_discord");
var express = require('express');
const nacl = require('tweetnacl');
const { PublicKey } = require("@solana/web3.js");
var router = express.Router();


router.get('/', async function (req, res, next) {
  const { signature, pubkey, discordId } = req.query;
  var buf = new TextEncoder().encode(discordId);
  console.log(Uint8Array.from(signature.split(',')))
  const verified = nacl.sign.detached.verify(
    buf,
    Uint8Array.from(signature.split(',')),
    new PublicKey(pubkey).toBytes()
  );
  console.log(verified)
//   const msg = await getTxRecursively(txid);
  logToDiscord(`user with discordId ${discordId} and pubkey ${pubkey} signed message with [${signature}]`);
  res.status(200).send({ success: true });
});
module.exports = router;
